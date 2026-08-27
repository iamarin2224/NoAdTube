import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If user is authenticated and verified, redirect away from login/register/otp
  if (isAuthenticated && user?.isVerified !== false) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};
