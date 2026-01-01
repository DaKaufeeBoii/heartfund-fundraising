
import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { User } from '../types';
import { supabase } from '../services/supabase';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0],
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar || `https://picsum.photos/seed/${session.user.id}/100/100`,
        };
        setUser(profile);
        storage.setCurrentUser(profile);
      }
      setIsLoading(false);
    };

    checkUser();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = {
          id: session.user.id,
          name: session.user.user_metadata.name,
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar,
        };
        setUser(profile);
        storage.setCurrentUser(profile);
      } else {
        setUser(null);
        storage.setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          avatar: `https://picsum.photos/seed/${email}/100/100`,
        }
      }
    });
    
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    storage.setCurrentUser(null);
  };

  const authValue = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
    isLoading,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
