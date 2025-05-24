
// PhishShield Gmail Integration
class PhishShieldGmail {
  constructor() {
    this.apiUrl = 'https://dxgogtenniyzjfzcwodn.supabase.co/functions/v1/analyze-phishing';
    this.init();
  }

  init() {
    // Wait for Gmail to load
    this.waitForGmail();
  }

  waitForGmail() {
    const checkGmail = () => {
      const emailContainer = document.querySelector('[role="main"]');
      if (emailContainer) {
        this.injectPhishShieldButton();
        this.observeEmailChanges();
      } else {
        setTimeout(checkGmail, 1000);
      }
    };
    checkGmail();
  }

  observeEmailChanges() {
    // Watch for navigation changes in Gmail
    const observer = new MutationObserver(() => {
      this.injectPhishShieldButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  injectPhishShieldButton() {
    // Remove existing buttons to avoid duplicates
    document.querySelectorAll('.phishshield-button').forEach(btn => btn.remove());

    // Find email headers and inject button
    const emailHeaders = document.querySelectorAll('[data-message-id]');
    
    emailHeaders.forEach(header => {
      if (header.querySelector('.phishshield-button')) return;

      const toolbar = header.querySelector('[role="toolbar"]');
      if (toolbar) {
        const button = this.createPhishShieldButton(header);
        toolbar.appendChild(button);
      }
    });
  }

  createPhishShieldButton(emailHeader) {
    const button = document.createElement('div');
    button.className = 'phishshield-button';
    button.innerHTML = `
      <button class="phishshield-check-btn" title="Check with PhishShield">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        PhishShield
      </button>
    `;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.analyzeEmail(emailHeader);
    });

    return button;
  }

  extractEmailData(emailHeader) {
    try {
      // Find sender email
      const senderElement = emailHeader.querySelector('[email]');
      const senderEmail = senderElement ? senderElement.getAttribute('email') : 'Unknown';

      // Find subject
      const subjectElement = emailHeader.querySelector('h2') || emailHeader.querySelector('[data-thread-id]');
      const subject = subjectElement ? subjectElement.textContent.trim() : 'No Subject';

      // Find email body
      const bodyElement = emailHeader.closest('[data-message-id]').querySelector('[dir="ltr"]');
      const emailBody = bodyElement ? bodyElement.textContent.trim() : 'No content';

      // Find links
      const linkElements = emailHeader.closest('[data-message-id]').querySelectorAll('a[href]');
      const links = Array.from(linkElements)
        .map(link => link.href)
        .filter(href => href && !href.startsWith('mailto:'))
        .join('\n');

      return {
        senderEmail,
        subject,
        message: emailBody.substring(0, 2000), // Limit length
        links: links || '',
        attachments: ''
      };
    } catch (error) {
      console.error('Error extracting email data:', error);
      return null;
    }
  }

  async analyzeEmail(emailHeader) {
    const button = emailHeader.querySelector('.phishshield-check-btn');
    if (!button) return;

    // Show loading state
    const originalContent = button.innerHTML;
    button.innerHTML = `
      <div class="phishshield-spinner"></div>
      Analyzing...
    `;
    button.disabled = true;

    try {
      const emailData = this.extractEmailData(emailHeader);
      if (!emailData) {
        throw new Error('Could not extract email data');
      }

      // Get API key from storage
      const result = await chrome.storage.sync.get(['apiKey']);
      if (!result.apiKey) {
        this.showResult(emailHeader, {
          isSafe: false,
          explanation: 'Please set your API key in the PhishShield extension settings.',
          confidence: 0
        }, 'warning');
        return;
      }

      // Call PhishShield API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.apiKey}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await response.json();
      this.showResult(emailHeader, analysisResult);

    } catch (error) {
      console.error('PhishShield analysis error:', error);
      this.showResult(emailHeader, {
        isSafe: false,
        explanation: 'Analysis failed. Please try again or check your settings.',
        confidence: 0
      }, 'error');
    } finally {
      // Restore button
      button.innerHTML = originalContent;
      button.disabled = false;
    }
  }

  showResult(emailHeader, result, type = 'result') {
    // Remove existing results
    emailHeader.querySelectorAll('.phishshield-result').forEach(el => el.remove());

    const resultDiv = document.createElement('div');
    resultDiv.className = `phishshield-result ${type}`;
    
    let bgColor, textColor, icon;
    if (type === 'warning') {
      bgColor = '#fff3cd';
      textColor = '#856404';
      icon = '⚠️';
    } else if (type === 'error') {
      bgColor = '#f8d7da';
      textColor = '#721c24';
      icon = '❌';
    } else if (result.isSafe) {
      bgColor = '#d4edda';
      textColor = '#155724';
      icon = '✅';
    } else {
      bgColor = '#f8d7da';
      textColor = '#721c24';
      icon = '❌';
    }

    resultDiv.innerHTML = `
      <div style="
        background-color: ${bgColor};
        color: ${textColor};
        padding: 8px 12px;
        border-radius: 4px;
        margin: 8px 0;
        font-size: 13px;
        border: 1px solid ${textColor}33;
      ">
        <strong>${icon} PhishShield Analysis:</strong><br>
        ${result.explanation}
        ${result.confidence > 0 ? `<br><small>Confidence: ${result.confidence}%</small>` : ''}
      </div>
    `;

    // Insert result after the email header
    emailHeader.appendChild(resultDiv);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      resultDiv.style.opacity = '0';
      setTimeout(() => resultDiv.remove(), 500);
    }, 10000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PhishShieldGmail());
} else {
  new PhishShieldGmail();
}
