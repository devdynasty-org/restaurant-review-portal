// src/pages/Register.js
// Registration with Customer / Owner role toggle.
// Two-column layout: editorial image left, form right.

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon, Button, Field, inputStyle, ImagePlaceholder } from '../components/ui';

function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'var(--danger)', '#d97706', '#2563eb', 'var(--success)'];

const BULLETS = [
  'Customers rate restaurants and dishes',
  'Owners respond to reviews & manage listings',
  'Pick your account type below',
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(name, email, password, role);
      if (user.role === 'owner') navigate('/owner/dashboard');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map(x => x.message).join(' ')
        : err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
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
            Join the table
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: '-.02em', color: '#fff', margin: '0 0 24px', maxWidth: '16ch' }}>
            Register as a diner — or list your restaurant.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {BULLETS.map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11, fontFamily: 'var(--font-ui)', fontSize: 14.5, color: 'rgba(255,255,255,.92)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="check" size={13} style={{ color: '#fff' }} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'var(--bg)', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Sign in / Register tabs */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--muted-bg)', borderRadius: 11, marginBottom: 24 }}>
            {[['Sign in', '/login'], ['Register', '/register']].map(([label, path]) => {
              const active = path === '/register';
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

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--ink)', margin: '0 0 14px' }}>
            Create your account
          </h1>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderRadius: 10,
              background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
              color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 18,
            }}>
              <Icon name="x" size={16} /> {error}
            </div>
          )}

          {/* Account type selector */}
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
            I'm registering as a…
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              ['customer', 'user', 'Customer', 'Diner'],
              ['owner', 'store', 'Owner', 'Restaurant'],
            ].map(([value, icon, label, sub]) => {
              const active = role === value;
              return (
                <button key={value} type="button" onClick={() => setRole(value)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '13px 14px',
                  borderRadius: 11, cursor: 'pointer', textAlign: 'left',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--hairline-strong)'}`,
                  background: active ? 'var(--danger-bg)' : 'var(--surface)',
                }}>
                  <Icon name={icon} size={18} style={{ color: active ? 'var(--accent)' : 'var(--muted-fg)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--muted-fg)' }}>{sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <Field label="Full name">
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" style={inputStyle} required />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle} required />
            </Field>

            <label style={{ display: 'block', marginBottom: password ? 8 : 18 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 7 }}>Password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, number, symbol" style={inputStyle} required />
            </label>

            {/* Strength meter */}
            {password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 999,
                      background: i < strength ? STRENGTH_COLORS[strength] : 'var(--muted-bg)',
                      transition: 'background .2s ease',
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: STRENGTH_COLORS[strength], whiteSpace: 'nowrap' }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
              <button type="button" onClick={() => setTerms(t => !t)} style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, cursor: 'pointer',
                background: terms ? 'var(--accent)' : 'transparent',
                border: `1.5px solid ${terms ? 'var(--accent)' : 'var(--hairline-strong)'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}>
                {terms && <Icon name="check" size={11} style={{ color: '#fff' }} />}
              </button>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted-fg)' }}>
                I agree to the{' '}
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Terms of Service</span>{' '}
                and <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Community Guidelines</span>.
              </span>
            </div>

            <Button full size="lg" type="submit" disabled={submitting || !terms}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          {/* Admin note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 10, background: 'var(--muted-bg)', border: '1px solid var(--hairline)', margin: '16px 0 0' }}>
            <Icon name="lock" size={15} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted-fg)' }}>
              Admin accounts can't be self-registered — they're created by an existing admin.
            </span>
          </div>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)', textAlign: 'center', margin: '16px 0 0' }}>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12.5, padding: 0 }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
