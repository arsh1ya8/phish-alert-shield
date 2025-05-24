
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  from: string;
  subject: string;
  text: string;
  html?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing forwarded email...');
    
    // Parse the incoming email data from Resend webhook
    const emailData: EmailData = await req.json();
    
    console.log('Email data received:', {
      from: emailData.from,
      subject: emailData.subject,
      textLength: emailData.text?.length || 0
    });

    // Extract email content
    const senderEmail = emailData.from;
    const subject = emailData.subject;
    const message = emailData.text || emailData.html || '';

    // Analyze the email using AI
    let analysisResult;
    
    if (openAIApiKey) {
      console.log('Analyzing with OpenAI...');
      
      const prompt = `You are a cybersecurity expert analyzing emails for phishing indicators. 

Analyze this forwarded email and determine if it's safe or potentially phishing:

Sender: ${senderEmail}
Subject: ${subject}
Message: ${message}

Respond with a JSON object containing:
- isSafe: boolean (true if safe, false if potentially phishing)
- explanation: string (brief explanation of your assessment)
- confidence: number (confidence level from 60-95)

Look for these phishing indicators:
- Suspicious sender domains or misspellings
- Urgent/threatening language
- Suspicious links or URL shorteners
- Generic greetings
- Poor grammar/spelling
- Requests for personal information

Be conservative - err on the side of caution for user safety.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a cybersecurity expert. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        try {
          analysisResult = JSON.parse(aiResponse);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          analysisResult = {
            isSafe: false,
            explanation: "AI analysis failed. Please review manually for safety.",
            confidence: 60
          };
        }
      } else {
        throw new Error('OpenAI API request failed');
      }
    } else {
      // Fallback analysis without API key
      analysisResult = {
        isSafe: false,
        explanation: "Email forwarding received but AI analysis unavailable. Please review manually.",
        confidence: 60
      };
    }

    console.log('Analysis result:', analysisResult);

    // Store the forwarded email analysis in the database
    // For now, we'll store it without a specific user_id since it's forwarded
    const { data: insertData, error: insertError } = await supabase
      .from('forwarded_email_checks')
      .insert({
        sender_email: senderEmail,
        subject: subject,
        email_body: message,
        analysis_result: analysisResult.isSafe ? 'Safe' : 'Possibly Phishing',
        reasoning: analysisResult.explanation,
        confidence: analysisResult.confidence,
        processed_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing forwarded email:', insertError);
    } else {
      console.log('Forwarded email stored successfully');
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      message: 'Email processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing forwarded email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process forwarded email',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
