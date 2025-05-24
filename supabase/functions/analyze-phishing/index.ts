
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  senderEmail: string;
  subject: string;
  message: string;
  links?: string;
  attachments?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { senderEmail, subject, message, links, attachments }: AnalyzeRequest = await req.json();

    const prompt = `You are a cybersecurity expert analyzing emails for phishing indicators. 

Analyze this email and determine if it's safe or potentially phishing:

Sender: ${senderEmail}
Subject: ${subject}
Message: ${message}
${links ? `Links: ${links}` : ''}
${attachments ? `Attachments: ${attachments}` : ''}

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
- Dangerous file attachments

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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response if AI doesn't return valid JSON
      analysisResult = {
        isSafe: false,
        explanation: "Unable to analyze email properly. Please review manually for safety.",
        confidence: 60
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-phishing function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze email',
        isSafe: false,
        explanation: "Analysis failed. Please review the email manually for safety.",
        confidence: 60
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
