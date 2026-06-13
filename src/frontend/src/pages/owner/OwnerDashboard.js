// src/pages/owner/OwnerDashboard.js
// Owner portal with dark sidebar shell.
// Sidebar nav: Dashboard · My Restaurants · Reviews · Settings
// No approve/reject (admin's job). Owners can add restaurants, menu items and flag reviews.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Icon, Stars, Avatar, Button, Field, FieldError, inputStyle,
  ImagePlaceholder, getCuisineImage, relativeDate,
} from '../../components/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────
function reviewAvg(rev) {
  return (rev.food_quality + rev.customer_service + rev.ambiance + rev.value_for_money) / 4;
}

const OWNER_NAV = [
  { label: 'Dashboard',      icon: 'grid'    },
  { label: 'My Restaurants', icon: 'store'   },
  { label: 'Reviews',        icon: 'comment' },
  { label: 'Settings',       icon: 'settings'},
];

const FLAG_REASONS = [
  'Hate speech / discrimination',
  'Foul or abusive language',
  'Spam or advertising',
  'Off-topic / irrelevant',
  'False or misleading',
];

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function SidebarItem({ item, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 9,
        border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
        background: active ? 'rgba(255,255,255,.12)' : hover ? 'rgba(255,255,255,.06)' : 'transparent',
        color: active ? '#fff' : hover ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.5)',
        transition: 'background .14s ease, color .14s ease',
      }}
    >
      <Icon name={item.icon} size={16} />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: active ? 700 : 500, flex: 1 }}>
        {item.label}
      </span>
      {item.badge != null && (
        <span style={{
          background: 'var(--accent)', color: '#fff',
          fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
          padding: '2px 7px', borderRadius: 999, flexShrink: 0,
        }}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, accent }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 'var(--card-radius)', padding: '18px 22px', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 38, lineHeight: 1,
          color: accent ? 'var(--accent)' : 'var(--ink)',
        }}>
          {value}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: accent ? 'var(--danger-bg)' : 'var(--muted-bg)',
          color: accent ? 'var(--accent)' : 'var(--muted-fg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={17} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>{label}</div>
    </div>
  );
}

// ── Add Restaurant form ──────────────────────────────────────────────────────
function AddRestaurant({ onCreated }) {
  const [open, setOpen]             = useState(false);
  const [name, setName]             = useState('');
  const [address, setAddress]       = useState('');
  const [cuisine, setCuisine]       = useState('');
  const [description, setDescription] = useState('');
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);

  const submit = async () => {
    setError('');
    if (!name.trim() || !address.trim()) { setError('Name and address are required.'); return; }
    setSaving(true);
    try {
      await api.post('/owner/restaurants', {
        name: name.trim(), address: address.trim(),
        cuisine_type: cuisine.trim() || null, description: description.trim() || null,
      });
      setName(''); setAddress(''); setCuisine(''); setDescription('');
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return <Button icon="plus" onClick={() => setOpen(true)}>Add a restaurant</Button>;
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--card-radius)', padding: 'clamp(18px,2.4vw,24px)', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, color: 'var(--ink)', margin: '0 0 16px' }}>New restaurant</h3>
      {error && <FieldError>{error}</FieldError>}
      <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="The Spice Garden" /></Field>
      <Field label="Address"><input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="12 Galle Road, Colombo" /></Field>
      <Field label="Cuisine type"><input value={cuisine} onChange={e => setCuisine(e.target.value)} style={inputStyle} placeholder="Sri Lankan" /></Field>
      <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A short description…" /></Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Create restaurant'}</Button>
      </div>
    </div>
  );
}

