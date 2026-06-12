// src/pages/RestaurantDetail.js
// Stripped to REAL API: restaurant + flat menu (menuItems) + real reviews.
// Review submission requires login (useAuth). Author = logged-in user.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Icon, Stars, Button, CategoryBar, Avatar, relativeDate, getCuisineImage, FrostedRating,
} from '../components/ui';
import ReviewModal from './ReviewModal';

const CATEGORIES = [
  { key: 'food_quality',     label: 'Food' },
  { key: 'customer_service', label: 'Service' },
  { key: 'ambiance',         label: 'Ambiance' },
  { key: 'value_for_money',  label: 'Value' },
];

// Average a review's four dimensions into one number
function reviewAvg(rev) {
  return (rev.food_quality + rev.customer_service + rev.ambiance + rev.value_for_money) / 4;
}

function SectionLabel({ children }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontWeight: 500,
      fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.01em',
      color: 'var(--ink)', margin: 0,
    }}>{children}</h2>
  );
}

function ReviewItem({ rev }) {
  const authorName = rev.author?.name || 'Anonymous';
  return (
    <div style={{ padding: '22px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar name={authorName} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{authorName}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>{relativeDate(rev.createdAt)}</div>
        </div>
        <Stars value={reviewAvg(rev)} size={15} />
      </div>
      {rev.comments && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted-fg)', margin: '0 0 14px' }}>{rev.comments}</p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <span key={c.key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)',
            background: 'var(--muted-bg)', padding: '4px 9px', borderRadius: 7, border: '1px solid var(--hairline)',
          }}>
            {c.label} <strong style={{ color: 'var(--ink)' }}>{rev[c.key]}.0</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [banner, setBanner] = useState('');

  const loadData = () => {
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/restaurants/${id}/reviews`),
    ])
      .then(([rRes, revRes]) => {
        setRestaurant(rRes.data.data);
        setReviews(revRes.data.data);
        setLoading(false);
      })
      .catch(() => { setError('Restaurant not found.'); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [id]); // eslint-disable-line

  // Clicking "Write a review" — gate on login
  const handleWriteReview = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setModalOpen(true);
  };

  const handleSubmitReview = async (data) => {
    try {
      await api.post(`/restaurants/${id}/reviews`, data);
      setModalOpen(false);
      setBanner('success');
      loadData();              // refresh to show the new review + updated rating
    } catch (err) {
      setModalOpen(false);
      setBanner('error');
    }
  };

  if (loading) {
    return <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px clamp(18px,4vw,40px)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>;
  }

  if (error || !restaurant) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px clamp(18px,4vw,40px)', fontFamily: 'var(--font-ui)' }}>
        <p style={{ color: 'var(--danger)' }}>{error || 'Restaurant not found.'}</p>
        <button onClick={() => navigate('/')} style={{ color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
          ← Back to restaurants
        </button>
      </div>
    );
  }

  const r = restaurant;
  const overall = Number(r.overall_rating) || 0;
  const reviewCount = reviews.length;
  const menu = r.menuItems || [];

  // Per-category averages for the sidebar
  const categoryAverages = {};
  CATEGORIES.forEach(c => {
    if (reviewCount > 0) {
      categoryAverages[c.key] = reviews.reduce((s, rev) => s + rev[c.key], 0) / reviewCount;
    } else {
      categoryAverages[c.key] = 0;
    }
  });

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(18px,4vw,40px) clamp(60px,8vw,100px)' }}>
      <button onClick={() => navigate('/')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--muted-fg)',
        padding: 'clamp(20px,3vw,30px) 0 clamp(16px,2vw,22px)',
      }}>
        <Icon name="arrowLeft" size={17} /> All restaurants
      </button>

      {/* Hero image */}
      <div style={{ position: 'relative', height: 'clamp(200px, 34vw, 380px)', borderRadius: 'var(--card-radius)', overflow: 'hidden', marginBottom: 'clamp(20px,3vw,32px)' }}>
        <img
          src={getCuisineImage(r.cuisine_type, r.restaurant_id)}
          alt={r.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="eager"
        />
        {/* gradient scrim for bottom legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%)' }} />
        {/* Frosted rating chip */}
        <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
          <FrostedRating overall={overall > 0 ? overall : null} count={reviewCount > 0 ? reviewCount : null} />
        </div>
      </div>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: 'clamp(20px,3vw,28px)' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(10.5px,1vw,12px)',
          letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12,
        }}>
          {r.cuisine_type || 'Restaurant'}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 500,
          fontSize: 'clamp(34px,5vw,56px)', lineHeight: 1.02, letterSpacing: '-.02em',
          color: 'var(--ink)', margin: '0 0 14px',
        }}>{r.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontSize: 14.5, color: 'var(--muted-fg)' }}>
          <Icon name="pin" size={15} /> {r.address}
        </div>
      </div>

      {/* Intro + CTA */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 24, flexWrap: 'wrap', margin: 'clamp(22px,3vw,34px) 0 0',
      }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          {r.description && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'clamp(15px,1.3vw,17px)', lineHeight: 1.6, color: 'var(--ink)', margin: 0, maxWidth: '60ch' }}>
              {r.description}
            </p>
          )}
        </div>
        <Button size="lg" icon="plus" onClick={handleWriteReview} style={{ flexShrink: 0 }}>
          Write a review
        </Button>
      </div>

      {/* Banners */}
      {banner === 'success' && (
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 18px', borderRadius: 13, background: 'var(--success-bg)', border: '1px solid var(--success-border)', fontFamily: 'var(--font-ui)' }}>
          <span style={{ color: 'var(--success)', marginTop: 1 }}><Icon name="check" size={19} /></span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14.5 }}>Thanks — your review is published</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted-fg)', marginTop: 2 }}>It's now visible to other diners.</div>
          </div>
        </div>
      )}
      {banner === 'error' && (
        <div style={{ marginTop: 24, padding: '14px 18px', borderRadius: 13, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
          Something went wrong submitting your review. Please try again.
        </div>
      )}

      {/* Two-column */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'var(--detail-cols, 1fr 320px)',
        gap: 'clamp(28px,4vw,56px)', marginTop: 'clamp(34px,4vw,48px)', alignItems: 'start',
      }}>
        <div>
          {/* Menu (flat list grouped by category) */}
          {menu.length > 0 && (
            <>
              <SectionLabel>The Menu</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18, marginBottom: 'clamp(40px,5vw,60px)' }}>
                {menu.filter(it => it.is_active !== false).map(it => (
                  <div key={it.item_id} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: 'var(--ink)' }}>
                        {it.name}
                        {it.category && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)', marginLeft: 8 }}>· {it.category}</span>}
                      </div>
                      {it.description && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', marginTop: 2, lineHeight: 1.45 }}>{it.description}</div>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)', flexShrink: 0 }}>
                      Rs {Number(it.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Reviews */}
          <div>
            <SectionLabel>
              Reviews {reviewCount > 0 && <span style={{ color: 'var(--muted-fg)', fontWeight: 400 }}>({reviewCount})</span>}
            </SectionLabel>
            {reviewCount === 0 ? (
              <div style={{ marginTop: 18, padding: 'clamp(28px,4vw,44px)', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', textAlign: 'center', background: 'var(--muted-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent)', marginBottom: 10 }}>
                  <Icon name="sparkle" size={26} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink)', marginBottom: 6 }}>No reviews yet</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: '0 0 18px' }}>Be the first to share your experience.</p>
                <Button icon="plus" onClick={handleWriteReview}>Write the first review</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
                {reviews.map(rev => <ReviewItem key={rev.review_id} rev={rev} />)}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'var(--aside-pos, sticky)', top: 84 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--card-radius)', padding: 'clamp(22px,2.4vw,30px)', boxShadow: 'var(--shadow-md)' }}>
            {reviewCount > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 56, lineHeight: 0.9, color: 'var(--ink)' }}>
                    {overall.toFixed(1)}
                  </div>
                  <div style={{ paddingBottom: 6 }}>
                    <Stars value={overall} size={17} />
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>
                      {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--hairline)', margin: '22px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {CATEGORIES.map(c => (
                    <CategoryBar key={c.key} label={c.label} value={categoryAverages[c.key]} />
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', marginBottom: 6 }}>Not yet rated</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: 0, lineHeight: 1.5 }}>No reviews yet. Yours could be the first.</p>
              </div>
            )}
            <Button full icon="plus" onClick={handleWriteReview} style={{ marginTop: 24 }}>
              Write a review
            </Button>
          </div>
        </aside>
      </div>

      {modalOpen && (
        <ReviewModal restaurant={r} onClose={() => setModalOpen(false)} onSubmit={handleSubmitReview} />
      )}
    </div>
  );
};

export default RestaurantDetail;
