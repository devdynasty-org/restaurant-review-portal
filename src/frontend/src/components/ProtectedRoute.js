// src/components/ProtectedRoute.js
// Wraps a route so only authorized users can see it.
//
// Usage in App.js:
//   <Route path="/owner/dashboard" element={
//     <ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>
//   } />
//
// Behaviour:
//   - still checking session  → render nothing (avoids a flash of redirect)
//   - not logged in           → redirect to /login
//   - logged in, wrong role   → redirect to /access-denied
//   - logged in, right role   → render the page

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // Wait for the initial /auth/me check to finish
  if (loading) {
    return null;
  }

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → access denied
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  // Authorized
  return children;
}

export default ProtectedRoute;