// ── Add Menu Item form ───────────────────────────────────────────────────────
function AddMenuItem({ restaurantId, onAdded }) {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState('');
  const [price, setPrice]     = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    setError('');
    if (!name.trim() || price === '') { setError('Name and price are required.'); return; }
    setSaving(true);
    try {
      await api.post(`/owner/restaurants/${restaurantId}/menu`, {
        name: name.trim(), price: parseFloat(price), category: category.trim() || null,
      });
      setName(''); setPrice(''); setCategory(''); setOpen(false);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
        color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
      }}>
        + Add menu item
      </button>
    );
  }

  return (
    <div style={{ background: 'var(--muted-bg)', borderRadius: 10, padding: 14, marginTop: 8 }}>
      {error && <FieldError>{error}</FieldError>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 140px' }}>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Dish name" />
        </div>
        <div style={{ flex: '1 1 80px' }}>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" style={inputStyle} placeholder="Price" />
        </div>
        <div style={{ flex: '1 1 100px' }}>
          <input value={category} onChange={e => setCategory(e.target.value)} style={inputStyle} placeholder="Category" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Adding…' : 'Add'}</Button>
      </div>
    </div>
  );
}

// ── Review row with flag action ───────────────────────────────────────────────
function ReviewRow({ rev, restaurantName, onFlagged }) {
  const [flagging, setFlagging] = useState(false);
  const [reason, setReason]     = useState(FLAG_REASONS[0]);
  const [busy, setBusy]         = useState(false);

  const doFlag = async () => {
    setBusy(true);
    try {
      await api.put(`/owner/reviews/${rev.review_id}/flag`, { flag_reason: reason });
      onFlagged();
    } catch {
      setBusy(false);
    }
  };

  const isFlagged  = rev.status === 'flagged';
  const authorName = rev.author?.name || 'Anonymous';

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 'var(--card-radius)', padding: 'clamp(14px,2vw,20px)',
      boxShadow: 'var(--shadow-sm)',
      borderLeft: `3px solid ${isFlagged ? 'var(--danger)' : 'var(--accent)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <Avatar name={authorName} size={34} />
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{authorName}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>
            {restaurantName && <>on <strong style={{ color: 'var(--ink)' }}>{restaurantName}</strong> · </>}
            {relativeDate(rev.createdAt)}
          </div>
        </div>
        {isFlagged && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '3px 9px', borderRadius: 999 }}>
            Flagged
          </span>
        )}
        <Stars value={reviewAvg(rev)} size={13} />
      </div>

      {rev.comments && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '0 0 10px', lineHeight: 1.55 }}>
          {rev.comments}
        </p>
      )}

      {!isFlagged && (
        flagging ? (
          <div style={{ padding: 14, borderRadius: 11, background: 'var(--bg)', border: '1px solid var(--danger-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="flag" size={14} style={{ color: 'var(--danger)' }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Flag for a moderator</span>
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', marginBottom: 8 }}>
              Why are you flagging it?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
              {FLAG_REASONS.map(r => (
                <button key={r} type="button" onClick={() => setReason(r)} style={{
                  padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                  border: `1.5px solid ${reason === r ? 'var(--accent)' : 'var(--hairline-strong)'}`,
                  background: reason === r ? 'var(--danger-bg)' : 'var(--surface)',
                  fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600,
                  color: reason === r ? 'var(--accent)' : 'var(--muted-fg)',
                }}>{r}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="danger" icon="flag" onClick={doFlag} disabled={busy}>
                {busy ? 'Flagging…' : 'Submit flag'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFlagging(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setFlagging(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600,
            color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <Icon name="flag" size={13} /> Flag as inappropriate
          </button>
        )
      )}
    </div>
  );
}

// ── Restaurant block ──────────────────────────────────────────────────────────
function RestaurantBlock({ r, onChange, hideReviews = false }) {
  const [reviews, setReviews]       = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const loadReviews = () => {
    api.get(`/restaurants/${r.restaurant_id}/reviews`)
      .then(res => setReviews(res.data.data))
      .catch(() => setReviews([]));
  };

  useEffect(() => { if (showReviews) loadReviews(); }, [showReviews]); // eslint-disable-line

  const menu     = r.menuItems || [];
  const hasRating = r.overall_rating != null && !isNaN(Number(r.overall_rating)) && Number(r.overall_rating) > 0;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--card-radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {/* Image header */}
      <div style={{ height: 100, position: 'relative' }}>
        <ImagePlaceholder label={r.cuisine_type || ''} src={getCuisineImage(r.cuisine_type, r.restaurant_id)} style={{ height: '100%', border: 'none', borderRadius: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px 12px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, color: '#fff', lineHeight: 1.1 }}>{r.name}</span>
          {hasRating && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13.5, color: '#fff' }}>
              <Stars value={Number(r.overall_rating)} size={13} />
              {Number(r.overall_rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: 'clamp(14px,2vw,20px)' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginBottom: 12 }}>
          {r.cuisine_type || 'Restaurant'} · {r.address}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--hairline)', flexWrap: 'wrap' }}>
          <Button size="sm" variant="ghost" icon="edit">Edit</Button>
          <Button size="sm" variant="quiet" icon="trash">Delete</Button>
          <button type="button" style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <Icon name="eye" size={14} /> View listing
          </button>
        </div>

        {/* Menu */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-fg)', marginBottom: 8 }}>Menu</div>
          {menu.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginBottom: 8 }}>No menu items yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 8 }}>
              {menu.map(it => (
                <div key={it.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                  <span style={{ color: 'var(--ink)' }}>
                    {it.name}
                    {it.category && <span style={{ color: 'var(--muted-fg)', fontSize: 12 }}> · {it.category}</span>}
                  </span>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Rs {Number(it.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <AddMenuItem restaurantId={r.restaurant_id} onAdded={onChange} />
        </div>

        {/* Reviews toggle — only in sections that request it */}
        {!hideReviews && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--hairline)' }}>
            <button type="button" onClick={() => setShowReviews(s => !s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600,
              color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              <Icon name="comment" size={15} />
              {showReviews ? 'Hide reviews' : 'View & moderate reviews'}
            </button>
            {showReviews && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {reviews.length === 0 ? (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>No reviews yet.</div>
                ) : (
                  reviews.map(rev => (
                    <ReviewRow key={rev.review_id} rev={rev} restaurantName={r.name} onFlagged={loadReviews} />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── All reviews (flat list across every restaurant) ──────────────────────────
function AllReviewsSection({ restaurants }) {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reloadKey, setReloadKey]   = useState(0);

  useEffect(() => {
    if (restaurants.length === 0) { setAllReviews([]); setLoading(false); return; }
    setLoading(true);
    Promise.all(
      restaurants.map(r =>
        api.get(`/restaurants/${r.restaurant_id}/reviews`)
          .then(res => (res.data.data || []).map(rev => ({ ...rev, _restaurantName: r.name })))
          .catch(() => [])
      )
    ).then(arrays => {
      setAllReviews(arrays.flat());
      setLoading(false);
    });
  }, [restaurants, reloadKey]); // eslint-disable-line

  if (loading) {
    return <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading reviews…</div>;
  }

  if (allReviews.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--muted-fg)' }}>
          <Icon name="comment" size={28} />
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 5 }}>No reviews yet</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)' }}>
          Once customers review your restaurants, they'll appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {allReviews.map(rev => (
        <ReviewRow
          key={rev.review_id}
          rev={rev}
          restaurantName={rev._restaurantName}
          onFlagged={() => setReloadKey(k => k + 1)}
        />
      ))}
    </div>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────
function ComingSoon({ section, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 80, textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-fg)' }}>
        <Icon name={icon} size={28} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, color: 'var(--ink)' }}>{section}</div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, color: 'var(--muted-fg)', maxWidth: '34ch', lineHeight: 1.55, margin: 0 }}>
        This section is coming soon.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [activeSection, setActiveSection] = useState('Dashboard');

  const loadRestaurants = () => {
    api.get('/owner/restaurants')
      .then(res => { setRestaurants(res.data.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/owner/login');
        else { setError('Failed to load your restaurants.'); setLoading(false); }
      });
  };

  const avgRating = (() => {
    const rated = restaurants.filter(r => r.overall_rating != null && !isNaN(Number(r.overall_rating)) && Number(r.overall_rating) > 0);
    if (!rated.length) return null;
    return (rated.reduce((s, r) => s + Number(r.overall_rating), 0) / rated.length).toFixed(1);
  })();

  useEffect(() => { loadRestaurants(); }, []); // eslint-disable-line

  const handleLogout = async () => { await logout(); navigate('/'); };

  const userInitials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'O';

  // ── Section content ────────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeSection === 'Dashboard') {
      return (
        <>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 30, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-.02em' }}>
              Hello, {user?.name?.split(' ')[0] || 'Owner'}
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: 0, lineHeight: 1.5 }}>
              Manage your restaurants, menus and reviews from here.
            </p>
          </div>

          {/* Stats */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard value={String(restaurants.length)} label="Your restaurants" icon="store" />
              <StatCard value={avgRating ?? '—'} label="Average rating" icon="star" />
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 20 }}>{error}</div>
          )}

          {/* Add restaurant + approval note */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
            <AddRestaurant onCreated={loadRestaurants} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 14px', borderRadius: 11, background: 'var(--muted-bg)', border: '1px solid var(--hairline)', maxWidth: 400 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}><Icon name="shield" size={14} /></span>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted-fg)', margin: 0 }}>
                Changes go live once a moderator <strong style={{ color: 'var(--ink)' }}>approves them</strong>.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
          ) : restaurants.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>
              You haven't added any restaurants yet. Use "Add a restaurant" to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.6vw,18px)' }}>
              {restaurants.map(r => <RestaurantBlock key={r.restaurant_id} r={r} onChange={loadRestaurants} hideReviews />)}
            </div>
          )}
        </>
      );
    }

    if (activeSection === 'My Restaurants') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-.02em' }}>
              My Restaurants
            </h2>
            <AddRestaurant onCreated={loadRestaurants} />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 20 }}>{error}</div>
          )}

          {loading ? (
            <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
          ) : restaurants.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>
              No restaurants yet. Click "Add a restaurant" to create your first listing.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {restaurants.map(r => <RestaurantBlock key={r.restaurant_id} r={r} onChange={loadRestaurants} hideReviews />)}
            </div>
          )}
        </>
      );
    }

    if (activeSection === 'Reviews') {
      return (
        <>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-.02em' }}>Reviews</h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: 0, lineHeight: 1.5 }}>
              All customer reviews across your restaurants. Flag any inappropriate content for the moderation team.
            </p>
          </div>
          {loading ? (
            <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
          ) : restaurants.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>
              No restaurants yet — add one first to see its reviews.
            </div>
          ) : (
            <AllReviewsSection restaurants={restaurants} />
          )}
        </>
      );
    }

    const navItem = OWNER_NAV.find(n => n.label === activeSection);
    return <ComingSoon section={activeSection} icon={navItem?.icon || 'settings'} />;
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Dark sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: 248, flexShrink: 0, background: 'var(--ink)',
        display: 'flex', flexDirection: 'column',
        padding: '26px 18px', overflowY: 'auto',
      }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, color: '#fff', letterSpacing: '-.01em' }}>
            Tabletalk
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: 1 }} />
        </div>

        {/* Role pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,.1)', marginBottom: 28, alignSelf: 'flex-start' }}>
          <Icon name="store" size={11} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.75)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
            Owner
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OWNER_NAV.map(item => (
            <SidebarItem
              key={item.label}
              item={item}
              active={activeSection === item.label}
              onClick={() => setActiveSection(item.label)}
            />
          ))}
        </nav>

        {/* User footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              {userInitials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Owner'}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'rgba(255,255,255,.45)' }}>Restaurant Owner</div>
            </div>
          </div>
          {/* CR-001 (SCRUM-284): owner access to account page (incl. delete) */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 9,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
            }}
          >
            <Icon name="user" size={15} /> Account
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 9,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
            }}
          >
            <Icon name="logout" size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 64px header */}
        <div style={{
          height: 64, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 30px',
          borderBottom: '1px solid var(--hairline)', background: 'var(--surface)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5 }}>
            <span style={{ color: 'var(--muted-fg)', fontWeight: 500 }}>Owner</span>
            <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{activeSection}</span>
          </div>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-fg)', padding: 7, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <Icon name="bell" size={19} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px 30px 60px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
