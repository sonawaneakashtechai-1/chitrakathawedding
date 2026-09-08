import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isDemoAdmin: boolean;
  loading: boolean;
  loginDemo: () => void;
  logoutDemo: () => void;
  signInWithPassword: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('chitrakatha_demo_admin') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginDemo = () => {
    setIsDemoAdmin(true);
    localStorage.setItem('chitrakatha_demo_admin', 'true');
  };

  const logoutDemo = () => {
    setIsDemoAdmin(false);
    localStorage.removeItem('chitrakatha_demo_admin');
  };

  const signInWithPassword = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      return { error: error as Error | null };
    } else {
      // Fallback demo auth check
      if (email === 'clicksbyhemant5564@gmail.com' && pass === 'chitrakatha2026') {
        loginDemo();
        return { error: null };
      }
      return { error: new Error('Invalid credentials. Use demo login or configure Supabase Auth.') };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    logoutDemo();
  };

  const isAdmin = Boolean(user || isDemoAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isDemoAdmin,
        loading,
        loginDemo,
        logoutDemo,
        signInWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
