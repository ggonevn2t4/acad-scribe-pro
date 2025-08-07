import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Users, GraduationCap, BookOpen, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  features: {
    name: string;
    included: boolean;
    limit?: string;
  }[];
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Học Viên',
    description: 'Phù hợp cho sinh viên mới bắt đầu',
    icon: <BookOpen className="h-6 w-6" />,
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: 'Miễn phí',
    features: [
      { name: 'Tạo dàn ý', included: true, limit: '3 dàn ý/tháng' },
      { name: 'Viết bài cơ bản', included: true, limit: '2 bài/tháng (1,000 từ)' },
      { name: 'Kiểm tra ngữ pháp', included: true, limit: '5 lần/tháng' },
      { name: 'Tóm tắt tài liệu', included: false },
      { name: 'Quản lý trích dẫn', included: false },
      { name: 'Xuất PDF cơ bản', included: true },
      { name: 'AI Writing Assistant', included: false },
      { name: 'Kiểm tra đạo văn', included: false },
    ]
  },
  {
    id: 'student',
    name: 'Sinh Viên Plus',
    description: 'Phù hợp cho sinh viên đại học, cao đẳng',
    icon: <GraduationCap className="h-6 w-6" />,
    monthlyPrice: 99000,
    yearlyPrice: 990000,
    popular: true,
    features: [
      { name: 'Tạo dàn ý không giới hạn', included: true },
      { name: 'Viết bài nâng cao', included: true, limit: '20 bài/tháng (5,000 từ)' },
      { name: 'Kiểm tra ngữ pháp không giới hạn', included: true },
      { name: 'Tóm tắt tài liệu', included: true, limit: '50 tài liệu/tháng' },
      { name: 'Quản lý trích dẫn đầy đủ', included: true },
      { name: 'Xuất tất cả định dạng', included: true },
      { name: 'AI Writing Assistant cơ bản', included: true },
      { name: 'Kiểm tra đạo văn', included: true, limit: '10 lần/tháng' },
    ]
  },
  {
    id: 'premium',
    name: 'Nghiên Cứu Sinh',
    description: 'Dành cho thạc sĩ, tiến sĩ, nghiên cứu viên',
    icon: <Crown className="h-6 w-6" />,
    monthlyPrice: 199000,
    yearlyPrice: 1990000,
    features: [
      { name: 'Tất cả tính năng Student Plus', included: true },
      { name: 'Viết bài không giới hạn', included: true },
      { name: 'AI Writing Assistant nâng cao', included: true },
      { name: 'AI Research Assistant', included: true },
      { name: 'Kiểm tra đạo văn không giới hạn', included: true },
      { name: 'Cộng tác nhóm đầy đủ', included: true },
      { name: 'Templates tùy chỉnh', included: true },
      { name: 'Hỗ trợ ưu tiên', included: true },
    ]
  },
  {
    id: 'institutional',
    name: 'Tổ Chức',
    description: 'Dành cho trường đại học, viện nghiên cứu',
    icon: <Users className="h-6 w-6" />,
    monthlyPrice: 999000,
    yearlyPrice: 9990000,
    badge: 'Tối đa 50 users',
    features: [
      { name: 'Tất cả tính năng Premium', included: true },
      { name: 'Quản lý đa người dùng', included: true },
      { name: 'Cộng tác thời gian thực', included: true },
      { name: 'API tùy chỉnh', included: true },
      { name: 'Templates tổ chức', included: true },
      { name: 'Báo cáo phân tích nâng cao', included: true },
      { name: 'Hỗ trợ chuyên biệt', included: true },
      { name: 'Tùy chỉnh thương hiệu', included: true },
    ]
  }
];

export const PricingPlans = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    if (planId === 'free') return;
    
    // Navigate to payment page with plan details
    const params = new URLSearchParams({
      plan: planId,
      cycle: billingCycle
    });
    window.location.href = `/payment?${params}`;
  };

  const getCurrentPlan = () => {
    return subscription?.subscription_tier || 'free';
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlan() === planId;
  };

  return (
    <div className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Chọn gói phù hợp với bạn
          </h2>
          <p className="text-xl text-subtle mb-8">
            Từ miễn phí đến chuyên nghiệp - tất cả đều có AI hỗ trợ
          </p>
          
          {/* Billing cycle toggle */}
          <div className="inline-flex items-center p-1 surface-elevated rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Hàng năm
              <Badge variant="secondary" className="ml-2">
                Tiết kiệm 2 tháng
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrentUserPlan = isCurrentPlan(plan.id);
            
            return (
              <Card
                key={plan.id}
                className={`relative hover-lift ${
                  plan.popular ? 'ring-2 ring-primary shadow-glow' : ''
                } ${isCurrentUserPlan ? 'ring-2 ring-accent' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Zap className="h-3 w-3 mr-1" />
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}
                
                {isCurrentUserPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="bg-accent text-accent-foreground">
                      Gói hiện tại
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                  
                  {plan.badge && (
                    <Badge variant="secondary" className="mx-auto">
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <div className="text-center mt-4">
                    <div className="text-3xl font-bold text-primary">
                      {price === 0 ? 'Miễn phí' : formatPrice(price)}
                    </div>
                    {price > 0 && (
                      <div className="text-sm text-subtle">
                        /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : (
                            <X className="h-4 w-4 text-subtle" />
                          )}
                        </div>
                        <div className="text-sm">
                          <span className={feature.included ? 'text-foreground' : 'text-subtle'}>
                            {feature.name}
                          </span>
                          {feature.limit && (
                            <div className="text-xs text-subtle mt-1">
                              {feature.limit}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrentUserPlan}
                  >
                    {isCurrentUserPlan
                      ? 'Gói hiện tại'
                      : plan.id === 'free'
                      ? 'Bắt đầu miễn phí'
                      : 'Chọn gói này'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-subtle">
            Tất cả gói đều bao gồm hỗ trợ khách hàng và cập nhật miễn phí
          </p>
          <p className="text-xs text-subtle mt-2">
            Giá đã bao gồm VAT. Có thể hủy bất cứ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
};