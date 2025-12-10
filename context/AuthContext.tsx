import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { User } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from storage on mount
  useEffect(() => {
    const storedUser = storage.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const storedUser = storage.findUser(email);
    if (storedUser && storedUser.password === password) {
      const { password, ...userWithoutPassword } = storedUser;
      setUser(userWithoutPassword);
      storage.setCurrentUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const existing = storage.findUser(email);
    if (existing) {
      return false; // User exists
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // In a real app, hash this!
      avatar: `https://picsum.photos/seed/${name}/100/100`,
    };

    storage.saveUser(newUser);
    
    // Auto login after register
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    storage.setCurrentUser(userWithoutPassword);
    return true;
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const authValue = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
  }), [user]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
