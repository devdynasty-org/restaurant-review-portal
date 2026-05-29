import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon, Stars, RatingDisplay, PriceLevel, Avatar, Button, relativeDate, avgOf } from '../../components/ui';

const CATEGORIES = [
  { key: 'food',     label: 'Food' },
  { key: 'service',  label: 'Service' },
  { key: 'ambiance', label: 'Ambiance' },
  { key: 'value',    label: 'Value' },
];

function SectionLabel({ children }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontWeight: 500,
      fontSize: 'clamp(22px,2.6vw,30px)', letterSpacing: '-.01em',
      color: 'var(--ink)', margin: 0, whiteSpace: 'nowrap',
    }}>{children}</h2>
  );
}

function ModerationCard({ rev, restaurant, onApprove, onReject }) {
  const [done, setDone] = useState(null);

  const act = (kind, fn) => {
    setDone(kind);
    setTimeout(fn, 360);
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 'var(--card-radius)', padding: 'clamp(18px,2.4vw,24px)',
      boxShadow: 'var(--shadow-sm)',
      opacity: done ? 0 : 1,
      transform: done ? 'translateX(12px)' : 'none',
      transition: 'opacity .34s ease, transform .34s ease',
      borderLeft: `3px solid ${done === 'approved' ? 'var(--success)' : done === 'rejected' ? 'var(--danger)' : 'var(--accent)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <Avatar name={rev.author} size={36} />
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{rev.author}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>
            on <strong style={{ color: 'var(--ink)' }}>{restaurant?.name}</strong> · {relativeDate(rev.date)}
          </div>
        </div>
        <Stars value={avgOf(rev.categoryRatings)} size={15} />
      </div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: 'var(--ink)', margin: '0 0 6px' }}>{rev.title}</h4>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.55, color: 'var(--muted-fg)', margin: '0 0 14px' }}>{rev.body}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {CATEGORIES.map(c => (
          <span key={c.key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-ui)',
            fontSize: 12, color: 'var(--muted-fg)', background: 'var(--muted-bg)',
            padding: '4px 9px', borderRadius: 7, border: '1px solid var(--hairline)',
          }}>
            {c.label} <strong style={{ color: 'var(--ink)' }}>{rev.categoryRatings[c.key]}.0</strong>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button icon="check" onClick={() => act('approved', onApprove)}>Approve &amp; publish</Button>
        <Button variant="danger" icon="x" onClick={() => act('rejected', onReject)}>Reject</Button>
      </div>
    </div>
  );
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');

  const fetchData = () => {
    Promise.all([
      axios.get('/api/owner/dashboard', { withCredentials: true }),
      axios.get('/api/owner/reviews/pending', { withCredentials: true }),
    ])
      .then(([rRes, revRes]) => {
        setRestaurants(rRes.data.data);
        setPending(revRes.data.data);
      })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/owner/login');
        } else {
          setError('Failed to load dashboard.');
        }
      });
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const handleLogout = async () => {
    await axios.post('/api/auth/owner/logout', {}, { withCredentials: true });
    navigate('/owner/login');
  };

  const handleApprove = async (reviewId) => {
    await axios.put(`/api/owner/reviews/${reviewId}/approve`, {}, { withCredentials: true });
    setPending(p => p.filter(r => r.id !== reviewId));
    setRestaurants(rs => rs.map(r => ({ ...r, review_count: r.review_count + (pending.find(p => p.id === reviewId)?.restaurantId === r.id ? 1 : 0) })));
  };

  const handleReject = async (reviewId) => {
    await axios.delete(`/api/owner/reviews/${reviewId}`, { withCredentials: true });
    setPending(p => p.filter(r => r.id !== reviewId));
  };

  const totalApproved = restaurants.reduce((s, r) => s + (r.review_count || 0), 0);
  const avgRating = (() => {
    const rated = restaurants.filter(r => r.overall_rating != null);
    if (!rated.length) return null;
    return rated.reduce((s, r) => s + r.overall_rating, 0) / rated.length;
  })();

  const stats = [
    { label: 'Your restaurants', value: restaurants.length },
    { label: 'Pending reviews', value: pending.length, accent: pending.length > 0 },
    { label: 'Published reviews', value: totalApproved },
    { label: 'Average rating', value: avgRating != null ? avgRating.toFixed(1) : '—' },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(18px,4vw,40px) clamp(60px,8vw,90px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 20, flexWrap: 'wrap', marginBottom: 'clamp(24px,3vw,34px)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
            Owner Dashboard
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 'clamp(30px,4vw,44px)', letterSpacing: '-.02em',
            color: 'var(--ink)', margin: 0, whiteSpace: 'nowrap',
          }}>Hello, John</h1>
        </div>
        <Button variant="ghost" icon="logout" onClick={handleLogout} style={{ flexShrink: 0 }}>Log out</Button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'clamp(12px,1.6vw,18px)', marginBottom: 'clamp(34px,4vw,48px)',
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--hairline)',
            borderRadius: 'var(--card-radius)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 40, lineHeight: 1, color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Moderation queue */}
      <div style={{ marginBottom: 'clamp(40px,5vw,56px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <span style={{ flexShrink: 0 }}><SectionLabel>Pending reviews</SectionLabel></span>
          {pending.length > 0 && (
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 700,
              color: 'var(--accent-ink)', background: 'var(--accent)',
              borderRadius: 999, padding: '3px 10px',
            }}>{pending.length} new</span>
          )}
        </div>
        {pending.length === 0 ? (
          <div style={{
            padding: 36, textAlign: 'center', borderRadius: 'var(--card-radius)',
            border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)',
            fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)', marginBottom: 8 }}>
              <Icon name="check" size={24} />
            </div>
            You're all caught up — no reviews waiting for approval.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pending.map(rev => {
              const rest = restaurants.find(r => r.id === rev.restaurantId);
              return (
                <ModerationCard
                  key={rev.id} rev={rev} restaurant={rest}
                  onApprove={() => handleApprove(rev.id)}
                  onReject={() => handleReject(rev.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Listings */}
      <div>
        <SectionLabel>Your restaurants</SectionLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px), 1fr))',
          gap: 'clamp(14px,2vw,20px)', marginTop: 18,
        }}>
          {restaurants.map(r => {
            const pendCount = pending.filter(x => x.restaurantId === r.id).length;
            return (
              <div key={r.id} style={{
                background: 'var(--surface)', border: '1px solid var(--hairline)',
                borderRadius: 'var(--card-radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
              }}>
                <RestaurantThumb accent={r.accent} cuisine={r.cuisine} />
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <h3 style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 21, color: 'var(--ink)', margin: 0, lineHeight: 1.12 }}>{r.name}</h3>
                    {r.priceLevel && <span style={{ flexShrink: 0, paddingTop: 3 }}><PriceLevel level={r.priceLevel} /></span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', margin: '4px 0 14px' }}>
                    {r.cuisine} · {r.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--hairline)' }}>
                    <RatingDisplay overall={r.overall_rating} count={r.review_count} size={15} />
                    {pendCount > 0 && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                        {pendCount} pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function RestaurantThumb({ accent, cuisine }) {
  const rgba = (hex, alpha) => {
    if (!hex || hex.startsWith('var')) return `rgba(190,18,60,${alpha})`;
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  };
  return (
    <div style={{
      width: '100%', height: 110,
      background: `repeating-linear-gradient(135deg, ${rgba(accent, .12)} 0 10px, ${rgba(accent, .05)} 10px 20px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
        color: rgba(accent, .9), background: 'var(--surface)', padding: '3px 8px', borderRadius: 5,
        border: `1px solid ${rgba(accent, .25)}`,
      }}>{cuisine} · photo</span>
    </div>
  );
}

export default OwnerDashboard;
