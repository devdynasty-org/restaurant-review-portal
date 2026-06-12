// src/pages/Login.js
// Unified login — role-based redirect after success.
// Two-column layout: editorial image left, form right.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon, Button, Field, inputStyle, ImagePlaceholder } from '../components/ui';

const ROLES = [['user', 'Customer'], ['store', 'Owner'], ['shield', 'Admin']];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'owner') navigate('/owner/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: editorial image */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--hairline)' }}>
        <ImagePlaceholder label="dining photo" accent="#be123c" style={{ height: '100%', border: 'none', borderRadius: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)', marginBottom: 14 }}>
            One login for everyone
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: '-.02em', color: '#fff', margin: 0, maxWidth: '17ch' }}>
            Sign in once — we'll take you to the right place.
          </h2>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Sign in / Register tabs */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--muted-bg)', borderRadius: 11, marginBottom: 26 }}>
            {[['Sign in', '/login'], ['Register', '/register']].map(([label, path]) => {
              const active = path === '/login';
              return (
                <button key={path} type="button" onClick={() => navigate(path)} style={{
                  flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                  background: active ? 'var(--surface)' : 'transparent',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  fontFamily: 'var(--font-ui)', fontSize: 14,
                  fontWeight: active ? 700 : 600,
                  color: active ? 'var(--ink)' : 'var(--muted-fg)',
                  border: 'none',
                }}>{label}</button>
              );
            })}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 30, color: 'var(--ink)', margin: '0 0 6px' }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: '0 0 22px', lineHeight: 1.5 }}>
            Your role is recognised automatically and you'll land on the matching dashboard.
          </p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderRadius: 10,
              background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
              color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 18,
            }}>
              <Icon name="x" size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle} required />
            </Field>

            {/* Password with Forgot? inline */}
            <label style={{ display: 'block', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>Password</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Forgot?</span>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle} required />
            </label>

            <Button full size="lg" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Role-routing note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 11, background: 'var(--muted-bg)', border: '1px solid var(--hairline)', margin: '18px 0 0' }}>
            <Icon name="shield" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.45 }}>
              Routed by role —{' '}
              {ROLES.map(([ic, l]) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--ink)', marginLeft: 6 }}>
                  <Icon name={ic} size={12} />{l}
                </span>
              ))}
            </div>
          </div>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)', textAlign: 'center', margin: '22px 0 0', lineHeight: 1.6 }}>
            New to Tabletalk? Register as a{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Customer</span>{' '}or{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Restaurant Owner</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
