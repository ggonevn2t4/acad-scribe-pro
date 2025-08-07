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
      prompt = `Định dạng citation sau theo chuẩn ${citationStyle}:

Citation gốc: ${rawCitation}

Vui lòng phân tích citation và cung cấp:
1. Citation được định dạng đúng chuẩn
2. Thông tin thư mục được trích xuất
3. Loại citation (sách, bài báo, website, v.v.)

Định dạng JSON:
{
  "formattedCitation": "Citation được định dạng đúng chuẩn",
  "title": "Tiêu đề công trình",
  "author": "Tên tác giả",
  "publicationYear": năm_xuất_bản,
  "sourceType": "sách/bài_báo/website/v.v.",
  "publisher": "Tên nhà xuất bản nếu có",
  "url": "URL nếu có",
  "doi": "DOI nếu có"
}

LƯU Ý: Giữ nguyên các thông tin như tên tác giả, tiêu đề bằng ngôn ngữ gốc. Chỉ dịch các trường mô tả như sourceType sang tiếng Việt.`;
    } else if (action === 'convert') {
      prompt = `Chuyển đổi citation sau từ định dạng hiện tại sang chuẩn ${citationStyle}:

Citation: ${rawCitation}

Chỉ cung cấp citation được định dạng đúng theo hướng dẫn ${citationStyle}.`;
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
            content: `Bạn là một chuyên gia về các định dạng citation học thuật bao gồm APA, MLA, Chicago, Harvard và các chuẩn khác. Định dạng các citation chính xác theo hướng dẫn mới nhất. Sử dụng tiếng Việt cho các mô tả.`
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