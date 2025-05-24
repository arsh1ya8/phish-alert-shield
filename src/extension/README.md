
# PhishShield Chrome Extension

## Installation Instructions

### For Development
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `src/extension` folder
4. The extension should now appear in your extensions list

### Setup
1. Click the PhishShield extension icon in your Chrome toolbar
2. Enter your Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z29ndGVubml5empmemN3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjU1MzgsImV4cCI6MjA2MzYwMTUzOH0.YENTTFp9Wt7BCQ9QN66wxHYhmiGy-Fjz9uBrLIanhWQ`
3. Click "Save Settings"

### Usage
1. Open Gmail in Chrome
2. Navigate to any email
3. Look for the "PhishShield" button next to the email controls
4. Click the button to analyze the email for phishing indicators
5. View the results displayed below the email header

### Features
- ✅ Real-time phishing analysis
- ✅ Integration with your PhishShield web app
- ✅ Visual safety indicators
- ✅ Secure local storage of API keys
- ✅ Works with Gmail's dynamic interface

### Notes
- The extension uses your existing PhishShield AI analysis
- All analysis is performed securely through your Supabase backend
- Results are displayed temporarily and auto-hide after 10 seconds
- API keys are stored locally in your browser for security
