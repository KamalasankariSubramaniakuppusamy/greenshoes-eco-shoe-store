// ============================================================================
// ProtectedRoute.jsx
// ============================================================================
// Most commenting for the logic is done in the backend and this is just how all the logic looks like in the 
// front screen
// Route wrapper that requires authentication
// If user isn't logged in, redirects to login page
//
// Usage in routes:
//   <Route path="/account" element={
//     <ProtectedRoute>
//       <AccountPage />
//     </ProtectedRoute>
//   } />

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children }) => {
  // Get auth state from context
  // loading = true while we're checking if user has a valid token
  // isAuthenticated = true if user is logged in
  const { isAuthenticated, loading } = useAuth();

  // Still checking auth status (e.g., verifying token on page load)
  // Show loading spinner instead of flashing login page then redirecting back
  if (loading) {
    return <Loading fullScreen />;
  }

  // Not logged in - send them to login
  // replace: true means this redirect won't be in browser history
  // so hitting "back" won't bring them back to this protected page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - render the protected content
  return children;
};

export default ProtectedRoute;

// ----------------------------------------------------------------------------
// How this works with AuthContext:
//
// 1. User visits /account (protected route)
// 2. ProtectedRoute renders, calls useAuth()
// 3. If loading=true (checking localStorage token), show spinner
// 4. If isAuthenticated=false, redirect to /login
// 5. If isAuthenticated=true, render <AccountPage />
//
// The AuthContext handles:
// - Checking for token in localStorage on app load
// - Verifying token is still valid (not expired)
// - Setting isAuthenticated accordingly
// ----------------------------------------------------------------------------