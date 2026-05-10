import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { API_CONFIG } from '@/lib/api_config';
import { MOCK_USERS } from '@/lib/mockData';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      if (API_CONFIG.useMockData) {
        const mockUser = { id: MOCK_USERS[0].id, email: 'test@example.com' } as User;
        const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock' } as Session;
        setSession(mockSession);
        setUser(mockUser);
        setProfile(MOCK_USERS[0]);
        setLoading(false);
        return;
      }
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth Hub Connectivity Issue:', error);
        setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          try {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id);
            } else {
              setProfile(null);
              setLoading(false);
            }
          } catch (e) {
            console.error('Auth State Change Error:', e);
            setLoading(false);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (API_CONFIG.useMockData) {
      if (userId === MOCK_USERS[0].id) {
        setProfile(MOCK_USERS[0]);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (API_CONFIG.useMockData) {
      if (password === 'password123') {
        const emailPrefix = email.split('@')[0].toLowerCase();
        const selectedProfile = MOCK_USERS.find(u => 
          u.id.toLowerCase().includes(emailPrefix) || 
          u.full_name.toLowerCase().includes(emailPrefix)
        );

        if (selectedProfile) {
          const mockUser = { id: selectedProfile.id, email } as User;
          const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock' } as Session;
          setSession(mockSession);
          setUser(mockUser);
          setProfile(selectedProfile);
          return;
        }
      }
      throw new Error('Invalid credentials. Use <department>@itc.com / password123');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (API_CONFIG.useMockData) {
      throw new Error('Sign up not available in mock mode. Please use existing mock credentials.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });
      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    if (API_CONFIG.useMockData) {
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};