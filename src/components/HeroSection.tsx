import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Users, FileText, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-academic-ai.jpg";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-5"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-20 animate-float">
        <FileText className="h-8 w-8 text-accent" />
      </div>
      <div className="absolute top-40 right-20 opacity-20 animate-float" style={{
      animationDelay: '2s'
    }}>
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-20 animate-float" style={{
      animationDelay: '4s'
    }}>
        <CheckCircle className="h-7 w-7 text-accent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full surface-elevated shadow-soft mb-6">
              <Sparkles className="h-4 w-4 text-accent mr-2" />
              <span className="text-sm font-medium text-primary">
                Công nghệ AI tiên tiến
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-primary mb-6">
              Trí tuệ nhân tạo
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse hover:animate-none transition-all duration-500 text-shadow-glow">
                hỗ trợ viết học thuật
              </span>
              <span className="block text-foreground">
                chuyên nghiệp
              </span>
            </h1>
            
            <p className="text-xl text-subtle mb-8 leading-relaxed">
              Từ ý tưởng đến luận văn hoàn thiện - AI đồng hành cùng bạn trong hành trình
              học thuật. Tạo dàn ý, viết nháp, kiểm tra ngữ pháp và quản lý trích dẫn
              một cách thông minh.
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm text-subtle">10,000+ sinh viên</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-accent" />
                <span className="text-sm text-subtle">50,000+ bài viết</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="text-sm text-subtle">99% hài lòng</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gradient-primary hover-lift shadow-accent group">
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="hover-lift group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Xem demo
              </Button>
            </div>

            <p className="text-sm text-subtle mt-4">
              ✨ Không cần thẻ tín dụng • Dùng thử 7 ngày miễn phí
            </p>
          </div>

          {/* Right image */}
          <div className="relative animate-fade-in-up" style={{
          animationDelay: '0.3s'
        }}>
            <div className="relative">
              <img src={heroImage} alt="Students using AI for academic writing" className="w-full h-auto rounded-2xl shadow-elegant hover-lift" />
              
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 surface-elevated p-4 rounded-xl shadow-soft animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm font-medium">AI đang phân tích...</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 surface-elevated p-4 rounded-xl shadow-soft animate-float" style={{
              animationDelay: '1s'
            }}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Hoàn thành 95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;