import React, { useState } from 'react';

// ── Icons ────────────────────────────────────────────────────────────────────
export function Icon({ name, size = 20, style }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  const paths = {
    search:    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
    pin:       <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.6" /></>,
    arrowLeft: <path d="M15 5l-7 7 7 7" />,
    check:     <path d="M5 13l4 4L19 7" />,
    x:         <path d="M6 6l12 12M18 6 6 18" />,
    plus:      <path d="M12 5v14M5 12h14" />,
    user:      <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
    lock:      <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    logout:    <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12h10M17 9l3 3-3 3" /></>,
    clock:     <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star:      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9z" />,
    bookmark:  <path d="M6 4h12v16l-6-4-6 4z" />,
    sparkle:   <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

// ── Stars ────────────────────────────────────────────────────────────────────
export function Stars({ value, size = 16, gap = 2 }) {
  const v = value || 0;
  return (
    <span style={{ display: 'inline-flex', gap, lineHeight: 0, verticalAlign: 'middle' }} aria-label={`${v} out of 5`}>
      {[0, 1, 2, 3, 4].map(i => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <span style={{ position: 'absolute', inset: 0 }}>
              <Icon name="star" size={size} style={{ fill: 'var(--star-empty)', stroke: 'none' }} />
            </span>
            <span style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, overflow: 'hidden' }}>
              <Icon name="star" size={size} style={{ fill: 'var(--star)', stroke: 'none' }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

// ── Rating display ────────────────────────────────────────────────────────────
export function RatingDisplay({ overall, count, variant = 'stars', size = 16 }) {
  if (!count || overall == null) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px',
        borderRadius: 999, fontSize: 12.5, fontWeight: 600, letterSpacing: '.01em',
        background: 'var(--muted-bg)', color: 'var(--muted-fg)', whiteSpace: 'nowrap',
        border: '1px solid var(--hairline)', fontFamily: 'var(--font-ui)',
      }}>Not yet rated</span>
    );
  }
  if (variant === 'number') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, fontFamily: 'var(--font-ui)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--accent)', fontSize: size + 2 }}>
          <Icon name="star" size={size} style={{ fill: 'var(--accent)', stroke: 'none' }} />{overall.toFixed(1)}
        </span>
        <span style={{ color: 'var(--muted-fg)', fontSize: 12.5 }}>({count})</span>
      </span>
    );
  }
  if (variant === 'badge') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999,
        background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 13, fontWeight: 700,
        fontFamily: 'var(--font-ui)',
      }}>
        <Icon name="star" size={13} style={{ fill: 'currentColor', stroke: 'none' }} />
        {overall.toFixed(1)}<span style={{ opacity: .75, fontWeight: 600 }}>· {count}</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-ui)' }}>
      <Stars value={overall} size={size} />
      <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13.5 }}>{overall.toFixed(1)}</span>
      <span style={{ color: 'var(--muted-fg)', fontSize: 12.5 }}>({count})</span>
    </span>
  );
}

// ── Frosted rating chip (for use over imagery) ────────────────────────────────
export function FrostedRating({ overall, count }) {
  if (!count || overall == null) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999,
        background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,.28)', color: '#fff', fontFamily: 'var(--font-ui)',
        fontSize: 12, fontWeight: 600, letterSpacing: '.02em', whiteSpace: 'nowrap',
      }}>New</span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999,
      background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,.28)', color: '#fff', fontFamily: 'var(--font-ui)',
      fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap',
    }}>
      <Icon name="star" size={13} style={{ fill: 'var(--star)', stroke: 'none' }} />
      {overall.toFixed(1)}
      <span style={{ opacity: .82, fontWeight: 500, fontSize: 12 }}>· {count}</span>
    </span>
  );
}

// ── Price level ($$) ─────────────────────────────────────────────────────────
export function PriceLevel({ level }) {
  return (
    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'var(--muted-fg)', letterSpacing: '.02em' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} style={{ color: i < level ? 'var(--ink)' : 'var(--hairline-strong)' }}>$</span>
      ))}
    </span>
  );
}

