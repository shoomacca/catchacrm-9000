import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check for demo mode (M02A: mock-first development)
  const isDemoMode = localStorage.getItem('catchacrm_demo_mode') === 'true';

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm font-semibold text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not authenticated (and not in demo mode), redirect to login
  if (requireAuth && !user && !isDemoMode) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If on login/signup page and already authenticated, redirect to app
  if (!requireAuth && (user || isDemoMode)) {
    return <Navigate to="/sales" replace />;
  }

  return <>{children}</>;
};
