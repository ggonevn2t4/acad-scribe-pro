import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  subscription: any;
  checkFeatureAccess: (feature: string) => Promise<boolean>;
  incrementUsage: (feature: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchSubscription(session.user.id);
      }
      
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setSubscription(null);
  };

  const fetchSubscription = async (userId: string) => {
    try {
      // TODO: Implement when subscribers table is ready
      const mockSubscription = {
        id: userId,
        plan_id: 'free',
        plan_name: 'Học Viên',
        billing_cycle: 'monthly',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: false
      };
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    if (!user) return false;
    
    // TODO: Implement when database functions are ready
    console.log('Checking feature access for:', feature);
    return true; // For now, allow all features
  };

  const incrementUsage = async (feature: string): Promise<boolean> => {
    if (!user) return false;

    // TODO: Implement when database functions are ready
    console.log('Incrementing usage for:', feature);
    return true; // For now, always succeed
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    subscription,
    checkFeatureAccess,
    incrementUsage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};