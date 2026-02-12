import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ensureUserOrganization } from '../services/supabaseData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  orgId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    // M02A: Mock mode - skip Supabase auth during UI development
    if (!supabase) {
      console.log('ℹ️ Auth running in mock mode');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setOrgId(session?.user?.user_metadata?.org_id ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Clear demo mode when user signs in
      if (session?.user) {
        localStorage.removeItem('catchacrm_demo_mode');
        localStorage.removeItem('catchacrm_demo_start');

        // Check if user has org_id in metadata
        let userOrgId = session.user.user_metadata?.org_id;

        // If no org_id, try to ensure organization exists
        if (!userOrgId && _event === 'SIGNED_IN') {
          const result = await ensureUserOrganization(session.user.id, {
            companyName: session.user.user_metadata?.company_name,
            fullName: session.user.user_metadata?.full_name,
            email: session.user.email
          });
          userOrgId = result.orgId;
        }

        setOrgId(userOrgId ?? null);
      } else {
        setOrgId(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      console.log('ℹ️ Mock mode: Sign in skipped');
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!supabase) {
      console.log('ℹ️ Mock mode: Sign up skipped');
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    // If signup succeeded and we have a user, ensure organization exists
    // This is a fallback in case the database trigger doesn't fire
    if (!error && data?.user) {
      const result = await ensureUserOrganization(data.user.id, {
        companyName: metadata?.company_name,
        fullName: metadata?.full_name,
        email: email
      });

      if (result.orgId) {
        // Update local state with org_id
        setOrgId(result.orgId);
      }
    }

    return { error };
  };

  const signOut = async () => {
    // Always clear demo mode on sign out
    localStorage.removeItem('catchacrm_demo_mode');
    localStorage.removeItem('catchacrm_demo_start');

    if (!supabase) {
      console.log('ℹ️ Mock mode: Sign out completed (demo mode cleared)');
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      console.log('ℹ️ Mock mode: Password reset skipped');
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        orgId,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
