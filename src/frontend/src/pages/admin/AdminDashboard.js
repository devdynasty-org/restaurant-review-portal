// src/pages/admin/AdminDashboard.js
// Admin moderation queue. Lists flagged reviews and lets the admin
// REMOVE (uphold the flag) or DISMISS (restore the review).
// Backend: GET /admin/reviews/flagged, PUT /admin/reviews/:id/remove,
//          PUT /admin/reviews/:id/dismiss

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, Stars, Button, relativeDate } from '../../components/ui';

const CATEGORIES = [
  { key: 'food_quality',     label: 'Food' },
  { key: 'customer_service', label: 'Service' },
  { key: 'ambiance',         label: 'Ambiance' },
  { key: 'value_for_money',  label: 'Value' },
];

function reviewAvg(rev) {
  return (rev.food_quality + rev.customer_service + rev.ambiance + rev.value_for_money) / 4;
}

function FlaggedCard({ rev, onResolved }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);  // 'removed' | 'dismissed'

  const act = async (kind) => {
    setBusy(true);
    try {
      const path = kind === 'removed'
        ? `/admin/reviews/${rev.review_id}/remove`
        : `/admin/reviews/${rev.review_id}/dismiss`;
      await api.put(path);
      setDone(kind);
      setTimeout(() => onResolved(rev.review_id), 360);
    } catch (err) {
      setBusy(false);
    }
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 'var(--card-radius)', padding: 'clamp(18px,2.4vw,24px)',
      boxShadow: 'var(--shadow-sm)',
      opacity: done ? 0 : 1,
      transform: done ? 'translateX(12px)' : 'none',
      transition: 'opacity .34s ease, transform .34s ease',
      borderLeft: `3px solid ${done === 'removed' ? 'var(--danger)' : done === 'dismissed' ? 'var(--success)' : 'var(--accent)'}`,
    }}>
      {/* Restaurant + review meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>
          on <strong style={{ color: 'var(--ink)' }}>{rev.restaurant?.name || 'Unknown restaurant'}</strong>
        </div>
        <Stars value={reviewAvg(rev)} size={14} />
      </div>

      {/* Author + date */}
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--ink)', fontWeight: 700 }}>
        {rev.author?.name || 'Anonymous'}
        <span style={{ fontWeight: 400, color: 'var(--muted-fg)', marginLeft: 8, fontSize: 12.5 }}>{relativeDate(rev.createdAt)}</span>
      </div>

      {/* Comment */}
      {rev.comments && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.55, color: 'var(--muted-fg)', margin: '8px 0 14px' }}>{rev.comments}</p>
      )}

      {/* Per-category */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATEGORIES.map(c => (
          <span key={c.key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-ui)',
            fontSize: 12, color: 'var(--muted-fg)', background: 'var(--muted-bg)',
            padding: '4px 9px', borderRadius: 7, border: '1px solid var(--hairline)',
          }}>
            {c.label} <strong style={{ color: 'var(--ink)' }}>{rev[c.key]}.0</strong>
          </span>
        ))}
      </div>

      {/* Flag info */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
        background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
        borderRadius: 9, marginBottom: 16,
      }}>
        <span style={{ color: 'var(--danger)', marginTop: 1 }}><Icon name="flag" size={14} /></span>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13 }}>
          <div style={{ color: 'var(--ink)', fontWeight: 600 }}>Flagged by {rev.flagger?.name || 'an owner'}</div>
          <div style={{ color: 'var(--danger)', marginTop: 2 }}>Reason: {rev.flag_reason || '—'}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="danger" icon="x" onClick={() => act('removed')} disabled={busy}>Remove review</Button>
        <Button icon="check" onClick={() => act('dismissed')} disabled={busy}>Dismiss flag</Button>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/reviews/flagged')
      .then(res => { setFlagged(res.data.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
        else { setError('Failed to load the moderation queue.'); setLoading(false); }
      });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleResolved = (reviewId) => {
    setFlagged(list => list.filter(r => r.review_id !== reviewId));
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(18px,4vw,40px) clamp(60px,8vw,90px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 'clamp(24px,3vw,34px)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Admin · Moderation</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(30px,4vw,44px)', letterSpacing: '-.02em', color: 'var(--ink)', margin: 0 }}>
            Flag queue
          </h1>
        </div>
        <Button variant="ghost" icon="logout" onClick={handleLogout}>Log out</Button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 24 }}>{error}</div>}

      {loading ? (
        <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
      ) : flagged.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)', marginBottom: 8 }}><Icon name="check" size={24} /></div>
          The queue is clear — no flagged reviews to moderate.
        </div>
      ) : (
        <>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '0 0 18px' }}>
            {flagged.length} flagged {flagged.length === 1 ? 'review' : 'reviews'} awaiting review
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {flagged.map(rev => <FlaggedCard key={rev.review_id} rev={rev} onResolved={handleResolved} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
