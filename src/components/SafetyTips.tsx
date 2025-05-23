
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SafetyTips: React.FC = () => {
  const tips = [
    {
      title: "Check the Sender",
      description: "Look for misspellings in email addresses and verify sender through official channels."
    },
    {
      title: "Don't Rush",
      description: "Phishers use urgent language to make you act quickly. Take time to verify."
    },
    {
      title: "Verify Links",
      description: "Hover over links to see where they really go. When in doubt, visit the official website directly."
    },
    {
      title: "Be Careful with Attachments",
      description: "Don't download unexpected attachments, especially .exe, .bat, or .scr files."
    },
    {
      title: "Trust Your Instincts",
      description: "If something feels off about an email, it probably is. When in doubt, don't interact with it."
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          Safety Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-800 mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Remember:</strong> This tool provides guidance but isn't 100% accurate. 
            Always use your best judgment and verify suspicious emails through official channels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyTips;
