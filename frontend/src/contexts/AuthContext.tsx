import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, PlayerProfile } from '@/types';
import { authApi, profileApi } from '@/lib/api';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  profile: PlayerProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<{ isNewUser: boolean }>;
  logout: () => void;
  updateProfile: (profile: PlayerProfile) => void;
  isAuthenticated: boolean;
  hasProfile: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and fetch user data
          const userData = await authApi.me();
          setUser(userData);
          
          // Fetch user profile
          try {
            const profileData = await profileApi.get();
            setProfile(profileData);
          } catch (error) {
            // Profile might not exist yet, which is fine
            console.log('No profile found');
          }
        } catch (error) {
          // Token is invalid or expired
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('token', response.access_token);
      
      // Fetch user data
      const userData = await authApi.me();
      setUser(userData);
      
      // Fetch user profile
      try {
        const profileData = await profileApi.get();
        setProfile(profileData);
      } catch (error) {
        // Profile might not exist yet
        console.log('No profile found');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await authApi.signup(email, password);
      localStorage.setItem('token', response.access_token);
      
      // Fetch user data
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  };

  const googleLogin = async () => {
    try {
      // Sign in with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get Firebase ID token
      const idToken = await result.user.getIdToken();
      
      // Send Firebase ID token to backend
      const response = await authApi.googleAuth(idToken);
      localStorage.setItem('token', response.access_token);
      
      // Fetch user data
      const userData = await authApi.me();
      setUser(userData);
      
      // Try to fetch user profile
      if (!response.is_new_user) {
        try {
          const profileData = await profileApi.get();
          setProfile(profileData);
        } catch (error) {
          // Profile might not exist yet
          console.log('No profile found');
        }
      }
      
      return { isNewUser: response.is_new_user };
    } catch (error) {
      console.error('Google login failed:', error);
      throw new Error('Google authentication failed');
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('token');
  };

  const updateProfile = (updatedProfile: PlayerProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        hasProfile: !!profile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};