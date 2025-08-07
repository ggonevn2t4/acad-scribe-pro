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
    const { rawCitation, citationStyle, action, userId } = await req.json();
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    console.log('Citation management request:', { citationStyle, action });

    let prompt = '';
    
    if (action === 'format') {
      prompt = `Format the following citation according to ${citationStyle} style:

Raw citation: ${rawCitation}

Please analyze the citation and provide:
1. Properly formatted citation
2. Extracted bibliographic information
3. Citation type (book, journal article, website, etc.)

Format as JSON:
{
  "formattedCitation": "Properly formatted citation",
  "title": "Title of work",
  "author": "Author name(s)",
  "publicationYear": year_number,
  "sourceType": "book/journal/website/etc",
  "publisher": "Publisher name if applicable",
  "url": "URL if applicable",
  "doi": "DOI if applicable"
}`;
    } else if (action === 'convert') {
      prompt = `Convert the following citation from its current format to ${citationStyle} style:

Citation: ${rawCitation}

Provide only the properly formatted citation according to ${citationStyle} guidelines.`;
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
            content: `You are an expert in academic citation formats including APA, MLA, Chicago, Harvard, and other styles. Format citations accurately according to the latest guidelines.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let result;

    if (action === 'format') {
      try {
        result = JSON.parse(data.choices[0].message.content);
        
        // Save to database if userId provided
        if (userId) {
          const supabaseUrl = "https://uixogobytjepprqjvvtw.supabase.co";
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          
          if (supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            
            await supabase.from('citations').insert({
              user_id: userId,
              title: result.title,
              author: result.author,
              publication_year: result.publicationYear,
              source_type: result.sourceType,
              citation_style: citationStyle,
              raw_citation: rawCitation,
              formatted_citation: result.formattedCitation,
            });
          }
        }
      } catch {
        result = { formattedCitation: data.choices[0].message.content };
      }
    } else {
      result = { formattedCitation: data.choices[0].message.content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in citation-manager function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});