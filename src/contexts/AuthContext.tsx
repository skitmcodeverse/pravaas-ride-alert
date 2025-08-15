
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'driver' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  busId?: string;
  homeLatitude?: number;
  homeLongitude?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithUID: (uid: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, busId?: string, studentUid?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateHomeLocation: (lat: number, lng: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setLoading(false);
        setIsInitialized(true);
        
        // Defer profile fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setIsInitialized(true);
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        setUser({
          id: profile.user_id,
          email: profile.email,
          role: profile.role as UserRole,
          name: profile.name,
          busId: profile.bus_id,
          homeLatitude: profile.home_latitude,
          homeLongitude: profile.home_longitude,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole, busId?: string, studentUid?: string) => {
    setLoading(true);
    try {
      // For students, use UID as email with @student.pravaas.com domain
      const authEmail = role === 'student' ? `${studentUid}@student.pravaas.com` : email;
      
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              email: role === 'student' ? authEmail : email,
              name,
              role,
              bus_id: busId,
              student_uid: studentUid,
              home_latitude: 22.736995, // Default location
              home_longitude: 75.919283,
            },
          ]);

        if (profileError) throw profileError;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const loginWithUID = async (uid: string, password: string) => {
    setLoading(true);
    try {
      // Convert UID to email format for authentication
      const email = `${uid}@student.pravaas.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateHomeLocation = async (lat: number, lng: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          home_latitude: lat,
          home_longitude: lng,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local user state
      setUser({
        ...user,
        homeLatitude: lat,
        homeLongitude: lng,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update home location');
    }
  };

  // Don't render children until context is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, login, loginWithUID, signup, logout, loading, updateHomeLocation }}>
      {children}
    </AuthContext.Provider>
  );
};
