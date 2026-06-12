// src/pages/Profile.js
// Account overview page — shows name, email, role and provides sign-out / delete.

import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Icon } from '../components/ui';

const INFO_ROWS = [
  { label: 'Full name',     key: 'name',  icon: 'user' },
  { label: 'Email address', key: 'email', icon: 'lock' },
];

const ROLE_LABELS = { customer: 'Customer', owner: 'Restaurant Owner', admin: 'Administrator' };
const ROLE_ICONS  = { customer: 'user', owner: 'store', admin: 'shield' };

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const initials   = user.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const roleLabel  = ROLE_LABELS[user.role] || user.role;
  const roleIcon   = ROLE_ICONS[user.role]  || 'user';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(40px,6vw,70px) clamp(18px,4vw,40px) 80px' }}>

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 32,
          fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600,
          color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <Icon name="arrowLeft" size={15} /> Back
      </button>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <div style={{
          width: 70, height: 70, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent)', color: 'var(--accent-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-ui)', fontSize: 24, fontWeight: 700,
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--ink)', margin: '0 0 5px', letterSpacing: '-.01em' }}>
            {user.name}
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--muted-bg)', border: '1px solid var(--hairline)' }}>
            <Icon name={roleIcon} size={12} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '.03em' }}>{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Account info card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 'var(--card-radius)', padding: '22px 24px',
        marginBottom: 16, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-fg)', marginBottom: 16 }}>
          Account info
        </div>

        {INFO_ROWS.map((row, i) => (
          <div key={row.key} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
            borderBottom: i < INFO_ROWS.length - 1 ? '1px solid var(--hairline)' : 'none',
          }}>
            <Icon name={row.icon} size={16} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--muted-fg)', marginBottom: 2 }}>{row.label}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{user[row.key]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Password row */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 'var(--card-radius)', padding: '16px 24px',
        marginBottom: 24, boxShadow: 'var(--shadow-sm)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Icon name="lock" size={16} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--muted-fg)', marginBottom: 2 }}>Password</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>••••••••</div>
        </div>
        <button type="button" style={{
          fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--accent)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
        }}>
          Change
        </button>
      </div>

      <Button variant="ghost" icon="logout" onClick={handleLogout} full>Sign out</Button>

      {/* Danger zone */}
      <div style={{
        marginTop: 36, padding: '20px 24px',
        borderRadius: 'var(--card-radius)',
        border: '1px solid var(--danger-border)', background: 'var(--danger-bg)',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 8 }}>
          Danger zone
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '0 0 14px', lineHeight: 1.5 }}>
          Permanently deletes your account and all associated data. This cannot be undone.
        </p>
        <Button variant="danger" size="sm" icon="trash">Delete my account</Button>
      </div>
    </div>
  );
};

export default Profile;
