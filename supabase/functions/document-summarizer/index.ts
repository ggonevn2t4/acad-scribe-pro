import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, summaryLength, fileName, userId } = await req.json();
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    console.log('Summarizing document:', { summaryLength, fileName });

    let lengthInstruction = '';
    switch (summaryLength) {
      case 'short':
        lengthInstruction = 'in 2-3 sentences';
        break;
      case 'medium':
        lengthInstruction = 'in 1-2 paragraphs (100-200 words)';
        break;
      case 'long':
        lengthInstruction = 'in 3-4 paragraphs (300-500 words)';
        break;
      default:
        lengthInstruction = 'in 1-2 paragraphs';
    }

    const prompt = `Please analyze and summarize the following document ${lengthInstruction}:

${content}

Provide your response in JSON format:
{
  "summary": "The main summary text",
  "keyInsights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3",
    "Key insight 4",
    "Key insight 5"
  ],
  "mainTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "wordCount": number_of_words_in_original
}

Focus on:
- Main arguments and conclusions
- Key evidence and data points
- Important methodologies or approaches
- Significant findings or results`;

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
            content: 'You are an expert document analyzer. Create comprehensive yet concise summaries that capture the essence of academic and professional documents. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const summaryData = JSON.parse(data.choices[0].message.content);

    // Save to database if userId provided
    if (userId) {
      const supabaseUrl = "https://uixogobytjepprqjvvtw.supabase.co";
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('summaries').insert({
          user_id: userId,
          original_title: fileName || 'Untitled Document',
          file_name: fileName,
          content: content.substring(0, 10000), // Store first 10k chars
          summary: summaryData.summary,
          key_insights: summaryData.keyInsights,
          summary_length: summaryLength,
        });
      }
    }

    return new Response(JSON.stringify(summaryData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in document-summarizer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});