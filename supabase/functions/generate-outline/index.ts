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
    const { topic, academicLevel, wordCount, userId } = await req.json();
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    console.log('Generating outline for:', { topic, academicLevel, wordCount });

    const prompt = `Create a detailed academic outline for the following topic:

Topic: ${topic}
Academic Level: ${academicLevel}
Target Word Count: ${wordCount}

Please generate a comprehensive outline with:
1. Main sections (3-5 major points)
2. Subsections for each main point
3. Key arguments and evidence needed
4. Conclusion points

Format the response as a JSON object with this structure:
{
  "title": "Suggested title for the paper",
  "sections": [
    {
      "title": "Section title",
      "subsections": [
        {
          "title": "Subsection title",
          "points": ["Key point 1", "Key point 2"],
          "evidence": ["Evidence type needed"]
        }
      ]
    }
  ],
  "conclusion": ["Key conclusion points"]
}`;

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
            content: 'You are an expert academic writing assistant. Create detailed, well-structured outlines for academic papers. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const outlineContent = JSON.parse(data.choices[0].message.content);

    // Save to database if userId provided
    if (userId) {
      const supabaseUrl = "https://uixogobytjepprqjvvtw.supabase.co";
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('outlines').insert({
          user_id: userId,
          title: outlineContent.title,
          topic,
          academic_level: academicLevel,
          word_count: wordCount,
          content: outlineContent,
        });
      }
    }

    return new Response(JSON.stringify({ outline: outlineContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});