// ── Image placeholder (striped) ───────────────────────────────────────────────
export function ImagePlaceholder({ label, accent, radius = 0, height, style }) {
  const a = accent || 'var(--accent)';
  const rgba = (hex, alpha) => {
    if (!hex || hex.startsWith('var')) return `rgba(190,18,60,${alpha})`;
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  };
  return (
    <div style={{
      position: 'relative', width: '100%', borderRadius: radius, overflow: 'hidden', height,
      background: `repeating-linear-gradient(135deg, ${rgba(a, .12)} 0 10px, ${rgba(a, .05)} 10px 20px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid var(--hairline)', ...style,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
        color: rgba(a, .9), background: 'var(--surface)', padding: '4px 9px', borderRadius: 6,
        border: `1px solid ${rgba(a, .25)}`,
      }}>{label}</span>
    </div>
  );
}

// ── Chip / tag ────────────────────────────────────────────────────────────────
export function Chip({ children, active, onClick }) {
  const clickable = !!onClick;
  return (
    <button onClick={onClick} disabled={!clickable} style={{
      fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '.01em',
      padding: '7px 14px', borderRadius: 999, cursor: clickable ? 'pointer' : 'default',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
      background: active ? 'var(--accent)' : 'var(--surface)',
      color: active ? 'var(--accent-ink)' : 'var(--ink)',
      transition: 'all .16s ease', whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', full, icon, type, disabled, style }) {
  const sizes = { sm: { p: '8px 14px', f: 13 }, md: { p: '11px 20px', f: 14.5 }, lg: { p: '14px 26px', f: 15.5 } };
  const s = sizes[size];
  const variants = {
    primary: { background: 'var(--accent)', color: 'var(--accent-ink)', border: '1px solid var(--accent)' },
    ghost:   { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--hairline-strong)' },
    soft:    { background: 'var(--muted-bg)', color: 'var(--ink)', border: '1px solid var(--hairline)' },
    danger:  { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' },
    quiet:   { background: 'transparent', color: 'var(--muted-fg)', border: '1px solid transparent' },
  };
  const [hover, setHover] = useState(false);
  return (
    <button type={type || 'button'} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: s.f, padding: s.p, borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
        width: full ? '100%' : undefined, transition: 'transform .12s ease, filter .16s ease',
        transform: hover && !disabled ? 'translateY(-1px)' : 'none',
        filter: hover && !disabled ? 'brightness(1.04)' : 'none',
        ...variants[variant], ...style,
      }}>
      {icon && <Icon name={icon} size={s.f + 2} />}{children}
    </button>
  );
}

// ── Category rating bar ───────────────────────────────────────────────────────
export function CategoryBar({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', width: 78, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'var(--muted-bg)', overflow: 'hidden' }}>
        <div style={{ width: `${(value / 5) * 100}%`, height: '100%', borderRadius: 999, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.2,.7,.2,1)' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', width: 28, textAlign: 'right' }}>{value.toFixed(1)}</span>
    </div>
  );
}

// ── Avatar (initials) ─────────────────────────────────────────────────────────
export function Avatar({ name, size = 38 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--muted-bg)', color: 'var(--ink)', border: '1px solid var(--hairline)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: size * 0.36,
    }}>{initials}</div>
  );
}

// ── Field + FieldError (for forms) ────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

export function FieldError({ children }) {
  return <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--danger)', margin: '-8px 0 14px' }}>{children}</div>;
}

export const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontSize: 14.5,
  fontFamily: 'var(--font-ui)', border: '1px solid var(--hairline-strong)', borderRadius: 10,
  background: 'var(--surface)', color: 'var(--ink)', outline: 'none', transition: 'border-color .15s',
};

// ── Relative date ─────────────────────────────────────────────────────────────
export function relativeDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  const days = Math.round((Date.now() - d) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

// ── avgOf category ratings ────────────────────────────────────────────────────
export function avgOf(cat) {
  const v = Object.values(cat);
  return v.reduce((s, n) => s + n, 0) / v.length;
}
