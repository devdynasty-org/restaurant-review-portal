import React, { useState, useEffect } from 'react';
import { Icon, Button, Field, FieldError, inputStyle } from '../components/ui';

const CATEGORIES = [
  { key: 'food',     label: 'Food' },
  { key: 'service',  label: 'Service' },
  { key: 'ambiance', label: 'Ambiance' },
  { key: 'value',    label: 'Value' },
];

function ReviewModal({ restaurant, onClose, onSubmit }) {
  const [ratings, setRatings] = useState({ food: 0, service: 0, ambiance: 0, value: 0 });
  const [hovered, setHovered] = useState({});
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  const allRated = Object.values(ratings).every(v => v > 0);
  const valid = allRated && title.trim() && body.trim().length >= 10 && name.trim();

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
    onSubmit({
      categoryRatings: ratings,
      title: title.trim(),
      body: body.trim(),
      author: name.trim(),
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
        animation: 'rrpFade .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 'clamp(16px,2vw,20px) clamp(16px,2vw,20px) 0 0',
          width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 -10px 60px rgba(0,0,0,.25)',
          animation: 'rrpSlideUp .26s cubic-bezier(.2,.7,.2,1)',
        }}
      >
        {/* Header */}
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
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'var(--muted-bg)', border: '1px solid var(--hairline)', borderRadius: 9,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--muted-fg)', flexShrink: 0,
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(20px,3vw,28px)' }}>
          {/* Category star pickers */}
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
                          transition: 'transform .1s ease',
                          transform: active ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <Icon
                          name="star" size={26}
                          style={{ fill: active ? 'var(--star)' : 'var(--star-empty)', stroke: 'none' }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {touched && !allRated && <FieldError>Please rate all four categories.</FieldError>}

          <Field label="Headline">
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Sum it up in a line" style={inputStyle} maxLength={70}
            />
          </Field>
          {touched && !title.trim() && <FieldError>A headline is required.</FieldError>}

          <Field label="Your review">
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              rows={4} placeholder="What did you order? How was the service and the room?"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 96, lineHeight: 1.5 }}
            />
          </Field>
          {touched && body.trim().length < 10 && <FieldError>Tell us a little more (at least 10 characters).</FieldError>}

          <Field label="Your name">
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Nethmi P." style={inputStyle} maxLength={40}
            />
          </Field>
          {touched && !name.trim() && <FieldError>Please add your name.</FieldError>}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)',
            fontSize: 12.5, color: 'var(--muted-fg)', margin: '4px 0 20px',
          }}>
            <Icon name="clock" size={14} /> Reviews are published after the owner approves them.
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
