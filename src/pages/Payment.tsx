import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PaymentMethods } from "@/components/payment/PaymentMethods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PricingPlans } from "@/components/pricing/PricingPlans";

const Payment = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const plan = searchParams.get('plan');
    const cycle = searchParams.get('cycle') as 'monthly' | 'yearly';
    
    if (plan) setSelectedPlan(plan);
    if (cycle) setBillingCycle(cycle);
  }, [searchParams]);

  const pricingData = {
    student: {
      name: "Sinh Viên Plus",
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      features: [
        "Tạo dàn ý không giới hạn",
        "20 bài viết/tháng (5,000 từ)",
        "Kiểm tra ngữ pháp không giới hạn",
        "50 tóm tắt tài liệu/tháng",
        "Quản lý trích dẫn đầy đủ",
        "Xuất tất cả định dạng",
        "AI Writing Assistant cơ bản",
        "10 lần kiểm tra đạo văn/tháng"
      ]
    },
    premium: {
      name: "Nghiên Cứu Sinh", 
      monthlyPrice: 199000,
      yearlyPrice: 1990000,
      features: [
        "Tất cả tính năng Student Plus",
        "Viết bài không giới hạn",
        "AI Writing Assistant nâng cao", 
        "AI Research Assistant",
        "Kiểm tra đạo văn không giới hạn",
        "Cộng tác nhóm đầy đủ",
        "Templates tùy chỉnh",
        "Hỗ trợ ưu tiên"
      ]
    },
    institutional: {
      name: "Tổ Chức",
      monthlyPrice: 999000,
      yearlyPrice: 9990000,
      features: [
        "Tất cả tính năng Premium",
        "Quản lý đa người dùng",
        "Cộng tác thời gian thực",
        "API tùy chỉnh",
        "Templates tổ chức",
        "Báo cáo phân tích nâng cao",
        "Hỗ trợ chuyên biệt",
        "Tùy chỉnh thương hiệu"
      ]
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSelectedPlanData = () => {
    if (!selectedPlan || !(selectedPlan in pricingData)) {
      return null;
    }
    return pricingData[selectedPlan as keyof typeof pricingData];
  };

  const getAmount = () => {
    const planData = getSelectedPlanData();
    if (!planData) return 0;
    return billingCycle === 'monthly' ? planData.monthlyPrice : planData.yearlyPrice;
  };

  const planData = getSelectedPlanData();

  // If no plan selected, show pricing plans
  if (!selectedPlan || !planData) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Bảng giá dịch vụ
            </h1>
            <p className="text-xl text-subtle">
              Chọn gói phù hợp với nhu cầu học thuật của bạn
            </p>
          </div>
          <PricingPlans />
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Thanh toán đăng ký
          </h1>
          <p className="text-xl text-subtle">
            Hoàn tất thanh toán để kích hoạt gói dịch vụ
          </p>
        </div>

        {/* Back to pricing */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/payment'}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại chọn gói</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Selected Plan Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Thông tin gói đã chọn
            </h2>
            
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{planData.name}</span>
                  <Badge variant="secondary">
                    {billingCycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(getAmount())}
                    </span>
                    <span className="text-subtle ml-2">
                      /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-green-600 text-sm mt-1">
                      ✨ Tiết kiệm {formatPrice(planData.monthlyPrice * 2)} so với thanh toán hàng tháng
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {planData.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Phương thức thanh toán
            </h2>
            
            <PaymentMethods
              selectedPlan={selectedPlan}
              billingCycle={billingCycle}
              amount={getAmount()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;