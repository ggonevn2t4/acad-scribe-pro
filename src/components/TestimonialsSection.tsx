import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Nguyễn Minh Hạnh",
      role: "Sinh viên Thạc sĩ Quản trị Kinh doanh, ĐH Kinh tế Quốc dân",
      avatar: "/placeholder.svg",
      content: "AcademicAI đã giúp tôi tiết kiệm hàng giờ nghiên cứu và viết luận văn. Tính năng tóm tắt tài liệu và gợi ý cấu trúc rất hữu ích, giúp tôi có cái nhìn tổng quan về chủ đề nghiên cứu.",
      rating: 5
    },
    {
      name: "Trần Đức Anh",
      role: "Sinh viên năm 3 Khoa Công nghệ Thông tin, ĐH Bách khoa",
      avatar: "/placeholder.svg",
      content: "Lần đầu tiên tôi có thể viết tiểu luận mà không cảm thấy áp lực. AI gợi ý từng đoạn văn rất logic và dễ hiểu. Điểm số của tôi đã cải thiện đáng kể từ khi sử dụng AcademicAI.",
      rating: 5
    },
    {
      name: "Lê Thị Thu Hương",
      role: "Nghiên cứu sinh Tiến sĩ Ngôn ngữ học, ĐH Quốc gia",
      avatar: "/placeholder.svg", 
      content: "Tính năng kiểm tra ngữ pháp và quản lý trích dẫn theo chuẩn APA đã giúp tôi rất nhiều trong việc hoàn thiện luận án. Giao diện thân thiện và dễ sử dụng, rất phù hợp với nghiên cứu sinh.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            Sinh viên nói gì về chúng tôi
          </h2>
          <p className="text-xl text-subtle max-w-3xl mx-auto">
            Hàng nghìn sinh viên đã tin tưởng và đạt được thành công với AcademicAI Assistant
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="border-0 shadow-elegant hover-lift surface-elevated animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-6">
                {/* Rating stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial content */}
                <blockquote className="text-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="gradient-primary text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-subtle">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats section */}
        <div className="grid md:grid-cols-4 gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <p className="text-subtle">Sinh viên tin tưởng</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
            <p className="text-subtle">Bài viết hoàn thành</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <p className="text-subtle">Đánh giá trung bình</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99%</div>
            <p className="text-subtle">Độ hài lòng</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;