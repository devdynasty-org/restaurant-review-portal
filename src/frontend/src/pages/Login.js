// src/pages/Login.js
// Customer (and owner) login page. Uses AuthContext.login().
// On success, redirects by role: owner -> dashboard, otherwise home.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon, Button, Field, FieldError, inputStyle } from '../components/ui';

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
      // Redirect by role
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
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 'clamp(40px,6vw,72px) 20px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
        Welcome back
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,4vw,38px)', color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-.02em' }}>
        Sign in
      </h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, color: 'var(--muted-fg)', margin: '0 0 28px' }}>
        Sign in to write reviews and manage your account.
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
        <Field label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" style={inputStyle} required />
        </Field>
        <Button full size="lg" type="submit" disabled={submitting} style={{ marginTop: 6 }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', marginTop: 22, textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;
