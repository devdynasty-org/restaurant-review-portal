// src/pages/owner/OwnerDashboard.js
// Rebuilt for the real model: owners create restaurants, add menu items,
// and flag reviews. NO approve/reject (that is the admin's job now).

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, Stars, Button, Field, FieldError, inputStyle, relativeDate } from '../../components/ui';

const CATEGORIES = [
  { key: 'food_quality',     label: 'Food' },
  { key: 'customer_service', label: 'Service' },
  { key: 'ambiance',         label: 'Ambiance' },
  { key: 'value_for_money',  label: 'Value' },
];

function reviewAvg(rev) {
  return (rev.food_quality + rev.customer_service + rev.ambiance + rev.value_for_money) / 4;
}

const FLAG_REASONS = [
  'Hate speech / discrimination',
  'Foul or abusive language',
  'Spam or advertising',
  'Off-topic / irrelevant',
  'False or misleading',
];

// ── Add Restaurant form ──────────────────────────────────────────────────────
function AddRestaurant({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--card-radius)', padding: 'clamp(18px,2.4vw,24px)', boxShadow: 'var(--shadow-sm)' }}>
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

// ── Add Menu Item form (inline per restaurant) ───────────────────────────────
function AddMenuItem({ restaurantId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    return <button onClick={() => setOpen(true)} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}>+ Add menu item</button>;
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

// ── Review row with flag action ──────────────────────────────────────────────
function ReviewRow({ rev, onFlagged }) {
  const [flagging, setFlagging] = useState(false);
  const [reason, setReason] = useState(FLAG_REASONS[0]);
  const [busy, setBusy] = useState(false);

  const doFlag = async () => {
    setBusy(true);
    try {
      await api.put(`/owner/reviews/${rev.review_id}/flag`, { flag_reason: reason });
      onFlagged();
    } catch (err) {
      // keep it simple — surface via alert-free state
      setBusy(false);
    }
  };

  const isFlagged = rev.status === 'flagged';

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>
          {rev.author?.name || 'Anonymous'}
        </span>
        <Stars value={reviewAvg(rev)} size={13} />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)' }}>{relativeDate(rev.createdAt)}</span>
        {isFlagged && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '2px 8px', borderRadius: 999 }}>
            Flagged
          </span>
        )}
      </div>
      {rev.comments && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '0 0 8px', lineHeight: 1.5 }}>{rev.comments}</p>}

      {!isFlagged && (
        flagging ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={reason} onChange={e => setReason(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '8px 10px' }}>
              {FLAG_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button size="sm" variant="danger" onClick={doFlag} disabled={busy}>{busy ? 'Flagging…' : 'Submit flag'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setFlagging(false)}>Cancel</Button>
          </div>
        ) : (
          <button onClick={() => setFlagging(true)} style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="flag" size={13} /> Flag as inappropriate
          </button>
        )
      )}
    </div>
  );
}

// ── Restaurant card with menu + reviews ──────────────────────────────────────
function RestaurantBlock({ r, onChange }) {
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const loadReviews = () => {
    api.get(`/restaurants/${r.restaurant_id}/reviews`)
      .then(res => setReviews(res.data.data))
      .catch(() => setReviews([]));
  };

  useEffect(() => { if (showReviews) loadReviews(); }, [showReviews]); // eslint-disable-line

  const menu = r.menuItems || [];

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--card-radius)', padding: 'clamp(18px,2.4vw,24px)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, color: 'var(--ink)', margin: 0 }}>{r.name}</h3>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>
            {r.cuisine_type || 'Restaurant'} · {r.address}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--ink)' }}>
            {Number(r.overall_rating).toFixed(1)}
          </div>
          <Stars value={Number(r.overall_rating)} size={13} />
        </div>
      </div>

      {/* Menu */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-fg)', marginBottom: 10 }}>Menu</div>
        {menu.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginBottom: 8 }}>No menu items yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {menu.map(it => (
              <div key={it.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                <span style={{ color: 'var(--ink)' }}>{it.name}{it.category && <span style={{ color: 'var(--muted-fg)', fontSize: 12 }}> · {it.category}</span>}</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Rs {Number(it.price).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        <AddMenuItem restaurantId={r.restaurant_id} onAdded={onChange} />
      </div>

      {/* Reviews toggle */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
        <button onClick={() => setShowReviews(s => !s)} style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {showReviews ? 'Hide reviews' : 'View & moderate reviews'}
        </button>
        {showReviews && (
          <div style={{ marginTop: 10 }}>
            {reviews.length === 0 ? (
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>No reviews yet.</div>
            ) : (
              reviews.map(rev => <ReviewRow key={rev.review_id} rev={rev} onFlagged={loadReviews} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRestaurants = () => {
    api.get('/owner/restaurants')
      .then(res => { setRestaurants(res.data.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/owner/login');
        else { setError('Failed to load your restaurants.'); setLoading(false); }
      });
  };

  useEffect(() => { loadRestaurants(); }, []); // eslint-disable-line

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(18px,4vw,40px) clamp(60px,8vw,90px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 'clamp(24px,3vw,34px)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Owner Dashboard</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(30px,4vw,44px)', letterSpacing: '-.02em', color: 'var(--ink)', margin: 0 }}>
            Hello, {user?.name?.split(' ')[0] || 'Owner'}
          </h1>
        </div>
        <Button variant="ghost" icon="logout" onClick={handleLogout}>Log out</Button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 24 }}>{error}</div>}

      <div style={{ marginBottom: 28 }}>
        <AddRestaurant onCreated={loadRestaurants} />
      </div>

      {loading ? (
        <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
      ) : restaurants.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>
          You haven't added any restaurants yet. Use “Add a restaurant” to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2vw,20px)' }}>
          {restaurants.map(r => <RestaurantBlock key={r.restaurant_id} r={r} onChange={loadRestaurants} />)}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
