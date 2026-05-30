import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Icon, Stars, RatingDisplay, PriceLevel, Chip,
  Button, CategoryBar, Avatar, FrostedRating, relativeDate, avgOf,
} from '../components/ui';
import ReviewModal from './ReviewModal';

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
      fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.01em',
      color: 'var(--ink)', margin: 0,
    }}>{children}</h2>
  );
}

function ReviewItem({ rev }) {
  return (
    <div style={{ padding: '22px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar name={rev.author} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{rev.author}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>{relativeDate(rev.date)}</div>
        </div>
        <Stars value={avgOf(rev.categoryRatings)} size={15} />
      </div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 19, color: 'var(--ink)', margin: '0 0 6px' }}>{rev.title}</h4>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted-fg)', margin: '0 0 14px' }}>{rev.body}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <span key={c.key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)',
            background: 'var(--muted-bg)', padding: '4px 9px', borderRadius: 7, border: '1px solid var(--hairline)',
          }}>
            {c.label} <strong style={{ color: 'var(--ink)' }}>{rev.categoryRatings[c.key]}.0</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/restaurants/${id}`),
      axios.get(`/api/restaurants/${id}/reviews`),
    ])
      .then(([rRes, revRes]) => {
        setRestaurant(rRes.data.data);
        setReviews(revRes.data.data);
        setLoading(false);
      })
      .catch(() => { setError('Restaurant not found.'); setLoading(false); });
  }, [id]);

  const handleSubmitReview = async (data) => {
    try {
      await axios.post(`/api/restaurants/${id}/reviews`, data);
      setModalOpen(false);
      setJustSubmitted(true);
    } catch {
      setModalOpen(false);
      setJustSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px clamp(18px,4vw,40px)', fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>
        Loading…
      </div>
    );
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
  const overallRating = r.overall_rating;
  const reviewCount = r.review_count;
  const categoryRatings = r.category_ratings;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(18px,4vw,40px) clamp(60px,8vw,100px)' }}>
      {/* Back */}
      <button onClick={() => navigate('/')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--muted-fg)',
        padding: 'clamp(20px,3vw,30px) 0 clamp(16px,2vw,22px)',
      }}>
        <Icon name="arrowLeft" size={17} /> All restaurants
      </button>

      {/* Hero — magazine cover */}
      <div style={{
        position: 'relative', borderRadius: 'var(--card-radius)', overflow: 'hidden',
        minHeight: 'clamp(340px, 46vw, 520px)', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <HeroPlaceholder name={r.name} accent={r.accent} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim)' }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: 'clamp(24px,4vw,48px)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 'clamp(10.5px,1vw,12px)',
            letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)',
            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 9,
          }}>
            <span>{r.cuisine}</span><span style={{ opacity: .5 }}>·</span>
            <span>{r.location}</span><span style={{ opacity: .5 }}>·</span>
            <span>{'$'.repeat(r.priceLevel || 2)}</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 'clamp(38px,6vw,68px)', lineHeight: 1, letterSpacing: '-.02em',
            color: '#fff', margin: '0 0 18px', maxWidth: '16ch',
          }}>{r.name}</h1>
          <div><FrostedRating overall={overallRating} count={reviewCount} /></div>
        </div>
      </div>

      {/* Intro strip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 24, flexWrap: 'wrap', margin: 'clamp(22px,3vw,34px) 0 0',
      }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'clamp(15px,1.3vw,17px)', lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 16px', maxWidth: '60ch' }}>
            {r.blurb || r.description}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(r.tags || []).map(t => <Chip key={t}>{t}</Chip>)}
          </div>
        </div>
        <Button size="lg" icon="plus" onClick={() => setModalOpen(true)} style={{ flexShrink: 0 }}>
          Write a review
        </Button>
      </div>

      {/* Submitted confirmation */}
      {justSubmitted && (
        <div style={{
          marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '16px 18px', borderRadius: 13,
          background: 'var(--success-bg)', border: '1px solid var(--success-border)', fontFamily: 'var(--font-ui)',
        }}>
          <span style={{ color: 'var(--success)', marginTop: 1 }}><Icon name="check" size={19} /></span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14.5 }}>Thanks — your review was submitted</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted-fg)', marginTop: 2 }}>
              It's pending owner approval and will appear once published.
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'var(--detail-cols)',
        gap: 'clamp(28px,4vw,56px)', marginTop: 'clamp(34px,4vw,48px)', alignItems: 'start',
      }}>

        {/* Left: menu + reviews */}
        <div>
          {/* Menu */}
          {r.menu && r.menu.length > 0 && (
            <>
              <SectionLabel>The Menu</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30, marginTop: 18 }}>
                {r.menu.map(sec => (
                  <div key={sec.section}>
                    <h3 style={{
                      fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 700,
                      letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 14px',
                    }}>{sec.section}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {sec.items.map(it => (
                        <div key={it.name} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: 'var(--ink)' }}>{it.name}</div>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', marginTop: 2, lineHeight: 1.45 }}>{it.desc}</div>
                          </div>
                          <div style={{ flexShrink: 0, borderBottom: '1px dotted var(--hairline-strong)', flex: '0 1 40px', alignSelf: 'flex-end', marginBottom: 4 }} />
                          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)', flexShrink: 0 }}>
                            Rs {it.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Reviews */}
          <div style={{ marginTop: r.menu && r.menu.length > 0 ? 'clamp(40px,5vw,60px)' : 0 }}>
            <SectionLabel>
              Reviews {reviews.length > 0 && <span style={{ color: 'var(--muted-fg)', fontWeight: 400 }}>({reviews.length})</span>}
            </SectionLabel>
            {reviews.length === 0 ? (
              <div style={{
                marginTop: 18, padding: 'clamp(28px,4vw,44px)', borderRadius: 'var(--card-radius)',
                border: '1px dashed var(--hairline-strong)', textAlign: 'center', background: 'var(--muted-bg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent)', marginBottom: 10 }}>
                  <Icon name="sparkle" size={26} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink)', marginBottom: 6 }}>No reviews yet</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: '0 0 18px' }}>
                  Be the first to share your experience.
                </p>
                <Button icon="plus" onClick={() => setModalOpen(true)}>Write the first review</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
                {reviews.map(rev => <ReviewItem key={rev.id} rev={rev} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right: rating summary sidebar */}
        <aside style={{ position: 'var(--aside-pos)', top: 84 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--hairline)',
            borderRadius: 'var(--card-radius)', padding: 'clamp(22px,2.4vw,30px)',
            boxShadow: 'var(--shadow-md)',
          }}>
            {reviewCount > 0 && overallRating != null ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 56, lineHeight: 0.9, color: 'var(--ink)' }}>
                    {overallRating.toFixed(1)}
                  </div>
                  <div style={{ paddingBottom: 6 }}>
                    <Stars value={overallRating} size={17} />
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>
                      {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--hairline)', margin: '22px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {CATEGORIES.map(c => (
                    <CategoryBar key={c.key} label={c.label} value={categoryRatings?.[c.key] || 0} />
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', marginBottom: 6 }}>Not yet rated</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: 0, lineHeight: 1.5 }}>
                  No approved reviews yet. Your rating could be the first.
                </p>
              </div>
            )}
            <Button full icon="plus" onClick={() => setModalOpen(true)} style={{ marginTop: 24 }}>
              Write a review
            </Button>
          </div>
        </aside>
      </div>

      {modalOpen && (
        <ReviewModal
          restaurant={r}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

function HeroPlaceholder({ name, accent }) {
  const rgba = (hex, alpha) => {
    if (!hex || hex.startsWith('var')) return `rgba(190,18,60,${alpha})`;
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  };
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 'clamp(340px, 46vw, 520px)',
      background: `repeating-linear-gradient(135deg, ${rgba(accent, .12)} 0 10px, ${rgba(accent, .05)} 10px 20px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase',
        color: rgba(accent, .9), background: 'rgba(250,247,245,.85)', padding: '6px 12px', borderRadius: 7,
        border: `1px solid ${rgba(accent, .25)}`,
      }}>{name} · hero photo</span>
    </div>
  );
}

export default RestaurantDetail;
