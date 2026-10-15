import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'owner';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCloudConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerOwner: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'SSJ_AUTH_USER';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const config = getSupabaseConfig();
      setIsCloudConnected(config.isConfigured);

      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'owner@sevenstar.com',
              role: 'owner'
            });
            setIsLoading(false);
            return;
          }

          client.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || 'owner@sevenstar.com',
                role: 'owner'
              });
            } else {
              setUser(null);
            }
          });
        } catch (e) {
          console.error('Supabase auth error:', e);
        }
      }

      // Check local session
      const savedUser = localStorage.getItem(LOCAL_AUTH_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // If corrupted, fallback
          setUser({
            id: 'local-owner',
            email: 'owner@sevenstarjewels.com',
            role: 'owner'
          });
        }
      } else {
        // Default owner session for immediate zero-friction access
        const defaultOwner: UserProfile = {
          id: 'local-owner',
          email: 'owner@sevenstarjewels.com',
          role: 'owner'
        };
        setUser(defaultOwner);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(defaultOwner));
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'owner'
          };
          setUser(profile);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local authentication fallback
    const localUser: UserProfile = {
      id: 'local-owner',
      email: email.trim().toLowerCase(),
      role: 'owner'
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
    return { success: true };
  };

  const registerOwner = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            role: 'owner'
          });
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Sign up failed' };
      }
    }

    const localUser: UserProfile = {
      id: 'local-owner',
      email: email.trim().toLowerCase(),
      role: 'owner'
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
    return { success: true };
  };

  const logout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isCloudConnected,
        login,
        logout,
        registerOwner
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
