import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
    <div style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: 420 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 500, color: 'var(--accent)', lineHeight: 1 }}>403</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.6rem', color: 'var(--ink)', margin: '1rem 0 .5rem' }}>Access Denied</h2>
      <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        You don't have permission to view this page.
      </p>
      <Link to="/" style={{
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14.5,
        color: 'var(--accent-ink)', background: 'var(--accent)',
        padding: '11px 22px', borderRadius: 10, textDecoration: 'none', display: 'inline-block',
      }}>Back to Discover</Link>
    </div>
  </div>
);

export default AccessDenied;
