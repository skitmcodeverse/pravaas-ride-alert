
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'driver' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  busId?: string; // For drivers and students
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('pravaas_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Mock authentication - replace with Supabase auth
    const mockUsers: User[] = [
      { id: '1', email: 'admin@pravaas.com', role: 'admin', name: 'Admin User' },
      { id: '2', email: 'driver@pravaas.com', role: 'driver', name: 'John Driver', busId: 'bus-001' },
      { id: '3', email: 'student@pravaas.com', role: 'student', name: 'Jane Student', busId: 'bus-001' },
    ];

    const foundUser = mockUsers.find(u => u.email === email && password === 'password123');
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('pravaas_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pravaas_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
