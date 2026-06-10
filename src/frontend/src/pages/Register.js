// src/pages/Register.js
// Registration with a Customer / Owner role toggle.
// Uses AuthContext.register(). Backend whitelists role (admin can't be picked).
// On success, redirects by role.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon, Button, Field, inputStyle } from '../components/ui';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(name, email, password, role);
      if (user.role === 'owner') navigate('/owner/dashboard');
      else navigate('/');
    } catch (err) {
      // Surface validation messages from the backend (e.g. weak password,
      // email already registered)
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map(x => x.message).join(' ')
        : err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Role toggle button styling
  const roleBtn = (value, label, sub) => {
    const active = role === value;
    return (
      <button type="button" onClick={() => setRole(value)} style={{
        flex: 1, textAlign: 'left', cursor: 'pointer', padding: '14px 16px', borderRadius: 11,
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? 'var(--accent-ink)' : 'var(--ink)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline-strong)'}`,
        transition: 'all .15s ease',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, opacity: active ? .85 : .6, marginTop: 2 }}>{sub}</div>
      </button>
    );
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: 'clamp(40px,6vw,72px) 20px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
        Join Tabletalk
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,4vw,38px)', color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-.02em' }}>
        Create your account
      </h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, color: 'var(--muted-fg)', margin: '0 0 28px' }}>
        Review restaurants, or manage your own listings.
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
        {/* Role toggle */}
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>
            I'm registering as a
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            {roleBtn('customer', 'Diner', 'Browse & review')}
            {roleBtn('owner', 'Restaurant owner', 'Manage listings')}
          </div>
        </div>

        <Field label="Name">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name" style={inputStyle} required />
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" style={inputStyle} required />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 chars, 1 uppercase, 1 number, 1 symbol" style={inputStyle} required />
        </Field>

        <Button full size="lg" type="submit" disabled={submitting} style={{ marginTop: 6 }}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', marginTop: 22, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
