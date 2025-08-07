import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Building2, 
  PenTool, 
  BookOpen, 
  CheckCircle2, 
  Quote 
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Lập dàn ý tự động",
      description: "AI phân tích chủ đề và tạo cấu trúc bài viết logic, chi tiết trong vài giây",
      color: "text-accent"
    },
    {
      icon: Building2,
      title: "Gợi ý cấu trúc bài viết",
      description: "Template chuyên nghiệp cho mọi loại bài viết học thuật từ tiểu luận đến luận văn",
      color: "text-primary"
    },
    {
      icon: PenTool,
      title: "Hỗ trợ viết nháp",
      description: "AI viết nháp đoạn văn theo yêu cầu, giữ nguyên giọng văn học thuật chuyên nghiệp",
      color: "text-accent"
    },
    {
      icon: BookOpen,
      title: "Tóm tắt tài liệu",
      description: "Tóm tắt thông minh các tài liệu PDF, Word và trích xuất điểm chính quan trọng",
      color: "text-primary"
    },
    {
      icon: CheckCircle2,
      title: "Kiểm tra ngữ pháp",
      description: "Phát hiện và sửa lỗi ngữ pháp, chính tả với độ chính xác cao cho tiếng Việt",
      color: "text-accent"
    },
    {
      icon: Quote,
      title: "Quản lý trích dẫn",
      description: "Tự động định dạng trích dẫn theo chuẩn APA, MLA, Chicago và tạo thư mục tài liệu",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            Công cụ AI toàn diện
          </h2>
          <p className="text-xl text-subtle max-w-3xl mx-auto">
            Bộ công cụ AI mạnh mẽ được thiết kế đặc biệt cho nhu cầu viết học thuật của sinh viên Việt Nam
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-lift border-0 shadow-soft surface-elevated animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-xl gradient-surface">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-subtle leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="inline-flex items-center px-6 py-3 rounded-full surface-elevated shadow-soft">
            <span className="text-accent font-medium">✨ Tất cả công cụ trong một nền tảng</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;