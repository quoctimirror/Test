import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH_LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  // If allowedRoles array is provided, check if user has any of those roles
  // Otherwise, fall back to single requiredRole check
  const userRoles = user?.roles || [];
  let hasAccess = true;

  if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = userRoles.some(role => allowedRoles.includes(role));
  } else if (requiredRole) {
    hasAccess = userRoles.includes(requiredRole);
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="mx-auto h-16 w-16 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
            {allowedRoles && allowedRoles.length > 0
              ? ` This page requires one of these roles: ${allowedRoles.join(', ')}.`
              : requiredRole && ` This page requires ${requiredRole} role.`}
          </p>
          <p className="text-sm text-gray-500">
            Current role: {user?.roles ? user.roles.join(', ') : 'No role assigned'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;