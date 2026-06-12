// src/components/RestaurantList.js
// Stripped to REAL API fields: name, cuisine_type, overall_rating, description.
// Removed mock-only fields (accent, priceLevel, location, tags, blurb).

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Icon, Chip, ImagePlaceholder, FrostedRating, PriceLevel, getCuisineImage } from './ui';

function RestaurantCard({ r, onOpen }) {
  const [hover, setHover] = useState(false);
  const rating  = Number(r.overall_rating) || 0;
  const count   = Number(r.review_count)   || 0;

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
      {/* Image area: ImagePlaceholder + scrim + FrostedRating + bookmark */}
      <div style={{ position: 'relative', height: 'var(--card-img-h, 158px)', flexShrink: 0 }}>
        <ImagePlaceholder
          label={r.cuisine_type || 'Restaurant'}
          src={getCuisineImage(r.cuisine_type, r.restaurant_id)}
          style={{ height: '100%', border: 'none', borderRadius: 0 }}
        />
        {/* Scrim */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.54) 0%, transparent 55%)' }} />
        {/* FrostedRating — bottom left */}
        <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
          <FrostedRating overall={rating > 0 ? rating : null} count={count > 0 ? count : null} />
        </div>
        {/* Bookmark — top right */}
        <button
          type="button"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'background .15s ease',
          }}
        >
          <Icon name="bookmark" size={15} />
        </button>
      </div>

      {/* Text body */}
      <div style={{ padding: 'var(--card-pad, 18px)', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          {r.cuisine_type || 'Cuisine'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--card-title, 21px)',
            color: 'var(--ink)', margin: 0, letterSpacing: '-.015em', lineHeight: 1.12,
          }}>{r.name}</h3>
          {r.price_level != null && <PriceLevel level={Number(r.price_level)} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>
          <Icon name="pin" size={13} />{r.address}
        </div>
        {r.description && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted-fg)',
            margin: '3px 0 0', display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{r.description}</p>
        )}
      </div>
    </article>
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
    api.get('/restaurants')
      .then(res => { setRestaurants(res.data.data); setLoading(false); })
      .catch(() => { setError('Failed to load restaurants. Please try again.'); setLoading(false); });
  }, []);

  const cuisines = useMemo(
    () => ['All', ...Array.from(new Set(restaurants.map(r => r.cuisine_type).filter(Boolean)))],
    [restaurants]
  );

  const filtered = useMemo(() => {
    let list = restaurants.filter(r => {
      const q = query.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q) || (r.cuisine_type || '').toLowerCase().includes(q);
      const matchCuisine = cuisine === 'All' || r.cuisine_type === cuisine;
      return matchName && matchCuisine;
    });
    if (sort === 'top') list = [...list].sort((a, b) => (Number(b.overall_rating) || -1) - (Number(a.overall_rating) || -1));
    if (sort === 'az')  list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [restaurants, query, cuisine, sort]);

  return (
    <div>
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(40px,7vw,84px) clamp(18px,4vw,40px) clamp(20px,3vw,36px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ height: 1, width: 34, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Dining Guide
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-.02em',
          fontSize: 'clamp(38px, 7vw, 76px)', color: 'var(--ink)', margin: '0 0 18px', maxWidth: '14ch',
        }}>
          Where the city <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>eats</em>.
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.55, color: 'var(--muted-fg)', maxWidth: '52ch', margin: 0 }}>
          Honest reviews from real diners, rated on food, service, ambiance and value.
        </p>

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
              }}
            />
          </div>
        </div>
      </section>

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
            No restaurants yet. Once an owner adds one, it'll appear here.
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(18px,2.4vw,28px)',
          }}>
            {filtered.map(r => (
              <RestaurantCard key={r.restaurant_id} r={r} onOpen={() => navigate(`/restaurants/${r.restaurant_id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RestaurantList;
