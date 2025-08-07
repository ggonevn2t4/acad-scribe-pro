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
  nameVn: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  limits: {
    outlines: number | 'unlimited';
    writings: number | 'unlimited';
    grammar: number | 'unlimited';
    summaries: number | 'unlimited';
    citations: number | 'unlimited';
    exports: number | 'unlimited';
    aiAssistant: number | 'unlimited';
    templates: number | 'unlimited';
    plagiarism: number | 'unlimited';
    collaboration: boolean;
    prioritySupport: boolean;
  };
  recommended?: boolean;
}

const PaymentMethods = () => {
  const [selectedPayment, setSelectedPayment] = useState<string>("momo");
  const [selectedPlan, setSelectedPlan] = useState<string>("student");
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [copied, setCopied] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "momo",
      name: "Ví MoMo",
      description: "Thanh toán qua ví điện tử MoMo - Kích hoạt tự động",
      icon: Smartphone,
      type: "ewallet",
      available: true
    },
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản qua MB Bank - Kích hoạt thủ công",
      icon: Building2,
      type: "bank",
      available: true
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      description: "Thanh toán qua ZaloPay - Kích hoạt tự động",
      icon: Smartphone,
      type: "ewallet",
      available: true
    },
    {
      id: "vnpay",
      name: "VNPay",
      description: "Thanh toán qua VNPay - Kích hoạt tự động",
      icon: CreditCard,
      type: "ewallet",
      available: true
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: "free",
      name: "Học Viên",
      nameVn: "Học Viên",
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: "VND",
      features: [
        "3 lần tạo outline/tháng",
        "1 dự án viết/tháng", 
        "3 lần kiểm tra ngữ pháp/tháng",
        "1 lần tóm tắt tài liệu/tháng",
        "5 lần quản lý trích dẫn/tháng",
        "Export PDF cơ bản",
        "5 lần AI trợ lý/tháng"
      ],
      limits: {
        outlines: 3,
        writings: 1,
        grammar: 3,
        summaries: 1,
        citations: 5,
        exports: 1,
        aiAssistant: 5,
        templates: 0,
        plagiarism: 0,
        collaboration: false,
        prioritySupport: false
      }
    },
    {
      id: "student",
      name: "Sinh Viên Plus",
      nameVn: "Sinh Viên Plus",
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      currency: "VND",
      recommended: true,
      features: [
        "15 lần tạo outline/tháng",
        "5 dự án viết/tháng",
        "20 lần kiểm tra ngữ pháp/tháng", 
        "10 lần tóm tắt tài liệu/tháng",
        "50 lần quản lý trích dẫn/tháng",
        "Export Word, PDF không giới hạn",
        "50 lần AI trợ lý/tháng",
        "10 mẫu có sẵn",
        "2 lần kiểm tra đạo văn/tháng"
      ],
      limits: {
        outlines: 15,
        writings: 5,
        grammar: 20,
        summaries: 10,
        citations: 50,
        exports: 'unlimited',
        aiAssistant: 50,
        templates: 10,
        plagiarism: 2,
        collaboration: false,
        prioritySupport: false
      }
    },
    {
      id: "premium",
      name: "Nghiên Cứu Sinh",
      nameVn: "Nghiên Cứu Sinh", 
      monthlyPrice: 199000,
      yearlyPrice: 1990000,
      currency: "VND",
      features: [
        "Không giới hạn tạo outline",
        "Không giới hạn dự án viết",
        "Không giới hạn kiểm tra ngữ pháp",
        "Không giới hạn tóm tắt tài liệu",
        "Không giới hạn quản lý trích dẫn",
        "Export tất cả định dạng",
        "Không giới hạn AI trợ lý",
        "Tất cả mẫu có sẵn",
        "10 lần kiểm tra đạo văn/tháng",
        "Công cụ cộng tác",
        "Hỗ trợ ưu tiên"
      ],
      limits: {
        outlines: 'unlimited',
        writings: 'unlimited', 
        grammar: 'unlimited',
        summaries: 'unlimited',
        citations: 'unlimited',
        exports: 'unlimited',
        aiAssistant: 'unlimited',
        templates: 'unlimited',
        plagiarism: 10,
        collaboration: true,
        prioritySupport: true
      }
    },
    {
      id: "institutional",
      name: "Tổ Chức",
      nameVn: "Tổ Chức",
      monthlyPrice: 999000,
      yearlyPrice: 9990000,
      currency: "VND",
      features: [
        "Tất cả tính năng Nghiên Cứu Sinh",
        "Quản lý 50 người dùng",
        "Không giới hạn kiểm tra đạo văn",
        "API tích hợp",
        "Báo cáo phân tích nâng cao",
        "Đào tạo và hỗ trợ chuyên biệt",
        "Tùy chỉnh thương hiệu"
      ],
      limits: {
        outlines: 'unlimited',
        writings: 'unlimited',
        grammar: 'unlimited', 
        summaries: 'unlimited',
        citations: 'unlimited',
        exports: 'unlimited',
        aiAssistant: 'unlimited',
        templates: 'unlimited',
        plagiarism: 'unlimited',
        collaboration: true,
        prioritySupport: true
      }
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

  const getCurrentPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getDiscountPercent = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    return Math.round(((monthlyTotal - plan.yearlyPrice) / monthlyTotal) * 100);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);
    
    try {
      // For now, just generate a random order code since the table/function doesn't exist yet
      const orderCode = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const amount = getCurrentPrice(selectedPlanData!);

      // TODO: Create payment record when database tables are ready
      console.log('Payment order created:', {
        order_code: orderCode,
        plan_id: selectedPlan,
        billing_cycle: billingCycle,
        amount,
        payment_method: selectedPayment,
        status: 'pending'
      });

      toast({
        title: "Đơn hàng đã được tạo",
        description: `Mã đơn hàng: ${orderCode}. Vui lòng hoàn tất thanh toán ${formatPrice(amount)} qua ${paymentMethods.find(p => p.id === selectedPayment)?.name}`,
        duration: 5000,
      });

    } catch (error: any) {
      toast({
        title: "Lỗi tạo đơn hàng",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Nâng cấp tài khoản</h1>
        <p className="text-muted-foreground">
          Chọn gói dịch vụ phù hợp và phương thức thanh toán thuận tiện
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
            size="sm"
          >
            Hàng tháng
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
            size="sm"
            className="relative"
          >
            Hàng năm
            <Badge variant="secondary" className="ml-2 text-xs">
              Tiết kiệm tới 17%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricingPlans.map((plan) => {
          const currentPrice = getCurrentPrice(plan);
          const discount = getDiscountPercent(plan);
          
          return (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
              } ${plan.recommended ? 'border-primary border-2' : ''} ${
                plan.id === 'free' ? 'opacity-75' : ''
              }`}
              onClick={() => plan.id !== 'free' && setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Được khuyến nghị
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  {plan.nameVn}
                </CardTitle>
                <div className="space-y-2">
                  {plan.id === 'free' ? (
                    <div className="text-3xl font-bold text-primary">
                      Miễn phí
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(currentPrice)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                      </p>
                      {billingCycle === 'yearly' && discount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Tiết kiệm {discount}%
                        </Badge>
                      )}
                    </>
                  )}
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
                {plan.id === 'free' && (
                  <Button className="w-full mt-4" variant="outline" disabled>
                    Gói hiện tại
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
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
            <TabsList className="grid w-full grid-cols-4">
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

            {/* ZaloPay */}
            <TabsContent value="zalopay" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thanh toán qua ZaloPay</h3>
                <p className="text-muted-foreground">
                  Thanh toán nhanh chóng và an toàn qua ví điện tử ZaloPay
                </p>
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Tài khoản sẽ được kích hoạt tự động sau khi thanh toán thành công
                  </AlertDescription>
                </Alert>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Bạn sẽ được chuyển hướng đến ứng dụng ZaloPay để hoàn tất thanh toán
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* VNPay */}
            <TabsContent value="vnpay" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thanh toán qua VNPay</h3>
                <p className="text-muted-foreground">
                  Thanh toán qua cổng thanh toán VNPay - Hỗ trợ tất cả ngân hàng Việt Nam
                </p>
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    Tài khoản sẽ được kích hoạt tự động sau khi thanh toán thành công
                  </AlertDescription>
                </Alert>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ thanh toán qua thẻ ATM, Internet Banking, QR Code
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
              {formatPrice(getCurrentPrice(pricingPlans.find(p => p.id === selectedPlan)!))}
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