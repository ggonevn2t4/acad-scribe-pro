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

    const prompt = `Vui lòng phân tích và tóm tắt tài liệu sau ${lengthInstruction} BẰNG TIẾNG VIỆT:

${content}

Cung cấp phản hồi theo định dạng JSON:
{
  "summary": "Nội dung tóm tắt chính",
  "keyInsights": [
    "Insight quan trọng 1",
    "Insight quan trọng 2",
    "Insight quan trọng 3",
    "Insight quan trọng 4",
    "Insight quan trọng 5"
  ],
  "mainTopics": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"],
  "wordCount": số_từ_trong_bản_gốc
}

Tập trung vào:
- Các luận điểm và kết luận chính
- Dữ liệu và bằng chứng quan trọng
- Phương pháp tiếp cận quan trọng
- Những phát hiện hoặc kết quả có ý nghĩa

LƯU Ý: Tất cả nội dung phải bằng tiếng Việt.`;

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
            content: 'Bạn là một chuyên gia phân tích tài liệu. Tạo các bản tóm tắt toàn diện nhưng súc tích, nắm bắt được bản chất của các tài liệu học thuật và chuyên nghiệp. Luôn phản hồi bằng JSON hợp lệ và sử dụng TIẾNG VIỆT.'
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