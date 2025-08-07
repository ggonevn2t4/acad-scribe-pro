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
    const { text, fileName, userId } = await req.json();
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    console.log('Checking plagiarism for:', { fileName, textLength: text.length });

    // Simulate plagiarism detection using AI analysis
    const prompt = `Phân tích văn bản sau để phát hiện khả năng đạo văn và cung cấp gợi ý paraphrase BẰNG TIẾNG VIỆT:

Văn bản: ${text}

Vui lòng:
1. Ước tính phần trăm tương đồng có thể có (dựa trên mức độ generic của văn bản)
2. Xác định các cụm từ có thể bị đạo văn
3. Đề xuất các nguồn tài liệu tiềm năng
4. Cung cấp gợi ý paraphrase cho các phần nghi ngờ

Định dạng JSON:
{
  "similarityPercentage": số_phần_trăm,
  "suspiciousPhrases": [
    {
      "text": "cụm từ nghi ngờ",
      "startPosition": vị_trí_bắt_đầu,
      "endPosition": vị_trí_kết_thúc,
      "riskLevel": "high/medium/low"
    }
  ],
  "potentialSources": [
    {
      "title": "Tiêu đề nguồn tiềm năng",
      "type": "academic/website/book",
      "similarity": phần_trăm_tương_đồng,
      "matchedText": "văn bản trùng khớp"
    }
  ],
  "paraphraseSuggestions": [
    {
      "original": "văn bản gốc",
      "suggestion": "gợi ý paraphrase",
      "reason": "lý do cần paraphrase"
    }
  ],
  "overallAssessment": "đánh giá tổng thể về rủi ro đạo văn"
}

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
            content: 'Bạn là một chuyên gia phát hiện đạo văn học thuật. Phân tích văn bản để tìm ra các dấu hiệu có thể có của đạo văn và cung cấp gợi ý cải thiện. Sử dụng TIẾNG VIỆT cho tất cả phản hồi.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    // Save to database if userId provided
    if (userId) {
      const supabaseUrl = "https://uixogobytjepprqjvvtw.supabase.co";
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('plagiarism_checks').insert({
          user_id: userId,
          original_text: text.substring(0, 10000), // Store first 10k chars
          file_name: fileName,
          overall_similarity: analysisResult.similarityPercentage,
          sources_found: analysisResult.potentialSources,
          suggestions: analysisResult.paraphraseSuggestions,
          check_status: 'completed',
        });
      }
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in plagiarism-detector function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});