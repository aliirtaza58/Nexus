import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const loggedUser: User = { ...res.data.user, avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.user.name)}&background=random`, isOnline: true };
        setUser(loggedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
        toast.success('Successfully logged in!');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to login';
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      if (res.data.success) {
        const newUser: User = { ...res.data.user, avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.user.name)}&background=random`, isOnline: true };
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to register';
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    toast.error('Not implemented in backend yet');
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    toast.error('Not implemented in backend yet');
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Optional: send logout to backend if you want to clear cookies
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const res = await axios.put('/api/profile', updates);
      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.data } as User;
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};