// src/pages/owner/OwnerLogin.js
// Branded owner entry point. Uses the UNIFIED login under the hood
// (AuthContext.login) — the old /api/auth/owner/login endpoint is gone.
// After login: owners -> dashboard, non-owners -> access denied.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon, Button, Field, inputStyle } from '../../components/ui';

const OwnerLogin = () => {
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
      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        // Logged in, but not an owner — send to access denied
        navigate('/access-denied');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: 'var(--login-cols, 1fr 1fr)' }}>
      {/* Left: brand panel */}
      <div style={{
        position: 'relative', background: 'var(--ink)', color: 'var(--surface)',
        padding: 'clamp(36px,5vw,64px)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .14, background: 'repeating-linear-gradient(135deg, var(--accent) 0 12px, transparent 12px 28px)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--surface)' }}>Tabletalk</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent-light, #f7b3c2)', marginBottom: 16 }}>
            Owner Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(30px,3.4vw,44px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: 0 }}>
            Manage your listings &amp; moderate reviews.
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.6, opacity: .72, margin: '18px 0 0', maxWidth: '40ch' }}>
            Add restaurants, keep your menus current, and flag reviews that break the guidelines.
          </p>
        </div>
        <div style={{ position: 'relative', fontFamily: 'var(--font-ui)', fontSize: 13, opacity: .55 }}>
          DevDynasty · Restaurant Review Portal
        </div>
      </div>

      {/* Right: form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,5vw,64px)', background: 'var(--bg)' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 30, color: 'var(--ink)', margin: '0 0 6px' }}>
            Welcome back
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, color: 'var(--muted-fg)', margin: '0 0 28px' }}>
            Sign in to your owner dashboard.
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

          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@restaurant.com" style={inputStyle} required />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} required />
          </Field>

          <Button full size="lg" type="submit" disabled={submitting} style={{ marginTop: 6 }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>

          <button type="button" onClick={() => navigate('/')}
            style={{ marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="arrowLeft" size={15} /> Back to discovery
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerLogin;
