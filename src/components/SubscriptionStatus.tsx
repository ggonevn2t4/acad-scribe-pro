import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Calendar, 
  TrendingUp,
  Users,
  FileText,
  CheckSquare,
  BookOpen,
  Quote,
  Download,
  Bot,
  Layout,
  Shield,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PLAN_LIMITS = {
  free: {
    outlines: 3,
    writings: 1,
    grammar: 3,
    summaries: 1,
    citations: 5,
    exports: 1,
    aiAssistant: 5,
    templates: 0,
    plagiarism: 0
  },
  student: {
    outlines: 15,
    writings: 5,
    grammar: 20,
    summaries: 10,
    citations: 50,
    exports: -1, // unlimited
    aiAssistant: 50,
    templates: 10,
    plagiarism: 2
  },
  premium: {
    outlines: -1, // unlimited
    writings: -1,
    grammar: -1,
    summaries: -1,
    citations: -1,
    exports: -1,
    aiAssistant: -1,
    templates: -1,
    plagiarism: 10
  },
  institutional: {
    outlines: -1,
    writings: -1,
    grammar: -1,
    summaries: -1,
    citations: -1,
    exports: -1,
    aiAssistant: -1,
    templates: -1,
    plagiarism: -1
  }
};

const SubscriptionStatus = () => {
  const { subscription, usage, loading, refetchSubscription, refetchUsage } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Đang tải thông tin gói...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy thông tin gói</p>
          <Button onClick={() => navigate('/payment')}>
            Đăng ký gói dịch vụ
          </Button>
        </CardContent>
      </Card>
    );
  }

  const planLimits = PLAN_LIMITS[subscription.plan_id as keyof typeof PLAN_LIMITS];
  const isUnlimited = (limit: number) => limit === -1;
  const getUsagePercent = (used: number, limit: number) => {
    if (isUnlimited(limit)) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const features = [
    { key: 'outlines', label: 'Tạo outline', icon: FileText, used: usage?.outlines || 0, limit: planLimits.outlines },
    { key: 'writings', label: 'Dự án viết', icon: BookOpen, used: usage?.writings || 0, limit: planLimits.writings },
    { key: 'grammar', label: 'Kiểm tra ngữ pháp', icon: CheckSquare, used: usage?.grammar || 0, limit: planLimits.grammar },
    { key: 'summaries', label: 'Tóm tắt tài liệu', icon: TrendingUp, used: usage?.summaries || 0, limit: planLimits.summaries },
    { key: 'citations', label: 'Quản lý trích dẫn', icon: Quote, used: usage?.citations || 0, limit: planLimits.citations },
    { key: 'exports', label: 'Export', icon: Download, used: usage?.exports || 0, limit: planLimits.exports },
    { key: 'aiAssistant', label: 'AI trợ lý', icon: Bot, used: usage?.aiAssistant || 0, limit: planLimits.aiAssistant },
    { key: 'templates', label: 'Mẫu có sẵn', icon: Layout, used: usage?.templates || 0, limit: planLimits.templates },
    { key: 'plagiarism', label: 'Kiểm tra đạo văn', icon: Shield, used: usage?.plagiarism || 0, limit: planLimits.plagiarism }
  ];

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Đang hoạt động</Badge>;
      case 'expired':
        return <Badge variant="destructive">Đã hết hạn</Badge>;
      default:
        return <Badge variant="outline">Không hoạt động</Badge>;
    }
  };

  const getPlanBadge = () => {
    const planNames = {
      free: 'Học Viên',
      student: 'Sinh Viên Plus',
      premium: 'Nghiên Cứu Sinh',
      institutional: 'Tổ Chức'
    };

    const colors = {
      free: 'bg-gray-100 text-gray-800',
      student: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      institutional: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={colors[subscription.plan_id as keyof typeof colors]}>
        <Crown className="h-3 w-3 mr-1" />
        {planNames[subscription.plan_id as keyof typeof planNames]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thông tin gói dịch vụ
              </CardTitle>
              <CardDescription>
                Quản lý gói đăng ký và theo dõi mức sử dụng
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getPlanBadge()}
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ngày bắt đầu</span>
              </div>
              <p className="font-medium">
                {new Date(subscription.start_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ngày hết hạn</span>
              </div>
              <p className="font-medium">
                {new Date(subscription.end_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Gia hạn tự động</span>
              </div>
              <p className="font-medium">
                {subscription.auto_renew ? 'Bật' : 'Tắt'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={() => navigate('/payment')}
              className="flex-1"
            >
              Nâng cấp gói
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                refetchSubscription();
                refetchUsage();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Thống kê sử dụng tháng này
          </CardTitle>
          <CardDescription>
            Theo dõi mức độ sử dụng các tính năng trong tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const percent = getUsagePercent(feature.used, feature.limit);
              const isOverLimit = feature.used > feature.limit && !isUnlimited(feature.limit);
              
              return (
                <div key={feature.key} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{feature.label}</span>
                    </div>
                    {isOverLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Vượt hạn
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Đã sử dụng</span>
                      <span className={isOverLimit ? 'text-red-600' : ''}>
                        {feature.used} / {isUnlimited(feature.limit) ? '∞' : feature.limit}
                      </span>
                    </div>
                    
                    {!isUnlimited(feature.limit) && (
                      <Progress 
                        value={percent} 
                        className={`h-2 ${isOverLimit ? 'progress-destructive' : ''}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionStatus;