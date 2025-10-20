import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, PlayerProfile } from '@/types';
import { userStorage, profileStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  profile: PlayerProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: PlayerProfile) => void;
  isAuthenticated: boolean;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    // Load user and profile from localStorage on mount
    const storedUser = userStorage.get();
    const storedProfile = profileStorage.get();
    
    if (storedUser) {
      setUser(storedUser);
    }
    if (storedProfile) {
      setProfile(storedProfile);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    // For demo, we'll just check if user exists in localStorage
    const storedUser = userStorage.get();
    
    if (storedUser && storedUser.email === email) {
      setUser(storedUser);
      const storedProfile = profileStorage.get();
      if (storedProfile) {
        setProfile(storedProfile);
      }
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (email: string, password: string) => {
    // Mock registration - create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      createdAt: new Date().toISOString(),
    };
    
    userStorage.set(newUser);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    // Note: We don't clear localStorage on logout so data persists
  };

  const updateProfile = (updatedProfile: PlayerProfile) => {
    profileStorage.set(updatedProfile);
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        hasProfile: !!profile,
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