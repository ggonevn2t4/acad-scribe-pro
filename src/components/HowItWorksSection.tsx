import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Upload, Brain, Download } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Nhập chủ đề & yêu cầu",
      description: "Cung cấp chủ đề bài viết, loại bài viết, số từ mục tiêu và yêu cầu cụ thể của bạn",
      color: "from-accent to-primary-glow"
    },
    {
      number: "02", 
      icon: Brain,
      title: "AI phân tích & đề xuất",
      description: "Hệ thống AI phân tích yêu cầu và tạo ra dàn ý, cấu trúc phù hợp với tiêu chuẩn học thuật",
      color: "from-primary to-primary-light"
    },
    {
      number: "03",
      icon: Download,
      title: "Nhận kết quả & chỉnh sửa",
      description: "Nhận bài viết hoặc dàn ý hoàn chỉnh, sau đó chỉnh sửa và tùy chỉnh theo ý của bạn",
      color: "from-primary-light to-accent"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            Cách thức hoạt động
          </h2>
          <p className="text-xl text-subtle max-w-3xl mx-auto">
            Chỉ với 3 bước đơn giản, bạn có thể tạo ra bài viết học thuật chất lượng cao
          </p>
        </div>

        <div className="relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8"></div>
              <ArrowRight className="text-accent opacity-30" />
              <div className="w-8 h-8"></div>
              <ArrowRight className="text-accent opacity-30" />
              <div className="w-8 h-8"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className="relative border-0 shadow-elegant hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-accent`}>
                      <span className="text-white text-sm font-bold">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 mt-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} shadow-accent`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-primary mb-4">
                    {step.title}
                  </h3>
                  <p className="text-subtle leading-relaxed">
                    {step.description}
                  </p>

                  {/* Mobile arrow */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-6">
                      <ArrowRight className="text-accent opacity-50 rotate-90" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="gradient-surface p-8 rounded-2xl shadow-soft">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Sẵn sàng bắt đầu hành trình viết học thuật?
            </h3>
            <p className="text-subtle mb-6">
              Tham gia cùng hàng nghìn sinh viên đã tin tương và sử dụng AcademicAI Assistant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover-lift shadow-accent">
                Dùng thử miễn phí
              </button>
              <button className="surface-elevated text-primary px-8 py-3 rounded-lg font-semibold hover-lift border border-border">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;