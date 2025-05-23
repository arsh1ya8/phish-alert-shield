
interface EmailData {
  senderEmail: string;
  subject: string;
  message: string;
  links: string;
  attachments: string;
}

interface AnalysisResult {
  isSafe: boolean;
  explanation: string;
  confidence: number;
}

class PhishingAnalyzer {
  private static suspiciousWords = [
    'urgent', 'immediate', 'verify', 'suspend', 'expire', 'click here',
    'act now', 'limited time', 'congratulations', 'winner', 'free',
    'prize', 'claim', 'tax refund', 'suspended', 'locked'
  ];

  private static suspiciousDomains = [
    'bankk.com', 'paypaI.com', 'amazon.co', 'microsft.com', 'gooogle.com',
    'appIe.com', 'faceboook.com', 'instagramm.com'
  ];

  private static dangerousExtensions = [
    '.exe', '.bat', '.scr', '.com', '.pif', '.vbs', '.js'
  ];

  static analyze(data: EmailData): AnalysisResult {
    let riskScore = 0;
    const issues: string[] = [];

    // Check sender email
    const senderIssues = this.analyzeSender(data.senderEmail);
    riskScore += senderIssues.score;
    if (senderIssues.issue) issues.push(senderIssues.issue);

    // Check subject
    const subjectIssues = this.analyzeSubject(data.subject);
    riskScore += subjectIssues.score;
    if (subjectIssues.issue) issues.push(subjectIssues.issue);

    // Check message content
    const messageIssues = this.analyzeMessage(data.message);
    riskScore += messageIssues.score;
    if (messageIssues.issue) issues.push(messageIssues.issue);

    // Check links
    if (data.links) {
      const linkIssues = this.analyzeLinks(data.links);
      riskScore += linkIssues.score;
      if (linkIssues.issue) issues.push(linkIssues.issue);
    }

    // Check attachments
    if (data.attachments) {
      const attachmentIssues = this.analyzeAttachments(data.attachments);
      riskScore += attachmentIssues.score;
      if (attachmentIssues.issue) issues.push(attachmentIssues.issue);
    }

    const isSafe = riskScore < 3;
    const explanation = this.generateExplanation(isSafe, issues);

    return {
      isSafe,
      explanation,
      confidence: Math.min(95, Math.max(60, 100 - (riskScore * 10)))
    };
  }

  private static analyzeSender(email: string): { score: number; issue?: string } {
    const lowercaseEmail = email.toLowerCase();
    
    // Check for suspicious domains
    for (const domain of this.suspiciousDomains) {
      if (lowercaseEmail.includes(domain)) {
        return { score: 4, issue: 'suspicious domain' };
      }
    }

    // Check for common misspellings
    if (this.hasSuspiciousSpelling(email)) {
      return { score: 3, issue: 'suspicious spelling' };
    }

    // Check for random characters
    if (this.hasRandomCharacters(email)) {
      return { score: 2, issue: 'unusual sender format' };
    }

    return { score: 0 };
  }

  private static analyzeSubject(subject: string): { score: number; issue?: string } {
    const lowercaseSubject = subject.toLowerCase();
    let score = 0;

    for (const word of this.suspiciousWords) {
      if (lowercaseSubject.includes(word)) {
        score += 1;
      }
    }

    if (score > 0) {
      return { score: Math.min(score, 3), issue: 'urgent or suspicious language' };
    }

    return { score: 0 };
  }

  private static analyzeMessage(message: string): { score: number; issue?: string } {
    const lowercaseMessage = message.toLowerCase();
    let score = 0;
    const issues: string[] = [];

    // Check for suspicious words
    let suspiciousWordCount = 0;
    for (const word of this.suspiciousWords) {
      if (lowercaseMessage.includes(word)) {
        suspiciousWordCount++;
      }
    }

    if (suspiciousWordCount > 2) {
      score += 2;
      issues.push('multiple urgent phrases');
    }

    // Check for poor grammar/spelling
    if (this.hasPoorGrammar(message)) {
      score += 1;
      issues.push('poor grammar');
    }

    // Check for generic greetings
    if (this.hasGenericGreeting(lowercaseMessage)) {
      score += 1;
      issues.push('generic greeting');
    }

    return { 
      score: Math.min(score, 3), 
      issue: issues.length > 0 ? issues.join(', ') : undefined 
    };
  }

  private static analyzeLinks(links: string): { score: number; issue?: string } {
    const linkList = links.split('\n').filter(link => link.trim());
    let score = 0;

    for (const link of linkList) {
      if (this.isSuspiciousLink(link.trim())) {
        score += 2;
        return { score, issue: 'suspicious or shortened links' };
      }
    }

    return { score: 0 };
  }

  private static analyzeAttachments(attachments: string): { score: number; issue?: string } {
    const attachmentList = attachments.split(',').map(a => a.trim());
    
    for (const attachment of attachmentList) {
      for (const ext of this.dangerousExtensions) {
        if (attachment.toLowerCase().endsWith(ext)) {
          return { score: 4, issue: 'dangerous file type' };
        }
      }
    }

    return { score: 0 };
  }

  private static hasSuspiciousSpelling(email: string): boolean {
    const commonDomains = ['gmail', 'yahoo', 'outlook', 'hotmail', 'amazon', 'paypal', 'microsoft', 'apple'];
    const emailLower = email.toLowerCase();
    
    for (const domain of commonDomains) {
      if (emailLower.includes(domain.substring(0, -1)) || 
          emailLower.includes(domain + '1') ||
          emailLower.includes(domain.replace('o', '0'))) {
        return true;
      }
    }
    
    return false;
  }

  private static hasRandomCharacters(email: string): boolean {
    const beforeAt = email.split('@')[0];
    const randomPattern = /[0-9]{4,}|[a-z]{10,}/i;
    return randomPattern.test(beforeAt);
  }

  private static hasPoorGrammar(message: string): boolean {
    const grammarIssues = [
      /[a-z]\.[A-Z]/,  // Missing space after period
      /\s{2,}/,        // Multiple spaces
      /[a-z],[A-Z]/,   // Missing space after comma
    ];
    
    return grammarIssues.some(pattern => pattern.test(message));
  }

  private static hasGenericGreeting(message: string): boolean {
    const genericGreetings = ['dear customer', 'dear user', 'dear sir/madam', 'hello user'];
    return genericGreetings.some(greeting => message.includes(greeting));
  }

  private static isSuspiciousLink(link: string): boolean {
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co/,           // URL shorteners
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      /[a-z0-9]{10,}\.com/,             // Random domain names
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(link.toLowerCase()));
  }

  private static generateExplanation(isSafe: boolean, issues: string[]): string {
    if (isSafe) {
      return "This email appears safe with no major red flags detected.";
    } else {
      const primaryIssue = issues[0] || 'suspicious content';
      return `This email shows warning signs including ${primaryIssue}. Be cautious with links and attachments.`;
    }
  }
}

export default PhishingAnalyzer;
