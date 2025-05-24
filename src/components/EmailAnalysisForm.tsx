
import React, { useState } from 'react';
import { Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface FormData {
  senderEmail: string;
  subject: string;
  message: string;
  links: string;
  attachments: string;
}

interface EmailAnalysisFormProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
}

const EmailAnalysisForm: React.FC<EmailAnalysisFormProps> = ({
  formData,
  onInputChange,
  onAnalyze,
  onReset,
  isAnalyzing
}) => {
  const isFormValid = formData.senderEmail && formData.subject && formData.message;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Mail className="h-6 w-6 mr-2 text-blue-600" />
          AI Email Analysis
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
            onChange={(e) => onInputChange('senderEmail', e.target.value)}
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
            onChange={(e) => onInputChange('subject', e.target.value)}
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
            onChange={(e) => onInputChange('message', e.target.value)}
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
            onChange={(e) => onInputChange('links', e.target.value)}
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
            onChange={(e) => onInputChange('attachments', e.target.value)}
            className="mt-2 text-lg h-12"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={onAnalyze}
            disabled={!isFormValid || isAnalyzing}
            className="flex-1 h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                AI Analyzing...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Check Email
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="h-14 px-8 text-lg"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailAnalysisForm;
