import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const ZaloChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleZaloClick = () => {
    window.open('https://zalo.me/84708684608', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Chat popup */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-border animate-scale-in">
              <div className="p-4 bg-blue-500 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">Z</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
                      <p className="text-sm opacity-90">Trực tuyến</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      👋 Xin chào! Tôi có thể hỗ trợ gì cho bạn về AcademicAI?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Liên hệ qua:</p>
                    <div className="grid gap-2">
                      <Button
                        onClick={handleZaloClick}
                        className="bg-blue-500 hover:bg-blue-600 text-white w-full justify-start"
                      >
                        <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center text-xs font-bold text-blue-500 mr-2">
                          Z
                        </div>
                        Chat qua Zalo
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = 'tel:0708684608'}
                        className="w-full justify-start"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Gọi: 0708 684 608
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    Thời gian hỗ trợ: 8:00 - 22:00 hàng ngày
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Button */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </Button>
          
          {/* Notification dot */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ZaloChat;