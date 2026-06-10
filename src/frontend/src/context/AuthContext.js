// src/context/AuthContext.js
// Global authentication state for the whole app.
//
// Provides:
//   user      — the logged-in user object (or null)
//   loading   — true while we check the session on first load
//   login()   — log in, store the user
//   register()— register, auto-logs in (backend sets the cookie)
//   logout()  — log out, clear the user
//
// Any component reads this via: const { user, login } = useAuth();

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

// Create the context object
const AuthContext = createContext(null);

// Provider — wraps the app so every component can access auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the backend "am I already logged in?"
  // (the cookie may still be valid from a previous session)
  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.data.user))
      .catch(() => setUser(null))      // not logged in — that's fine
      .finally(() => setLoading(false));
  }, []);

  // ── login ────────────────────────────────────────────────────
  // Backend sets the httpOnly cookie; we store the returned user.
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.data.user);
    return res.data.data.user;        // return so caller can check role
  };

  // ── register ─────────────────────────────────────────────────
  // role is 'customer' or 'owner' (from the registration toggle).
  // Backend auto-logs-in on register (sets the cookie).
  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  // ── logout ───────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);                  // clear locally even if the call fails
    }
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for components to consume the auth state
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
