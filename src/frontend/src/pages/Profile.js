// src/pages/Profile.js
// Account overview + the logged-in customer's review history.

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Button, Icon, Stars, relativeDate, getCuisineImage } from '../components/ui';

const INFO_ROWS = [
  { label: 'Full name',     key: 'name',  icon: 'user' },
  { label: 'Email address', key: 'email', icon: 'lock' },
];

const ROLE_LABELS = { customer: 'Customer', owner: 'Restaurant Owner', admin: 'Administrator' };
const ROLE_ICONS  = { customer: 'user', owner: 'store', admin: 'shield' };

const CATEGORIES = [
  { key: 'food_quality',     label: 'Food' },
  { key: 'customer_service', label: 'Service' },
  { key: 'ambiance',         label: 'Ambiance' },
  { key: 'value_for_money',  label: 'Value' },
];

function reviewAvg(rev) {
  return (rev.food_quality + rev.customer_service + rev.ambiance + rev.value_for_money) / 4;
}

// ── Single review card in the profile list ────────────────────────────────────
function ProfileReviewCard({ rev, onRestaurantClick }) {
  const avg = reviewAvg(rev);
  const rName = rev.restaurant?.name || 'Unknown restaurant';
  const cuisine = rev.restaurant?.cuisine_type || '';
  const rid = rev.restaurant?.restaurant_id;
  const imgSrc = getCuisineImage(cuisine, rid);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 'var(--card-radius)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Restaurant thumbnail strip */}
      <div
        onClick={() => rid && onRestaurantClick(rid)}
        style={{
          position: 'relative', height: 80, cursor: rid ? 'pointer' : 'default',
          overflow: 'hidden',
        }}
      >
        <img
          src={imgSrc}
          alt={rName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)' }} />
        <div style={{
          position: 'absolute', bottom: 10, left: 14,
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16,
          color: '#fff', letterSpacing: '-.01em',
        }}>
          {rName}
          {cuisine && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginLeft: 8, opacity: .8 }}>
              {cuisine}
            </span>
          )}
        </div>
      </div>

      {/* Review body */}
      <div style={{ padding: '14px 16px' }}>
        {/* Stars + date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Stars value={avg} size={14} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)' }}>
            {relativeDate(rev.createdAt)}
          </span>
        </div>

        {/* Comment */}
        {rev.comments && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 13.5, lineHeight: 1.55,
            color: 'var(--ink)', margin: '0 0 12px',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            "{rev.comments}"
          </p>
        )}

        {/* Category badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <span key={c.key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--muted-fg)',
              background: 'var(--muted-bg)', padding: '3px 8px', borderRadius: 6,
              border: '1px solid var(--hairline)',
            }}>
              {c.label} <strong style={{ color: 'var(--ink)' }}>{rev[c.key]}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Profile page ─────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [reviews, setReviews]   = useState([]);
  const [revLoading, setRevLoading] = useState(true);

  // CR-001 (SCRUM-284): account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    api.get('/auth/me/reviews')
      .then(res => { setReviews(res.data.data || []); })
      .catch(() => { setReviews([]); })
      .finally(() => setRevLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const initials  = user.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const roleIcon  = ROLE_ICONS[user.role]  || 'user';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // CR-001 (SCRUM-284): soft-delete (anonymise) the account, then sign out
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/auth/me');
      // Account anonymised + cookie cleared server-side; clear client state
      await logout();
      navigate('/');
    } catch (err) {
      // 409 = owner still owns restaurants; show the server's message
      const msg = err.response?.data?.message || 'Could not delete your account. Please try again.';
      setDeleteError(msg);
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: 'clamp(40px,6vw,70px) clamp(18px,4vw,40px) 80px' }}>

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

      {/* ── My Reviews ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 'clamp(22px,3vw,28px)', letterSpacing: '-.01em',
            color: 'var(--ink)', margin: 0,
          }}>
            My Reviews
          </h2>
          {!revLoading && reviews.length > 0 && (
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', fontWeight: 400 }}>
              ({reviews.length})
            </span>
          )}
        </div>

        {revLoading && (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', padding: '20px 0' }}>
            Loading reviews…
          </div>
        )}

        {!revLoading && reviews.length === 0 && (
          <div style={{
            padding: 'clamp(28px,4vw,40px)', borderRadius: 'var(--card-radius)',
            border: '1px dashed var(--hairline-strong)', textAlign: 'center',
            background: 'var(--muted-bg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent)', marginBottom: 10 }}>
              <Icon name="sparkle" size={24} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 6 }}>
              No reviews yet
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '0 0 16px' }}>
              Visit a restaurant page and share your experience.
            </p>
            <Button icon="arrowLeft" onClick={() => navigate('/')}>Browse restaurants</Button>
          </div>
        )}

        {!revLoading && reviews.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map(rev => (
              <ProfileReviewCard
                key={rev.review_id}
                rev={rev}
                onRestaurantClick={rid => navigate(`/restaurants/${rid}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div style={{
        marginTop: 48, padding: '20px 24px',
        borderRadius: 'var(--card-radius)',
        border: '1px solid var(--danger-border)', background: 'var(--danger-bg)',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 8 }}>
          Danger zone
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '0 0 14px', lineHeight: 1.5 }}>
          Permanently removes your personal data and signs you out. Your reviews remain but are shown anonymously. This cannot be undone.
        </p>
        <Button variant="danger" size="sm" icon="trash" onClick={() => setShowDeleteModal(true)}>Delete my account</Button>
      </div>

      {/* CR-001 (SCRUM-284): delete-account confirmation modal */}
      {showDeleteModal && (
        <div
          onClick={() => !deleting && setShowDeleteModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 'var(--card-radius)',
              border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(0,0,0,.25))',
              maxWidth: 440, width: '100%', padding: '26px 28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: 'var(--danger)', display: 'flex' }}>
                <Icon name="trash" size={20} />
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, color: 'var(--ink)', margin: 0 }}>
                Delete your account?
              </h3>
            </div>

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.55, color: 'var(--muted-fg)', margin: '0 0 18px' }}>
              This permanently removes your personal data and signs you out. Your reviews will remain but will be shown as “Deleted user”. This action cannot be undone.
            </p>

            {deleteError && (
              <div style={{
                fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--danger)',
                background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                borderRadius: 8, padding: '10px 12px', marginBottom: 16,
              }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;