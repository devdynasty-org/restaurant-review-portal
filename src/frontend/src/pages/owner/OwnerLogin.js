import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon, Button, Field, FieldError, inputStyle } from '../../components/ui';

const OwnerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/auth/owner/login', { email, password }, { withCredentials: true });
      if (response.data.success) {
        navigate('/owner/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/access-denied');
      } else {
        setError('Invalid email or password. Try the demo credentials below.');
      }
    }
  };

  const fillDemo = () => {
    setEmail('owner@devdynasty.com');
    setPassword('Owner@1234');
    setError('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: 'var(--login-cols)' }}>
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent-light)', marginBottom: 16 }}>
            Owner Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(30px,3.4vw,44px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: 0 }}>
            Manage your listings &amp; moderate reviews.
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.6, opacity: .72, margin: '18px 0 0', maxWidth: '40ch' }}>
            Approve incoming reviews, keep your menus current, and track how diners rate your restaurants.
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
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@restaurant.com" style={inputStyle} required
            />
          </Field>
          <Field label="Password">
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} required
            />
          </Field>

          <Button full size="lg" type="submit" style={{ marginTop: 6 }}>Sign in</Button>

          {/* Demo credentials */}
          <button
            type="button" onClick={fillDemo}
            style={{
              marginTop: 16, width: '100%', textAlign: 'left', cursor: 'pointer',
              background: 'var(--muted-bg)', border: '1px dashed var(--hairline-strong)',
              borderRadius: 10, padding: '12px 14px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
              Demo credentials — tap to fill
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--muted-fg)' }}>
              owner@devdynasty.com · Owner@1234
            </div>
          </button>

          <button
            type="button" onClick={() => navigate('/')}
            style={{ marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="arrowLeft" size={15} /> Back to discovery
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerLogin;
