import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Copy, 
  CheckCircle, 
  Clock,
  QrCode,
  Building2,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  type: "bank" | "ewallet" | "card";
  available: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  recommended?: boolean;
}

const PaymentMethods = () => {
  const [selectedPayment, setSelectedPayment] = useState<string>("momo");
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [copied, setCopied] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "momo",
      name: "Ví MoMo",
      description: "Thanh toán qua ví điện tử MoMo",
      icon: Smartphone,
      type: "ewallet",
      available: true
    },
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản qua MB Bank",
      icon: Building2,
      type: "bank",
      available: true
    },
    {
      id: "stripe",
      name: "Thẻ tín dụng/ghi nợ",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard,
      type: "card",
      available: true
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: "basic",
      name: "Gói Cơ Bản",
      price: 99000,
      currency: "VND",
      features: [
        "Tạo outline không giới hạn",
        "5 bài viết AI/tháng",
        "Export PDF, Word",
        "Hỗ trợ email"
      ]
    },
    {
      id: "premium",
      name: "Gói Premium",
      price: 199000,
      currency: "VND",
      recommended: true,
      features: [
        "Tất cả tính năng gói Cơ Bản",
        "Tạo bài viết không giới hạn",
        "Collaboration tools",
        "5+ AI models",
        "Hỗ trợ ưu tiên",
        "Plagiarism checker"
      ]
    },
    {
      id: "enterprise",
      name: "Gói Doanh Nghiệp",
      price: 399000,
      currency: "VND",
      features: [
        "Tất cả tính năng gói Premium",
        "API access",
        "Custom AI models",
        "Dedicated support",
        "Advanced analytics",
        "Multi-user management"
      ]
    }
  ];

  const bankInfo = {
    bank: "MB Bank",
    accountNumber: "8873333333",
    accountHolder: "Cao Nhật Quang",
    swiftCode: "MSCBVNVX"
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
    toast({
      title: "Đã sao chép!",
      description: `${type} đã được sao chép vào clipboard`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Đang xử lý thanh toán",
        description: `Vui lòng hoàn tất thanh toán ${formatPrice(selectedPlanData?.price || 0)} qua ${paymentMethods.find(p => p.id === selectedPayment)?.name}`,
      });
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Nâng cấp tài khoản</h1>
        <p className="text-muted-foreground">
          Chọn gói dịch vụ phù hợp và phương thức thanh toán thuận tiện
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            } ${plan.recommended ? 'border-primary' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                Được khuyến nghị
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                {plan.name}
              </CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(plan.price)}
                </div>
                <p className="text-sm text-muted-foreground">/tháng</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Phương thức thanh toán
          </CardTitle>
          <CardDescription>
            Chọn phương thức thanh toán phù hợp với bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPayment} onValueChange={setSelectedPayment} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <TabsTrigger key={method.id} value={method.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {method.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* MoMo Payment */}
            <TabsContent value="momo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thanh toán qua MoMo</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Quét mã QR để thanh toán nhanh chóng và an toàn
                    </p>
                    <Alert>
                      <QrCode className="h-4 w-4" />
                      <AlertDescription>
                        Sử dụng ứng dụng MoMo để quét mã QR bên cạnh
                      </AlertDescription>
                    </Alert>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Số điện thoại:</span>
                        <span className="font-medium">*******608</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tên tài khoản:</span>
                        <span className="font-medium">Cao Nhật Quang</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <img 
                      src="/lovable-uploads/6b2c2476-15d4-4c0e-9dc9-5dc16c48878c.png" 
                      alt="MoMo QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Bank Transfer */}
            <TabsContent value="bank" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Chuyển khoản ngân hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Ngân hàng:</Label>
                        <span className="font-medium">{bankInfo.bank}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <Label>Số tài khoản:</Label>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bankInfo.accountNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(bankInfo.accountNumber, "Số tài khoản")}
                          >
                            {copied === "Số tài khoản" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <Label>Chủ tài khoản:</Label>
                        <span className="font-medium">{bankInfo.accountHolder}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <Label>Swift Code:</Label>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bankInfo.swiftCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(bankInfo.swiftCode, "Swift Code")}
                          >
                            {copied === "Swift Code" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Sau khi chuyển khoản, vui lòng liên hệ để kích hoạt tài khoản.
                        Thời gian xử lý: 1-2 giờ làm việc.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Nội dung chuyển khoản:</h4>
                      <div className="bg-white p-3 rounded border-2 border-dashed">
                        <p className="text-sm font-mono">
                          THANHTOAN {pricingPlans.find(p => p.id === selectedPlan)?.name.toUpperCase()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => copyToClipboard(
                            `THANHTOAN ${pricingPlans.find(p => p.id === selectedPlan)?.name.toUpperCase()}`,
                            "Nội dung chuyển khoản"
                          )}
                        >
                          {copied === "Nội dung chuyển khoản" ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Sao chép nội dung
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Credit Card */}
            <TabsContent value="stripe" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thanh toán bằng thẻ</h3>
                <p className="text-muted-foreground">
                  Thanh toán an toàn qua Stripe. Hỗ trợ Visa, Mastercard, American Express.
                </p>
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    Thanh toán quốc tế qua Stripe - An toàn và nhanh chóng
                  </AlertDescription>
                </Alert>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Bạn sẽ được chuyển hướng đến trang thanh toán bảo mật của Stripe
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Summary & Checkout */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Gói dịch vụ:</span>
            <span className="font-medium">
              {pricingPlans.find(p => p.id === selectedPlan)?.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Phương thức thanh toán:</span>
            <span className="font-medium">
              {paymentMethods.find(p => p.id === selectedPayment)?.name}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-primary">
              {formatPrice(pricingPlans.find(p => p.id === selectedPlan)?.price || 0)}
            </span>
          </div>
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Banknote className="mr-2 h-4 w-4" />
                Thanh toán ngay
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Bằng việc thanh toán, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethods;