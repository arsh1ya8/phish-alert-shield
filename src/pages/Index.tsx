
import React, { useState, useEffect } from 'react';
import { Shield, Mail, AlertTriangle, CheckCircle, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PhishingAnalyzer from '@/components/PhishingAnalyzer';
import ResultDisplay from '@/components/ResultDisplay';
import SafetyTips from '@/components/SafetyTips';

interface AnalysisResult {
  isSafe: boolean;
  explanation: string;
  confidence: number;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    senderEmail: '',
    subject: '',
    message: '',
    links: '',
    attachments: ''
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const savePhishingCheck = async (analysisResult: AnalysisResult) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('phishing_checks')
        .insert({
          user_id: user.id,
          email_from: formData.senderEmail,
          email_subject: formData.subject,
          email_body: formData.message,
          links_found: formData.links || null,
          analysis_result: analysisResult.isSafe ? 'Safe' : 'Possibly Phishing',
          reasoning: analysisResult.explanation
        });

      if (error) throw error;

      toast({
        title: "Analysis Saved",
        description: "Your email analysis has been saved to your history.",
      });
    } catch (error: any) {
      console.error('Error saving phishing check:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save analysis to your history.",
      });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysisResult = PhishingAnalyzer.analyze(formData);
    setResult(analysisResult);
    setIsAnalyzing(false);

    // Save to database
    await savePhishingCheck(analysisResult);
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-800">PhishShield</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{user.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
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
