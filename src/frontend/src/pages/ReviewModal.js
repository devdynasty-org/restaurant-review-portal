// src/pages/ReviewModal.js
// Stripped to REAL API shape. Submits the four rating dimensions + comment.
// Author is the logged-in user (no name field). No title field (not in schema).

import React, { useState, useEffect } from 'react';
import { Icon, Button, Field, FieldError, inputStyle } from '../components/ui';

const CATEGORIES = [
  { key: 'food_quality',     label: 'Food' },
  { key: 'customer_service', label: 'Service' },
  { key: 'ambiance',         label: 'Ambiance' },
  { key: 'value_for_money',  label: 'Value' },
];

function ReviewModal({ restaurant, onClose, onSubmit }) {
  const [ratings, setRatings] = useState({
    food_quality: 0, customer_service: 0, ambiance: 0, value_for_money: 0,
  });
  const [hovered, setHovered] = useState({});
  const [comments, setComments] = useState('');
  const [touched, setTouched] = useState(false);

  const allRated = Object.values(ratings).every(v => v > 0);
  const valid = allRated && comments.trim().length >= 10;

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    // Real API shape: four dimensions + comments. No author, no title.
    onSubmit({
      food_quality: ratings.food_quality,
      customer_service: ratings.customer_service,
      ambiance: ratings.ambiance,
      value_for_money: ratings.value_for_money,
      comments: comments.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(28,25,23,.5)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 'clamp(0px,3vw,40px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 'clamp(16px,2vw,20px) clamp(16px,2vw,20px) 0 0',
          width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 -10px 60px rgba(0,0,0,.25)',
        }}
      >
        <div style={{
          position: 'sticky', top: 0, background: 'var(--surface)',
          borderBottom: '1px solid var(--hairline)',
          padding: 'clamp(18px,2.4vw,24px) clamp(20px,3vw,28px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, zIndex: 1,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>
              Write a review
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, color: 'var(--ink)', lineHeight: 1.1 }}>
              {restaurant.name}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: 'var(--muted-bg)', border: '1px solid var(--hairline)', borderRadius: 9,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--muted-fg)', flexShrink: 0,
          }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ padding: 'clamp(20px,3vw,28px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 26 }}>
            {CATEGORIES.map(c => (
              <div key={c.key}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 7 }}>
                  {c.label}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => {
                    const active = n <= (hovered[c.key] || ratings[c.key]);
                    return (
                      <button
                        key={n}
                        onMouseEnter={() => setHovered(h => ({ ...h, [c.key]: n }))}
                        onMouseLeave={() => setHovered(h => ({ ...h, [c.key]: 0 }))}
                        onClick={() => setRatings(r => ({ ...r, [c.key]: n }))}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                          transform: active ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <Icon name="star" size={26}
                          style={{ fill: active ? 'var(--star)' : 'var(--star-empty)', stroke: 'none' }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {touched && !allRated && <FieldError>Please rate all four categories.</FieldError>}

          <Field label="Your review">
            <textarea
              value={comments} onChange={e => setComments(e.target.value)}
              rows={4} placeholder="What did you order? How was the service and the room?"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 96, lineHeight: 1.5 }}
            />
          </Field>
          {touched && comments.trim().length < 10 && <FieldError>Tell us a little more (at least 10 characters).</FieldError>}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)',
            fontSize: 12.5, color: 'var(--muted-fg)', margin: '4px 0 20px',
          }}>
            <Icon name="check" size={14} /> Your review will be published immediately.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose} style={{ flex: '0 0 auto' }}>Cancel</Button>
            <Button full onClick={submit} disabled={touched && !valid}>Submit review</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
