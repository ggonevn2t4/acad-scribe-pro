import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionData {
  id: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export interface UsageData {
  outlines: number;
  writings: number;
  grammar: number;
  summaries: number;
  citations: number;
  exports: number;
  aiAssistant: number;
  templates: number;
  plagiarism: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement when subscribers table is ready
      const mockSubscription: SubscriptionData = {
        id: user.id,
        plan_id: 'free',
        plan_name: 'Học Viên',
        billing_cycle: 'monthly',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: false
      };
      
      setSubscription(mockSubscription);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Lỗi tải thông tin gói",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    if (!user) {
      setUsage(null);
      return;
    }

    try {
      // TODO: Implement when usage_tracking table is ready
      const mockUsage: UsageData = {
        outlines: 1,
        writings: 0,
        grammar: 2,
        summaries: 0,
        citations: 3,
        exports: 1,
        aiAssistant: 2,
        templates: 0,
        plagiarism: 0
      };
      
      setUsage(mockUsage);
    } catch (error: any) {
      console.error('Error fetching usage:', error);
    }
  };

  const checkFeatureLimit = async (feature: string): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      // TODO: Implement when database functions are ready
      console.log('Checking feature limit for:', feature);
      return true; // For now, allow all features
    } catch (error: any) {
      console.error('Error checking feature limit:', error);
      return false;
    }
  };

  const incrementFeatureUsage = async (feature: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // TODO: Implement when database functions are ready
      console.log('Incrementing feature usage for:', feature);
      
      // Refresh usage data
      await fetchUsage();
      
      return true; // For now, always succeed
    } catch (error: any) {
      console.error('Error incrementing feature usage:', error);
      toast({
        title: "Lỗi cập nhật sử dụng",
        description: "Không thể cập nhật thống kê sử dụng",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [user]);

  return {
    subscription,
    usage,
    loading,
    checkFeatureLimit,
    incrementFeatureUsage,
    refetchSubscription: fetchSubscription,
    refetchUsage: fetchUsage
  };
};