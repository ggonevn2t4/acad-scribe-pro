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
      prompt = `Cải thiện văn bản sau theo phong cách viết ${writingStyle}:

Bối cảnh: ${context}
Văn bản hiện tại: ${currentText}

Vui lòng cung cấp:
1. Phiên bản được cải thiện của văn bản
2. Các gợi ý cụ thể để nâng cao chất lượng
3. Sửa lỗi ngữ pháp và phong cách
4. Cải thiện độ dễ đọc

Định dạng JSON:
{
  "improvedText": "Phiên bản đã cải thiện",
  "suggestions": ["Gợi ý 1", "Gợi ý 2"],
  "grammarFixes": ["Sửa lỗi 1", "Sửa lỗi 2"],
  "readabilityScore": "mức độ dễ đọc ước tính"
}

LƯU Ý: Tất cả nội dung phải bằng tiếng Việt.`;
    } else if (action === 'continue') {
      prompt = `Tiếp tục viết văn bản sau theo phong cách ${writingStyle}:

Bối cảnh: ${context}
Văn bản hiện tại: ${currentText}

Vui lòng cung cấp phần tiếp theo tự nhiên với:
- Duy trì giọng điệu và phong cách giống như trước
- Kết nối logic từ nội dung hiện có
- Thêm giá trị thực chất cho luận điểm

Chỉ trả về phần tiếp theo dưới dạng chuỗi văn bản bằng tiếng Việt.`;
    } else if (action === 'rewrite') {
      prompt = `Viết lại văn bản sau theo phong cách ${writingStyle}:

Bối cảnh: ${context}
Văn bản hiện tại: ${currentText}

Vui lòng viết lại để:
- Phù hợp với phong cách viết được yêu cầu
- Cải thiện độ rõ ràng và mạch lạc
- Giữ nguyên ý nghĩa ban đầu
- Nâng cao tính học thuật

Chỉ trả về văn bản đã được viết lại dưới dạng chuỗi bằng tiếng Việt.`;
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
            content: 'Bạn là một chuyên gia hỗ trợ viết chuyên về viết học thuật và chuyên nghiệp. Cung cấp phản hồi rõ ràng, có thể hành động được và các cải thiện. Luôn sử dụng TIẾNG VIỆT.'
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