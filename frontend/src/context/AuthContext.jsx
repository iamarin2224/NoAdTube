import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (formData) => {
    const response = await authApi.register(formData);
    return response;
  };

  const verifyOTP = async ({ email, otp }) => {
    const response = await authApi.verifyOTP({ email, otp });
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const resendOTP = async ({ email }) => {
    const response = await authApi.resendOTP({ email });
    return response;
  };

  const googleLogin = async (credentialData) => {
    const response = await authApi.googleAuth(credentialData);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerified: user ? user.isVerified !== false : false,
        isLoading,
        login,
        register,
        verifyOTP,
        resendOTP,
        googleLogin,
        logout,
        updateUser,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
