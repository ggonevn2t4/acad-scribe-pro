import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Banknote, Smartphone, CreditCard, QrCode, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentMethodsProps {
  selectedPlan: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
}

export const PaymentMethods = ({ selectedPlan, billingCycle, amount }: PaymentMethodsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [orderCode, setOrderCode] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'MB Bank - Xử lý thủ công trong 24h',
      icon: <Banknote className="h-5 w-5" />,
      badge: 'Phổ biến'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua QR code MoMo',
      icon: <Smartphone className="h-5 w-5" />,
      badge: 'Nhanh chóng'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Thanh toán qua ví ZaloPay',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Cổng thanh toán VNPay',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Dành cho sinh viên quốc tế',
      icon: <CreditCard className="h-5 w-5" />
    }
  ];

  const createPaymentOrder = async () => {
    if (!user || !selectedMethod) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Generate order code
      const { data: orderData, error: orderError } = await supabase
        .rpc('generate_order_code');

      if (orderError) throw orderError;

      const newOrderCode = orderData;
      setOrderCode(newOrderCode);

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          order_code: newOrderCode,
          subscription_tier: selectedPlan as any,
          billing_cycle: billingCycle,
          amount: amount,
          payment_method: selectedMethod as any,
          payment_status: 'pending' as any
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Đơn hàng đã được tạo",
        description: `Mã đơn hàng: ${newOrderCode}. Vui lòng thực hiện thanh toán.`
      });

    } catch (error) {
      console.error('Error creating payment order:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentProof || !orderCode) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ảnh chứng từ thanh toán",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Upload file to storage (if storage is set up)
      // For now, we'll just update the payment record
      const { error } = await supabase
        .from('payments')
        .update({
          payment_proof_url: 'uploaded', // In real implementation, this would be the storage URL
          payment_status: 'pending'
        })
        .eq('order_code', orderCode);

      if (error) throw error;

      toast({
        title: "Chứng từ đã được gửi",
        description: "Chúng tôi sẽ xác nhận thanh toán trong vòng 24h.",
      });

    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên chứng từ. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBankTransferInfo = () => {
    return {
      bankName: 'MB Bank',
      accountNumber: '0123456789',
      accountName: 'ACADEMIC AI ASSISTANT',
      transferContent: orderCode || 'AC_ORDER_CODE'
    };
  };

  if (orderCode && selectedMethod === 'bank_transfer') {
    const bankInfo = getBankTransferInfo();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Banknote className="h-5 w-5" />
              <span>Thông tin chuyển khoản</span>
            </CardTitle>
            <CardDescription>
              Vui lòng chuyển khoản chính xác số tiền và nội dung bên dưới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngân hàng</Label>
                <div className="font-medium">{bankInfo.bankName}</div>
              </div>
              <div>
                <Label>Số tài khoản</Label>
                <div className="font-medium font-mono">{bankInfo.accountNumber}</div>
              </div>
              <div>
                <Label>Tên chủ tài khoản</Label>
                <div className="font-medium">{bankInfo.accountName}</div>
              </div>
              <div>
                <Label>Số tiền</Label>
                <div className="font-medium text-lg text-primary">
                  {formatAmount(amount)}
                </div>
              </div>
            </div>
            
            <div>
              <Label>Nội dung chuyển khoản</Label>
              <div className="p-3 bg-accent/10 rounded-lg border-2 border-dashed border-accent">
                <div className="font-mono font-bold text-center text-lg">
                  {bankInfo.transferContent}
                </div>
              </div>
              <p className="text-sm text-subtle mt-2">
                ⚠️ Vui lòng nhập chính xác nội dung này để được xử lý tự động
              </p>
            </div>
            
            <div className="space-y-3">
              <Label>Tải lên chứng từ thanh toán</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              />
              <Button
                onClick={uploadPaymentProof}
                disabled={!paymentProof || loading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Đang tải lên...' : 'Gửi chứng từ thanh toán'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Chọn phương thức thanh toán</h3>
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all hover-lift ${
                selectedMethod === method.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {method.icon}
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-subtle">{method.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.badge && (
                      <Badge variant="secondary">{method.badge}</Badge>
                    )}
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'bg-primary border-primary'
                        : 'border-border'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-accent/5 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Tổng thanh toán:</span>
          <span className="text-xl font-bold text-primary">
            {formatAmount(amount)}
          </span>
        </div>
      </div>

      <Button
        onClick={createPaymentOrder}
        disabled={!selectedMethod || loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-subtle">
          🔒 Thông tin thanh toán được bảo mật. Hỗ trợ 24/7 qua email support@academicai.vn
        </p>
      </div>
    </div>
  );
};