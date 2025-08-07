import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionTier = 'free' | 'student' | 'premium' | 'institutional';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionData {
  id: string;
  subscription_tier: SubscriptionTier;
  billing_cycle: BillingCycle | null;
  subscription_start: string | null;
  subscription_end: string | null;
  is_active: boolean;
}

export interface UsageData {
  [feature: string]: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData>({});
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data);
      } else {
        // Create default free subscription
        const { data: newSub, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email || '',
            subscription_tier: 'free',
            is_active: true
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSubscription(newSub);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('feature_type, usage_count')
        .eq('user_id', user.id)
        .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (error) throw error;

      const usageMap: UsageData = {};
      data?.forEach(item => {
        usageMap[item.feature_type] = item.usage_count;
      });
      setUsage(usageMap);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const checkFeatureLimit = async (featureType: string): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      const { data, error } = await supabase.rpc('check_feature_limit', {
        p_user_id: user.id,
        p_feature_type: featureType,
        p_subscription_tier: subscription.subscription_tier
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking feature limit:', error);
      return false;
    }
  };

  const incrementUsage = async (featureType: string) => {
    if (!user) return;

    try {
      await supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_type: featureType
      });
      
      // Refresh usage data
      fetchUsage();
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const getFeatureLimit = (featureType: string): number => {
    if (!subscription) return 0;

    const limits = {
      free: {
        outline_generator: 3,
        writing_projects: 2,
        grammar_check: 5,
        document_summarizer: 0,
        citation_manager: 0,
        plagiarism_check: 0
      },
      student: {
        outline_generator: 999999,
        writing_projects: 20,
        grammar_check: 999999,
        document_summarizer: 50,
        citation_manager: 999999,
        plagiarism_check: 10
      },
      premium: {
        outline_generator: 999999,
        writing_projects: 999999,
        grammar_check: 999999,
        document_summarizer: 999999,
        citation_manager: 999999,
        plagiarism_check: 999999
      },
      institutional: {
        outline_generator: 999999,
        writing_projects: 999999,
        grammar_check: 999999,
        document_summarizer: 999999,
        citation_manager: 999999,
        plagiarism_check: 999999
      }
    };

    return limits[subscription.subscription_tier]?.[featureType as keyof typeof limits.free] || 0;
  };

  const hasFeatureAccess = (featureType: string): boolean => {
    return getFeatureLimit(featureType) > 0;
  };

  const getRemainingUsage = (featureType: string): number => {
    const limit = getFeatureLimit(featureType);
    const used = usage[featureType] || 0;
    return Math.max(0, limit - used);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  useEffect(() => {
    if (subscription) {
      fetchUsage();
    }
  }, [subscription]);

  return {
    subscription,
    usage,
    loading,
    checkFeatureLimit,
    incrementUsage,
    getFeatureLimit,
    hasFeatureAccess,
    getRemainingUsage,
    refreshSubscription: fetchSubscription,
    refreshUsage: fetchUsage
  };
};