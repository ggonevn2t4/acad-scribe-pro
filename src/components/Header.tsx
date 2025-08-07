import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Brain, Globe } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Công cụ", href: "/tools" },
    { name: "Pricing", href: "/pricing" },
    { name: "Hướng dẫn", href: "/guide" },
    { name: "Liên hệ", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 surface-elevated backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="gradient-primary p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">AcademicAI</h1>
              <p className="text-xs text-subtle">Assistant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              VN
            </Button>
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
            <Button size="sm" className="gradient-primary">
              Bắt đầu miễn phí
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 px-3 pt-4 border-t border-border mt-4">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
                <Button size="sm" className="gradient-primary">
                  Bắt đầu miễn phí
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;