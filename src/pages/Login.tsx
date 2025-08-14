
import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Bus, MapPin, Shield, Users } from 'lucide-react';

const Login = () => {
  const { user, login, signup, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [busId, setBusId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      if (isSignup) {
        await signup(email, password, name, role, role === 'admin' ? undefined : busId);
        toast({
          title: "Demo Account Created!",
          description: "Your demo account has been created successfully",
        });
      } else {
        await login(email, password);
        toast({
          title: "Welcome to Pravaas!",
          description: "Successfully logged in",
        });
      }
    } catch (error: any) {
      toast({
        title: isSignup ? "Signup Failed" : "Login Failed",
        description: error.message || "Please try again",
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

        {/* Demo Login/Signup Form */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Demo Access</h2>
            <p className="text-slate-400 text-sm">Create demo accounts or use existing credentials</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isSignup
                    ? 'bg-yellow-400 text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isSignup
                    ? 'bg-yellow-400 text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Create Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter demo user name"
                  required
                />
              </div>
            )}

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

            {isSignup && (
              <>
                <div>
                  <Label htmlFor="role" className="text-white">Role</Label>
                  <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role !== 'admin' && (
                  <div>
                    <Label htmlFor="busId" className="text-white">Bus ID</Label>
                    <Input
                      id="busId"
                      type="text"
                      value={busId}
                      onChange={(e) => setBusId(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter bus ID (e.g., bus-001)"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold"
              disabled={isLoggingIn || loading}
            >
              {isLoggingIn
                ? (isSignup ? 'CREATING DEMO...' : 'SIGNING IN...')
                : (isSignup ? 'CREATE DEMO ACCOUNT' : 'SIGN IN')
              }
            </Button>
          </form>

          {/* Quick Demo Setup */}
          {!isSignup && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-3">Quick Demo Setup - Create these demo accounts:</p>
              <div className="space-y-2">
                {demoCredentials.map(({ role, email, icon: Icon }) => (
                  <button
                    key={role}
                    onClick={() => {
                      setEmail(email);
                      setPassword('password123');
                      setName(`${role} Demo`);
                      setRole(role.toLowerCase() as UserRole);
                      setBusId(role !== 'Admin' ? 'bus-001' : '');
                      setIsSignup(true);
                    }}
                    className="w-full flex items-center gap-3 p-2 bg-slate-700 hover:bg-slate-600 rounded text-left text-sm transition-colors"
                  >
                    <Icon className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1">
                      <div className="text-white font-medium">{role}</div>
                      <div className="text-slate-400 text-xs">{email}</div>
                    </div>
                    <div className="text-xs text-slate-500">Click to create</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
