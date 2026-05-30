import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon, FrostedRating, PriceLevel, Chip } from './ui';

function RestaurantCard({ r, onOpen }) {
  const [hover, setHover] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 'var(--card-radius)', overflow: 'hidden',
        transition: 'transform .28s cubic-bezier(.2,.7,.2,1), box-shadow .28s ease, border-color .28s ease',
        transform: hover ? 'translateY(-6px)' : 'none',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        borderColor: hover ? 'transparent' : 'var(--hairline)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image with gradient scrim */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ transform: hover ? 'scale(1.06)' : 'scale(1)', transition: 'transform .55s cubic-bezier(.2,.7,.2,1)' }}>
          <CardPlaceholder label={`${r.cuisine} · photo`} accent={r.accent} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 14, bottom: 14 }}>
          <FrostedRating overall={r.overall_rating} count={r.review_count} />
        </div>
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          aria-label="Save"
          style={{
            position: 'absolute', top: 13, right: 13, width: 36, height: 36, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.32)', background: 'rgba(255,255,255,.16)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <Icon name="bookmark" size={16} style={{ fill: saved ? '#fff' : 'none', stroke: '#fff' }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--card-pad)', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          {r.cuisine}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{
            flex: 1, minWidth: 0,
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--card-title)',
            color: 'var(--ink)', margin: 0, letterSpacing: '-.015em', lineHeight: 1.12,
            backgroundImage: 'linear-gradient(var(--accent),var(--accent))',
            backgroundSize: hover ? '100% 1.5px' : '0% 1.5px',
            backgroundPosition: '0 100%', backgroundRepeat: 'no-repeat',
            transition: 'background-size .4s cubic-bezier(.2,.7,.2,1)', paddingBottom: 2,
          }}>{r.name}</h3>
          <span style={{ flexShrink: 0, paddingTop: 4 }}>
            {r.priceLevel && <PriceLevel level={r.priceLevel} />}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>
          <Icon name="pin" size={13} /> {r.location}
        </div>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: 13.8, lineHeight: 1.55, color: 'var(--muted-fg)',
          margin: '4px 0 0', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{r.blurb || r.description}</p>
      </div>
    </article>
  );
}

function CardPlaceholder({ label, accent }) {
  const rgba = (hex, alpha) => {
    if (!hex || hex.startsWith('var')) return `rgba(190,18,60,${alpha})`;
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  };
  return (
    <div style={{
      width: '100%', height: 'var(--card-img-h)',
      background: `repeating-linear-gradient(135deg, ${rgba(accent, .12)} 0 10px, ${rgba(accent, .05)} 10px 20px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: 'none',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
        color: rgba(accent, .9), background: 'var(--surface)', padding: '4px 9px', borderRadius: 6,
        border: `1px solid ${rgba(accent, .25)}`,
      }}>{label}</span>
    </div>
  );
}

const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [sort, setSort] = useState('top');

  useEffect(() => {
    axios.get('/api/restaurants')
      .then(res => { setRestaurants(res.data.data); setLoading(false); })
      .catch(() => { setError('Failed to load restaurants. Please try again.'); setLoading(false); });
  }, []);

  const cuisines = useMemo(() => ['All', ...Array.from(new Set(restaurants.map(r => r.cuisine)))], [restaurants]);

  const filtered = useMemo(() => {
    let list = restaurants.filter(r => {
      const q = query.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
      const matchCuisine = cuisine === 'All' || r.cuisine === cuisine;
      return matchName && matchCuisine;
    });
    if (sort === 'top') list = [...list].sort((a, b) => (b.overall_rating || -1) - (a.overall_rating || -1));
    if (sort === 'az')  list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [restaurants, query, cuisine, sort]);

  return (
    <div>
      {/* Editorial hero */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(40px,7vw,84px) clamp(18px,4vw,40px) clamp(20px,3vw,36px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ height: 1, width: 34, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Colombo · Dining Guide
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-.02em',
          fontSize: 'clamp(38px, 7vw, 76px)', color: 'var(--ink)', margin: '0 0 18px', maxWidth: '14ch',
        }}>
          Where the city <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>eats</em>.
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.55, color: 'var(--muted-fg)', maxWidth: '52ch', margin: 0 }}>
          Honest reviews from real diners, rated on food, service, ambiance and value. Find your next table.
        </p>

        {/* Search */}
        <div style={{ marginTop: 'clamp(26px,3.5vw,40px)', maxWidth: 560 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-fg)', pointerEvents: 'none' }}>
              <Icon name="search" size={19} />
            </span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search restaurants, cuisines…"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '15px 16px 15px 46px', fontSize: 15.5,
                fontFamily: 'var(--font-ui)', border: '1px solid var(--hairline-strong)', borderRadius: 13,
                background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,.03)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Filter / sort bar */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(18px,4vw,40px)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap', paddingBottom: 18, borderBottom: '1px solid var(--hairline)',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cuisines.map(c => <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>{c}</Chip>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>Sort</span>
            <div style={{ display: 'flex', background: 'var(--muted-bg)', borderRadius: 9, padding: 3, border: '1px solid var(--hairline)' }}>
              {[['top', 'Top rated'], ['az', 'A–Z']].map(([k, l]) => (
                <button key={k} onClick={() => setSort(k)} style={{
                  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 7,
                  border: 'none', cursor: 'pointer',
                  background: sort === k ? 'var(--surface)' : 'transparent',
                  color: sort === k ? 'var(--ink)' : 'var(--muted-fg)',
                  boxShadow: sort === k ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {!loading && !error && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: '16px 0 0' }}>
            {filtered.length} {filtered.length === 1 ? 'restaurant' : 'restaurants'}
          </p>
        )}
      </section>

      {/* Cards */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '20px clamp(18px,4vw,40px) clamp(60px,8vw,100px)' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--muted-fg)', fontFamily: 'var(--font-ui)' }}>
            Loading restaurants…
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--danger)', fontFamily: 'var(--font-ui)' }}>
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--muted-fg)', fontFamily: 'var(--font-ui)' }}>
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Icon name="search" size={30} /></div>
            No restaurants match your search.
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(18px,2.4vw,28px)',
          }}>
            {filtered.map(r => (
              <RestaurantCard key={r.id} r={r} onOpen={() => navigate(`/restaurants/${r.id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RestaurantList;
