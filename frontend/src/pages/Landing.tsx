import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Target, BarChart3, Share2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { profileApi } from '@/lib/api';

const Landing = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      showSuccess('Welcome back!');
      
      // Check if profile exists after login completes
      try {
        await profileApi.get();
        navigate('/dashboard');
      } catch (error) {
        // No profile exists, redirect to create profile
        navigate('/profile/create');
      }
    } catch (error) {
      showError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(registerEmail, registerPassword);
      showSuccess('Account created! Let\'s set up your profile.');
      navigate('/profile/create');
    } catch (error) {
      showError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      showError('Google authentication failed');
      return;
    }

    setIsLoading(true);
    try {
      const { isNewUser } = await googleLogin(credentialResponse.credential);
      showSuccess(isNewUser ? 'Account created! Let\'s set up your profile.' : 'Welcome back!');
      
      if (isNewUser) {
        navigate('/profile/create');
      } else {
        // Check if profile exists
        try {
          await profileApi.get();
          navigate('/dashboard');
        } catch (error) {
          navigate('/profile/create');
        }
      }
    } catch (error) {
      showError('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    showError('Google authentication failed');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elevate
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Making progress visible for every young athlete. Track your stats, visualize your growth, and level up your game.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="gradient-card-blue border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-10 h-10 text-primary" />
                <CardTitle className="text-white">Track Everything</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Log game stats, training drills, and skill metrics all in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card-purple border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-10 h-10 text-primary" />
                <CardTitle className="text-white">See Your Progress</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Visual charts and graphs show your improvement over time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card-green border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="w-10 h-10 text-primary" />
                <CardTitle className="text-white">Share with Coaches</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Easy sharing with parents and coaches to support your development
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="gradient-card-blue border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-400">
                    Login to continue tracking your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="athlete@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="bg-black/20 border-white/10 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    
                    <div className="relative my-4">
                      <Separator className="bg-white/10" />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-sm text-gray-400">
                        or
                      </span>
                    </div>
                    
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_black"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="gradient-card-purple border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Create Account</CardTitle>
                  <CardDescription className="text-gray-400">
                    Start your journey to becoming a better athlete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="athlete@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        className="bg-black/20 border-white/10 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                    
                    <div className="relative my-4">
                      <Separator className="bg-white/10" />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-sm text-gray-400">
                        or
                      </span>
                    </div>
                    
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        size="large"
                        text="signup_with"
                        shape="rectangular"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Landing;