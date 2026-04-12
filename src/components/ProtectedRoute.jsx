import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user) {
    // Not logged in, redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but doesn't have the required role
    // Redirect to their respective dashboard based on their role
    if (user.role === 'Donor') return <Navigate to="/donor" replace />;
    if (user.role === 'NGO') return <Navigate to="/ngo" replace />;
    if (user.role === 'Volunteer') return <Navigate to="/volunteer" replace />;
    
    // Default fallback
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
