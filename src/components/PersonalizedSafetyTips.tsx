
import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SafetyTip {
  category: string;
  tip: string;
  icon: React.ReactNode;
  severity: 'info' | 'warning' | 'danger';
}

const PersonalizedSafetyTips: React.FC = () => {
  const { user } = useAuth();
  const [safetyTips, setSafetyTips] = useState<SafetyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalChecks: 0,
    phishingCount: 0,
    safeCount: 0,
    commonPatterns: [] as string[]
  });

  useEffect(() => {
    if (user) {
      analyzeUserData();
    }
  }, [user]);

  const analyzeUserData = async () => {
    if (!user) return;

    try {
      const { data: checks, error } = await supabase
        .from('phishing_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!checks || checks.length === 0) {
        setSafetyTips(getDefaultTips());
        setLoading(false);
        return;
      }

      // Analyze user patterns
      const totalChecks = checks.length;
      const phishingCount = checks.filter(check => check.analysis_result !== 'Safe').length;
      const safeCount = totalChecks - phishingCount;

      // Analyze common patterns in phishing emails
      const phishingChecks = checks.filter(check => check.analysis_result !== 'Safe');
      const patterns = analyzePatterns(phishingChecks);

      setUserStats({
        totalChecks,
        phishingCount,
        safeCount,
        commonPatterns: patterns
      });

      // Generate personalized tips based on analysis
      const personalizedTips = generatePersonalizedTips(patterns, phishingCount, totalChecks);
      setSafetyTips(personalizedTips);

    } catch (error) {
      console.error('Error analyzing user data:', error);
      setSafetyTips(getDefaultTips());
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = (phishingChecks: any[]): string[] => {
    const patterns: string[] = [];
    
    // Check for urgency patterns
    const urgentKeywords = ['urgent', 'immediate', 'expire', 'suspend', 'act now'];
    const urgentEmails = phishingChecks.filter(check => 
      urgentKeywords.some(keyword => 
        check.email_subject.toLowerCase().includes(keyword) ||
        check.email_body.toLowerCase().includes(keyword)
      )
    );
    if (urgentEmails.length > phishingChecks.length * 0.4) {
      patterns.push('urgency');
    }

    // Check for personal info requests
    const personalInfoKeywords = ['verify', 'confirm', 'update', 'personal', 'account', 'password'];
    const personalInfoEmails = phishingChecks.filter(check =>
      personalInfoKeywords.some(keyword =>
        check.email_body.toLowerCase().includes(keyword)
      )
    );
    if (personalInfoEmails.length > phishingChecks.length * 0.3) {
      patterns.push('personal_info');
    }

    // Check for suspicious links
    const linkEmails = phishingChecks.filter(check => check.links_found && check.links_found.trim() !== '');
    if (linkEmails.length > phishingChecks.length * 0.5) {
      patterns.push('suspicious_links');
    }

    // Check for financial themes
    const financialKeywords = ['bank', 'payment', 'refund', 'money', 'prize', 'winner'];
    const financialEmails = phishingChecks.filter(check =>
      financialKeywords.some(keyword =>
        check.email_subject.toLowerCase().includes(keyword) ||
        check.email_body.toLowerCase().includes(keyword)
      )
    );
    if (financialEmails.length > phishingChecks.length * 0.3) {
      patterns.push('financial');
    }

    return patterns;
  };

  const generatePersonalizedTips = (patterns: string[], phishingCount: number, totalChecks: number): SafetyTip[] => {
    const tips: SafetyTip[] = [];

    // Risk level assessment
    const riskLevel = phishingCount / totalChecks;
    
    if (riskLevel > 0.5) {
      tips.push({
        category: 'High Risk Alert',
        tip: `You've encountered ${phishingCount} suspicious emails out of ${totalChecks} checks. Consider being extra cautious with all incoming emails.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        severity: 'danger'
      });
    }

    // Pattern-based tips
    if (patterns.includes('urgency')) {
      tips.push({
        category: 'Urgency Pattern',
        tip: "You often receive emails with urgent language. Remember: legitimate companies rarely demand immediate action via email.",
        icon: <TrendingUp className="h-4 w-4" />,
        severity: 'warning'
      });
    }

    if (patterns.includes('personal_info')) {
      tips.push({
        category: 'Personal Information',
        tip: "Many suspicious emails you've checked request personal information. Never share sensitive details via email replies.",
        icon: <Shield className="h-4 w-4" />,
        severity: 'warning'
      });
    }

    if (patterns.includes('suspicious_links')) {
      tips.push({
        category: 'Link Safety',
        tip: "You frequently check emails with links. Always hover over links to see the real destination before clicking.",
        icon: <Info className="h-4 w-4" />,
        severity: 'info'
      });
    }

    if (patterns.includes('financial')) {
      tips.push({
        category: 'Financial Scams',
        tip: "You've seen several financial-themed phishing attempts. Always verify financial communications through official channels.",
        icon: <AlertTriangle className="h-4 w-4" />,
        severity: 'warning'
      });
    }

    // If user has good judgment
    if (riskLevel < 0.2 && totalChecks > 5) {
      tips.push({
        category: 'Good Security Awareness',
        tip: "Great job! You're doing well at identifying safe emails. Keep using your security awareness.",
        icon: <Shield className="h-4 w-4" />,
        severity: 'info'
      });
    }

    return tips.length > 0 ? tips : getDefaultTips();
  };

  const getDefaultTips = (): SafetyTip[] => [
    {
      category: 'Getting Started',
      tip: "Check more emails to get personalized safety tips based on your patterns.",
      icon: <Info className="h-4 w-4" />,
      severity: 'info'
    },
    {
      category: 'General Safety',
      tip: "Always verify sender identity through official channels when in doubt.",
      icon: <Shield className="h-4 w-4" />,
      severity: 'info'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Personalized Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          Your Personalized Safety Tips
        </CardTitle>
        {userStats.totalChecks > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            Based on your {userStats.totalChecks} email checks: {userStats.safeCount} safe, {userStats.phishingCount} suspicious
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safetyTips.map((tip, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getSeverityColor(tip.severity)} className="text-xs">
                      {tip.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedSafetyTips;
