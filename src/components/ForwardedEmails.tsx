
import React, { useState, useEffect } from 'react';
import { Mail, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ForwardedEmail {
  id: string;
  sender_email: string;
  subject: string;
  email_body: string;
  analysis_result: string;
  reasoning: string;
  confidence: number;
  processed_at: string;
}

const ForwardedEmails: React.FC = () => {
  const [forwardedEmails, setForwardedEmails] = useState<ForwardedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchForwardedEmails();
  }, []);

  const fetchForwardedEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('forwarded_email_checks')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setForwardedEmails(data || []);
    } catch (error: any) {
      console.error('Error fetching forwarded emails:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load forwarded email analyses.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Recent Forwarded Emails
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Recent Forwarded Emails
          </div>
          <Button onClick={fetchForwardedEmails} variant="outline" size="sm">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {forwardedEmails.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No forwarded emails yet.</p>
            <p className="text-sm mt-2">
              Forward suspicious emails to <strong>phishshieldapp@gmail.com</strong> to analyze them automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {forwardedEmails.map((email) => (
              <div key={email.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {email.analysis_result === 'Safe' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge 
                        variant={email.analysis_result === 'Safe' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {email.analysis_result}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {email.confidence}% confidence
                      </span>
                    </div>
                    <h4 className="font-medium truncate">{email.subject}</h4>
                    <p className="text-sm text-gray-600 truncate">From: {email.sender_email}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 ml-4">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(email.processed_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{email.reasoning}</p>
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                    View email content
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                    {email.email_body.substring(0, 500)}
                    {email.email_body.length > 500 && '...'}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForwardedEmails;
