import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outline, topic, academicLevel, wordCount, tone = "academic", model = "anthropic/claude-3.5-sonnet" } = await req.json();

    console.log('Generating full article for:', { topic, academicLevel, wordCount, model });

    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct the outline text
    let outlineText = `${outline.title}\n\n`;
    outline.sections.forEach((section: any, index: number) => {
      outlineText += `${index + 1}. ${section.title}\n`;
      section.subsections.forEach((subsection: any, subIndex: number) => {
        outlineText += `  ${index + 1}.${subIndex + 1} ${subsection.title}\n`;
        if (subsection.points && subsection.points.length > 0) {
          subsection.points.forEach((point: string) => {
            outlineText += `    - ${point}\n`;
          });
        }
      });
      outlineText += '\n';
    });

    if (outline.conclusion && outline.conclusion.length > 0) {
      outlineText += 'Conclusion:\n';
      outline.conclusion.forEach((point: string) => {
        outlineText += `- ${point}\n`;
      });
    }

    const prompt = `Bạn là một chuyên gia viết bài học thuật. Viết một bài báo hoàn chỉnh bằng tiếng Việt dựa trên outline sau:

OUTLINE:
${outlineText}

YÊU CẦU:
- Chủ đề: ${topic}
- Cấp độ học thuật: ${academicLevel}
- Số từ mục tiêu: ${wordCount} từ
- Tone: ${tone}

HƯỚNG DẪN VIẾT:
1. Viết một bài báo hoàn chỉnh với các phần đầy đủ (mở bài, thân bài, kết luận)
2. Tuân thủ chặt chẽ outline đã cho
3. Sử dụng ngôn ngữ học thuật phù hợp với cấp độ
4. Đảm bảo tính logic và mạch lạc giữa các phần
5. Thêm các ví dụ và phân tích cụ thể khi cần thiết
6. Sử dụng các từ nối và cụm từ chuyển tiếp phù hợp
7. Đảm bảo số từ gần với mục tiêu đã đặt

Viết bài báo hoàn chỉnh ngay bây giờ:`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Academic Writing Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Bạn là một chuyên gia viết bài học thuật có nhiều năm kinh nghiệm. Bạn giỏi viết các bài báo chất lượng cao với cấu trúc rõ ràng và nội dung sâu sắc.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: Math.min(4000, Math.max(wordCount * 2, 2000)),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedArticle = data.choices[0].message.content;

    console.log('Article generated successfully');

    return new Response(
      JSON.stringify({ 
        article: generatedArticle,
        wordCount: generatedArticle.split(' ').length,
        outline: outline
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-full-article function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate article' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});