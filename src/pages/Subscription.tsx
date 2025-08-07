import { useAuth } from "@/contexts/AuthContext";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import Header from "@/components/Header";
import { Navigate } from "react-router-dom";

const Subscription = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Quản lý gói dịch vụ</h1>
            <p className="text-muted-foreground mt-2">
              Theo dõi và quản lý gói đăng ký của bạn
            </p>
          </div>
          
          <SubscriptionStatus />
        </div>
      </main>
    </div>
  );
};

export default Subscription;