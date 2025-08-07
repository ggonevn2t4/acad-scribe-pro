import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, writingStyle, currentText, action } = await req.json();
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    console.log('Writing assistant request:', { writingStyle, action });

    let prompt = '';
    
    if (action === 'improve') {
      prompt = `Improve the following text for ${writingStyle} writing style:

Context: ${context}
Current text: ${currentText}

Please provide:
1. Improved version of the text
2. Specific suggestions for enhancement
3. Grammar and style corrections
4. Readability improvements

Format as JSON:
{
  "improvedText": "The enhanced version",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "grammarFixes": ["Fix 1", "Fix 2"],
  "readabilityScore": "estimated readability level"
}`;
    } else if (action === 'continue') {
      prompt = `Continue writing the following text in ${writingStyle} style:

Context: ${context}
Current text: ${currentText}

Please provide a natural continuation that:
- Maintains the same tone and style
- Flows logically from the existing content
- Adds substantial value to the argument

Return only the continuation text as a string.`;
    } else if (action === 'rewrite') {
      prompt = `Rewrite the following text in ${writingStyle} style:

Context: ${context}
Current text: ${currentText}

Please rewrite to:
- Match the requested writing style
- Improve clarity and flow
- Maintain the original meaning
- Enhance academic rigor

Return only the rewritten text as a string.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://academic-ai.lovable.app',
        'X-Title': 'Academic AI Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert writing assistant specializing in academic and professional writing. Provide clear, actionable feedback and improvements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let result;

    if (action === 'improve') {
      try {
        result = JSON.parse(data.choices[0].message.content);
      } catch {
        // Fallback if JSON parsing fails
        result = {
          improvedText: data.choices[0].message.content,
          suggestions: [],
          grammarFixes: [],
          readabilityScore: "Unknown"
        };
      }
    } else {
      result = { text: data.choices[0].message.content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in writing-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});