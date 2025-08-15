import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { MapPin, Shield, Users, Bus } from 'lucide-react';

const Login = () => {
  const { user, login, loginWithUID, signup, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [busId, setBusId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateUID = (uid: string): boolean => {
    // Format: 0875CS241053
    // 0875 (college code) + CS (branch, 2 letters) + 24 (year) + 1053 (roll, 4 digits)
    const uidPattern = /^0875[A-Za-z]{2}\d{6}$/;
    return uidPattern.test(uid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      if (isSignup) {
        if (role === 'student') {
          if (!validateUID(uid)) {
            throw new Error('Invalid UID format. Should be like: 0875CS241053');
          }
          await signup('', password, name, role, busId, uid.toUpperCase());
        } else {
          await signup(email, password, name, role, role === 'admin' ? undefined : busId);
        }
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully",
        });
      } else {
        // Login
        if (role === 'student') {
          if (!validateUID(uid)) {
            throw new Error('Invalid UID format. Should be like: 0875CS241053');
          }
          await loginWithUID(uid.toUpperCase(), password);
        } else {
          await login(email, password);
        }
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

        {/* Login/Signup Form */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              {isSignup ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSignup ? 'Join Pravaas today' : 'Welcome back to Pravaas'}
            </p>
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
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="role" className="text-white">Account Type</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isSignup && (
              <div>
                <Label htmlFor="role" className="text-white">I am a</Label>
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
            )}

            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {role === 'student' ? (
              <div>
                <Label htmlFor="uid" className="text-white">Student UID</Label>
                <Input
                  id="uid"
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value.toUpperCase())}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0875CS241053"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Format: 0875 + Branch (CS) + Year (24) + Roll (1053)
                </p>
              </div>
            ) : (
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
            )}

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

            {isSignup && role !== 'admin' && (
              <div>
                <Label htmlFor="busId" className="text-white">Bus ID</Label>
                <Select value={busId} onValueChange={setBusId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select your bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 22}, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={`S${num}`}>S{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold"
              disabled={isLoggingIn || loading}
            >
              {isLoggingIn
                ? (isSignup ? 'CREATING ACCOUNT...' : 'SIGNING IN...')
                : (isSignup ? 'CREATE ACCOUNT' : 'SIGN IN')
              }
            </Button>
          </form>

          {/* Admin Quick Login */}
          {!isSignup && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-3">Admin Quick Login:</p>
              <button
                onClick={() => {
                  setRole('admin');
                  setEmail('admin@pravaas.com');
                  setPassword('pravaas@admin');
                }}
                className="w-full flex items-center gap-3 p-2 bg-slate-700 hover:bg-slate-600 rounded text-left text-sm transition-colors"
              >
                <Shield className="w-4 h-4 text-yellow-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">Admin</div>
                  <div className="text-slate-400 text-xs">admin@pravaas.com</div>
                </div>
                <div className="text-xs text-slate-500">Click to fill</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;