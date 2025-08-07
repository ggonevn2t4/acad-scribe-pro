import { Brain, Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const companyLinks = [
    { name: "Về chúng tôi", href: "/about" },
    { name: "Tính năng", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  const supportLinks = [
    { name: "Hướng dẫn sử dụng", href: "/guide" },
    { name: "FAQ", href: "/faq" },
    { name: "Liên hệ hỗ trợ", href: "/support" },
    { name: "Báo lỗi", href: "/report" },
  ];

  const legalLinks = [
    { name: "Điều khoản sử dụng", href: "/terms" },
    { name: "Chính sách bảo mật", href: "/privacy" },
    { name: "Chính sách cookie", href: "/cookies" },
  ];

  return (
    <footer className="gradient-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AcademicAI</h3>
                <p className="text-sm opacity-80">Assistant</p>
              </div>
            </div>
            <p className="text-white/80 mb-4 leading-relaxed">
              Nền tảng AI hàng đầu Việt Nam hỗ trợ sinh viên viết học thuật chuyên nghiệp, 
              từ ý tưởng đến luận văn hoàn thiện.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-white/60" />
                <span className="text-white/80">support@academicai.vn</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-white/60" />
                <span className="text-white/80">+84 24 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-white/60" />
                <span className="text-white/80">Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-white/60 text-sm">
              © 2024 AcademicAI Assistant. Bảo lưu mọi quyền.
            </p>
            <div className="flex space-x-6">
              {legalLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;