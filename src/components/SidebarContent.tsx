
import React from 'react';
import ResultDisplay from '@/components/ResultDisplay';
import PersonalizedSafetyTips from '@/components/PersonalizedSafetyTips';
import ForwardedEmails from '@/components/ForwardedEmails';

interface AnalysisResult {
  isSafe: boolean;
  explanation: string;
  confidence: number;
}

interface SidebarContentProps {
  result: AnalysisResult | null;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* Result Display */}
      {result && <ResultDisplay result={result} />}
      
      {/* Personalized Safety Tips */}
      <PersonalizedSafetyTips />
      
      {/* Recent Email Analyses */}
      <ForwardedEmails />
    </div>
  );
};

export default SidebarContent;
