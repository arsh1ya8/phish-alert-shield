
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisResult {
  isSafe: boolean;
  explanation: string;
  confidence: number;
}

interface ResultDisplayProps {
  result: AnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { isSafe, explanation, confidence } = result;

  return (
    <Card className={`shadow-lg border-2 ${isSafe ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          {isSafe ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-green-700">Email Appears Safe</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <span className="text-red-700">Possibly Phishing</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`text-lg font-medium ${isSafe ? 'text-green-800' : 'text-red-800'}`}>
            {explanation}
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Confidence Level:</span>
              <span className="font-medium">{confidence}%</span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 mt-1`}>
              <div 
                className={`h-2 rounded-full ${isSafe ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
          </div>

          {!isSafe && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Recommendation: Do not click any links or download attachments. 
                Contact the sender through official channels to verify.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
