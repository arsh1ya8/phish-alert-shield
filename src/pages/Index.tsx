
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/AppHeader';
import EmailAnalysisForm from '@/components/EmailAnalysisForm';
import SidebarContent from '@/components/SidebarContent';

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
    
    try {
      console.log('Calling AI analysis...');
      
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-phishing', {
        body: {
          senderEmail: formData.senderEmail,
          subject: formData.subject,
          message: formData.message,
          links: formData.links,
          attachments: formData.attachments
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze email');
      }

      if (!analysisResult) {
        throw new Error('No analysis result received');
      }

      console.log('Analysis result:', analysisResult);
      
      setResult(analysisResult);
      
      // Save to database
      await savePhishingCheck(analysisResult);

    } catch (error: any) {
      console.error('Analysis error:', error);
      
      // Show fallback result if API key is missing or other error
      const fallbackResult: AnalysisResult = {
        isSafe: false,
        explanation: error.message.includes('API key') 
          ? "AI analysis unavailable - API key not configured. Please review manually for safety."
          : "Analysis failed. Please review the email manually for safety.",
        confidence: 60
      };
      
      setResult(fallbackResult);
      
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: error.message.includes('API key') 
          ? "AI analysis unavailable - please contact admin"
          : "Failed to analyze email",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
        <AppHeader 
          userEmail={user.email || ''} 
          onSignOut={handleSignOut} 
        />

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <EmailAnalysisForm
              formData={formData}
              onInputChange={handleInputChange}
              onAnalyze={handleAnalyze}
              onReset={resetForm}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Sidebar */}
          <SidebarContent result={result} />
        </div>
      </div>
    </div>
  );
};

export default Index;
