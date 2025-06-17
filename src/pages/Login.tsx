
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Bus, MapPin, Shield, Users } from 'lucide-react';

const Login = () => {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await login(email, password);
      toast({
        title: "Welcome to Pravaas!",
        description: "Successfully logged in",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@pravaas.com', icon: Shield },
    { role: 'Driver', email: 'driver@pravaas.com', icon: Bus },
    { role: 'Student', email: 'student@pravaas.com', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PRAVAAS</h1>
          <p className="text-slate-400 text-lg">NEVER MISS YOUR BUS AGAIN</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold"
              disabled={isLoggingIn || loading}
            >
              {isLoggingIn ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm mb-3">Demo Credentials (Password: password123)</p>
            <div className="space-y-2">
              {demoCredentials.map(({ role, email, icon: Icon }) => (
                <button
                  key={role}
                  onClick={() => {
                    setEmail(email);
                    setPassword('password123');
                  }}
                  className="w-full flex items-center gap-3 p-2 bg-slate-700 hover:bg-slate-600 rounded text-left text-sm transition-colors"
                >
                  <Icon className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">{role}</div>
                    <div className="text-slate-400 text-xs">{email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
