
import React, { useState } from 'react';
import { Shield, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PhishingAnalyzer from '@/components/PhishingAnalyzer';
import ResultDisplay from '@/components/ResultDisplay';
import SafetyTips from '@/components/SafetyTips';

interface AnalysisResult {
  isSafe: boolean;
  explanation: string;
  confidence: number;
}

const Index = () => {
  const [formData, setFormData] = useState({
    senderEmail: '',
    subject: '',
    message: '',
    links: '',
    attachments: ''
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysisResult = PhishingAnalyzer.analyze(formData);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const resetForm = () => {
    setFormData({
      senderEmail: '',
      subject: '',
      message: '',
      links: '',
      attachments: ''
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">PhishShield</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Protect yourself from phishing emails. Enter email details below to check for suspicious content.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Mail className="h-6 w-6 mr-2 text-blue-600" />
                  Email Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="sender" className="text-lg font-medium">
                    Sender's Email Address *
                  </Label>
                  <Input
                    id="sender"
                    type="email"
                    placeholder="e.g., support@company.com"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    className="mt-2 text-lg h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-lg font-medium">
                    Email Subject *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Urgent: Verify Your Account"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="mt-2 text-lg h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-lg font-medium">
                    Main Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Paste the main content of the email here..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="mt-2 text-lg min-h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="links" className="text-lg font-medium">
                    Links (Optional)
                  </Label>
                  <Textarea
                    id="links"
                    placeholder="Paste any links from the email, one per line..."
                    value={formData.links}
                    onChange={(e) => handleInputChange('links', e.target.value)}
                    className="mt-2 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="attachments" className="text-lg font-medium">
                    Attachment Names (Optional)
                  </Label>
                  <Input
                    id="attachments"
                    placeholder="e.g., invoice.pdf, document.exe"
                    value={formData.attachments}
                    onChange={(e) => handleInputChange('attachments', e.target.value)}
                    className="mt-2 text-lg h-12"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!formData.senderEmail || !formData.subject || !formData.message || isAnalyzing}
                    className="flex-1 h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Check Email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="h-14 px-8 text-lg"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Result Display */}
            {result && <ResultDisplay result={result} />}
            
            {/* Safety Tips */}
            <SafetyTips />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
