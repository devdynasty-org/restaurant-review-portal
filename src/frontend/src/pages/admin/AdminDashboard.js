// src/pages/admin/AdminDashboard.js
// Admin portal with dark sidebar shell (WFShell pattern).
// Sidebar nav: Dashboard · Flagged reviews · Restaurant requests · Users · Audit log · Settings
// Backend: GET /admin/reviews/flagged, PUT /admin/reviews/:id/remove, PUT /admin/reviews/:id/dismiss

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, Stars, Avatar, Button, relativeDate } from '../../components/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'food_quality',     label: 'Food'     },
  { key: 'customer_service', label: 'Service'  },
  { key: 'ambiance',         label: 'Ambiance' },
  { key: 'value_for_money',  label: 'Value'    },
];

function reviewAvg(rev) {
  return (rev.food_quality + rev.customer_service + rev.ambiance + rev.value_for_money) / 4;
}

const ADMIN_NAV = [
  { label: 'Dashboard',            icon: 'grid'    },
  { label: 'Flagged reviews',       icon: 'flag'    },
  { label: 'Restaurant requests',   icon: 'store'   },
  { label: 'Users',                 icon: 'user'    },
  { label: 'Audit log',             icon: 'list'    },
  { label: 'Settings',              icon: 'settings'},
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

// ── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ kind }) {
  const map = {
    flagged:  { label: 'Flagged',  bg: 'var(--danger-bg)',  fg: 'var(--danger)',  bd: 'var(--danger-border)'   },
    pending:  { label: 'Pending',  bg: 'var(--muted-bg)',   fg: 'var(--muted-fg)',bd: 'var(--hairline-strong)' },
    active:   { label: 'Active',   bg: 'var(--success-bg)', fg: 'var(--success)', bd: 'var(--success-border)'  },
    removed:  { label: 'Removed',  bg: 'var(--muted-bg)',   fg: 'var(--muted-fg)',bd: 'var(--hairline-strong)' },
    declined: { label: 'Declined', bg: 'var(--muted-bg)',   fg: 'var(--muted-fg)',bd: 'var(--hairline-strong)' },
  };
  const m = map[kind] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-ui)', fontSize: 11.5, fontWeight: 700,
      color: m.fg, background: m.bg, border: `1px solid ${m.bd}`,
      borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.fg, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ── Stat card (value + icon side-by-side, label below) ───────────────────────
function StatCard({ value, label, icon, accent }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${accent ? 'var(--danger-border)' : 'var(--hairline)'}`,
      borderRadius: 'var(--card-radius)', padding: '18px 22px', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 38, lineHeight: 1,
          color: accent ? 'var(--danger)' : 'var(--ink)',
        }}>
          {value}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: accent ? 'var(--danger-bg)' : 'var(--muted-bg)',
          color: accent ? 'var(--danger)' : 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={17} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)' }}>{label}</div>
    </div>
  );
}

// ── Flagged review card ───────────────────────────────────────────────────────
function FlaggedCard({ rev, onResolved }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // 'removed' | 'dismissed'

  const act = async (kind) => {
    setBusy(true);
    try {
      const path = kind === 'removed'
        ? `/admin/reviews/${rev.review_id}/remove`
        : `/admin/reviews/${rev.review_id}/dismiss`;
      await api.put(path);
      setDone(kind);
      setTimeout(() => onResolved(rev.review_id), 360);
    } catch {
      setBusy(false);
    }
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 16, padding: 22, boxShadow: 'var(--shadow-sm)',
      borderLeft: `3px solid ${done === 'removed' ? 'var(--danger)' : done === 'dismissed' ? 'var(--success)' : 'var(--danger)'}`,
      opacity: done ? 0 : 1, transform: done ? 'translateX(10px)' : 'none',
      transition: 'opacity .34s ease, transform .34s ease',
    }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar name={rev.author?.name || 'A'} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
            {rev.author?.name || 'Anonymous'}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>
            on <strong style={{ color: 'var(--ink)' }}>{rev.restaurant?.name || 'Unknown restaurant'}</strong>
            {' · '}{relativeDate(rev.createdAt)}
          </div>
        </div>
        <StatusPill kind="flagged" />
        <Stars value={reviewAvg(rev)} size={15} />
      </div>

      {/* Comment */}
      {rev.comments && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.55, color: 'var(--muted-fg)', margin: '0 0 12px' }}>
          {rev.comments}
        </p>
      )}

      {/* Per-category chips */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATEGORIES.map(c => (
          <span key={c.key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)',
            background: 'var(--muted-bg)', padding: '4px 9px', borderRadius: 7,
          }}>
            {c.label} <strong style={{ color: 'var(--ink)' }}>{rev[c.key]}.0</strong>
          </span>
        ))}
      </div>

      {/* Flag info */}
      <div style={{
        display: 'flex', gap: 10, padding: 13, borderRadius: 11,
        background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', marginBottom: 14,
      }}>
        <span style={{ color: 'var(--danger)', marginTop: 1, flexShrink: 0 }}><Icon name="flag" size={16} /></span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 700, color: 'var(--danger)' }}>
              Flagged by {rev.flagger?.name || 'an owner'}
            </span>
            {rev.flag_reason && (
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--danger)',
                background: 'var(--surface)', border: '1px solid var(--danger-border)',
                borderRadius: 999, padding: '2px 9px',
              }}>
                {rev.flag_reason}
              </span>
            )}
          </div>
          {rev.flag_note && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-fg)', marginTop: 3, lineHeight: 1.5 }}>
              {rev.flag_note}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button size="sm" icon="check" onClick={() => act('dismissed')} disabled={busy}>Keep published</Button>
        <Button size="sm" variant="danger" icon="trash" onClick={() => act('removed')} disabled={busy}>Remove review</Button>
        <Button size="sm" variant="quiet" icon="eye" onClick={() => {}} disabled={busy}>View in context</Button>
      </div>
    </div>
  );
}

// ── Audit log ────────────────────────────────────────────────────────────────
const ACTION_META = {
  approve:          { label: 'Approved',       icon: 'check',  fg: 'var(--success)',  bg: 'var(--success-bg)',  bd: 'var(--success-border)'  },
  reject:           { label: 'Rejected',        icon: 'x',      fg: 'var(--muted-fg)', bg: 'var(--muted-bg)',    bd: 'var(--hairline-strong)' },
  remove:           { label: 'Removed',         icon: 'trash',  fg: 'var(--danger)',   bg: 'var(--danger-bg)',   bd: 'var(--danger-border)'   },
  decline:          { label: 'Flag declined',   icon: 'flag',   fg: 'var(--muted-fg)', bg: 'var(--muted-bg)',    bd: 'var(--hairline-strong)' },
  'delete-account': { label: 'Account deleted', icon: 'trash',  fg: 'var(--danger)',   bg: 'var(--danger-bg)',   bd: 'var(--danger-border)'   },
  edit:             { label: 'Edited',          icon: 'edit',   fg: 'var(--accent)',   bg: 'var(--muted-bg)',    bd: 'var(--hairline-strong)' },
  flag:             { label: 'Flagged',         icon: 'flag',   fg: 'var(--accent)',   bg: 'var(--danger-bg)',   bd: 'var(--danger-border)'   },
  signin:           { label: 'Sign-in',         icon: 'lock',   fg: 'var(--muted-fg)', bg: 'var(--muted-bg)',    bd: 'var(--hairline-strong)' },
};
const ACTOR_ICON = { admin: 'shield', owner: 'store', system: 'settings' };

function fmtTs(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-CA');              // YYYY-MM-DD
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date}\n${time}`;
}

function ActionPill({ action }) {
  const m = ACTION_META[action] || { label: action, icon: 'list', fg: 'var(--muted-fg)', bg: 'var(--muted-bg)', bd: 'var(--hairline-strong)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700,
      color: m.fg, background: m.bg, border: `1px solid ${m.bd}`,
      borderRadius: 7, padding: '4px 9px', whiteSpace: 'nowrap',
    }}>
      <Icon name={m.icon} size={13} /> {m.label}
    </span>
  );
}

function AuditLogSection() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/audit-log')
      .then(res  => { setLogs(res.data.data || []); setLoading(false); })
      .catch(() => { setError('Failed to load audit log.'); setLoading(false); });
  }, []);

  const ACTION_OPTIONS = [
    { value: 'all',            label: 'All actions'    },
    { value: 'remove',         label: 'Removed'        },
    { value: 'decline',        label: 'Flag declined'  },
    { value: 'approve',        label: 'Approved'       },
    { value: 'reject',         label: 'Rejected'       },
    { value: 'delete-account', label: 'Account deleted'},
    { value: 'edit',           label: 'Edited'         },
    { value: 'signin',         label: 'Sign-in'        },
  ];

  const filtered = actionFilter === 'all' ? logs : logs.filter(e => e.action === actionFilter);

  // CSV export
  const exportCsv = () => {
    const header = ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Restaurant', 'Detail'];
    const rows = filtered.map(e => [
      fmtTs(e.createdAt).replace('\n', ' '),
      e.actor_name,
      e.actor_role,
      e.action,
      e.target_description || '',
      e.meta || '',
      (e.detail || '').replace(/"/g, '""'),
    ].map(v => `"${v}"`).join(','));
    const csv  = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Page heading */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 30, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-.02em' }}>
          Audit log
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: 0, lineHeight: 1.55, maxWidth: '72ch' }}>
          An immutable, chronological record of every privileged action — moderation decisions, account deletions, restaurant edits and sign-ins. Each entry is permanent and exportable for compliance.
        </p>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Action type filter */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 13px', borderRadius: 10, border: '1px solid var(--hairline-strong)', background: 'var(--surface)' }}>
          <Icon name="filter" size={14} style={{ color: 'var(--muted-fg)', flexShrink: 0 }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-fg)', marginBottom: 1 }}>Action type</div>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              style={{
                fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', padding: 0,
                appearance: 'none', WebkitAppearance: 'none',
              }}
            >
              {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Icon name="chevron" size={13} style={{ color: 'var(--muted-fg)', transform: 'rotate(90deg)', flexShrink: 0 }} />
        </div>

        {actionFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setActionFilter('all')}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Clear filter
          </button>
        )}

        {/* Export CSV — right-aligned */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={exportCsv}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--ink)',
              padding: '9px 14px', borderRadius: 10, border: '1px solid var(--hairline-strong)',
              background: 'var(--surface)', cursor: 'pointer',
            }}
          >
            <Icon name="upload" size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 16 }}>{error}</div>
      )}

      {loading && (
        <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
      )}

      {!loading && !error && (
        <>
          {/* Log table */}
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden', background: 'var(--surface)' }}>
            {/* Column header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '150px 190px 160px 1fr',
              gap: 16, padding: '12px 20px',
              background: 'var(--bg)', borderBottom: '1px solid var(--hairline)',
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.12em',
              textTransform: 'uppercase', color: 'var(--muted-fg)', fontWeight: 600,
            }}>
              <span>Timestamp</span>
              <span>Actor</span>
              <span>Action</span>
              <span>Target &amp; detail</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)' }}>
                No audit entries yet. Actions (removing reviews, dismissing flags) will appear here.
              </div>
            ) : (
              filtered.map((e, i) => (
                <div
                  key={e.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '150px 190px 160px 1fr',
                    gap: 16, padding: '16px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--hairline)' : 'none',
                    alignItems: 'start',
                  }}
                >
                  {/* Timestamp — two lines */}
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-fg)',
                    lineHeight: 1.6, whiteSpace: 'pre-line',
                  }}>
                    {fmtTs(e.createdAt)}
                  </div>

                  {/* Actor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--muted-bg)',
                      color: e.actor_role === 'system' ? 'var(--muted-fg)' : 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={ACTOR_ICON[e.actor_role] || 'user'} size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.actor_name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted-fg)' }}>
                        {e.actor_role}
                      </div>
                    </div>
                  </div>

                  {/* Action pill */}
                  <div><ActionPill action={e.action} /></div>

                  {/* Target & detail */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>
                      {e.target_description || '—'}
                      {e.meta && (
                        <span style={{ fontWeight: 400, color: 'var(--muted-fg)', marginLeft: 6 }}>
                          · {e.meta}
                        </span>
                      )}
                    </div>
                    {e.detail && (
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted-fg)', margin: 0 }}>
                        {e.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tamper-evidence footer */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)', margin: '14px 2px 0', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="shield" size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
            Entries cannot be edited or deleted. Retained for 24 months.
          </p>
        </>
      )}
    </>
  );
}

// ── Placeholder for unimplemented sections ────────────────────────────────────
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
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [flagged, setFlagged]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeSection, setActiveSection] = useState('Dashboard');

  const load = () => {
    api.get('/admin/reviews/flagged')
      .then(res  => { setFlagged(res.data.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
        else { setError('Failed to load the moderation queue.'); setLoading(false); }
      });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleResolved = (reviewId) => setFlagged(list => list.filter(r => r.review_id !== reviewId));
  const handleLogout   = async () => { await logout(); navigate('/'); };

  const flagBadge = !loading && flagged.length > 0 ? flagged.length : null;

  const navItems = ADMIN_NAV.map(item => ({
    ...item,
    badge: item.label === 'Flagged reviews' ? flagBadge : null,
  }));

  // ── Section content ────────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeSection === 'Dashboard') {
      return (
        <>
          {/* Page heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 30, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-.02em' }}>
              Moderation overview
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)', margin: 0, lineHeight: 1.5, maxWidth: '58ch' }}>
              Reviews publish instantly — you only step in for flagged content, requests and accounts.
            </p>
          </div>

          {/* Stats */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 30 }}>
              <StatCard value={String(flagged.length)} label="Flagged reviews" icon="flag" accent={flagged.length > 0} />
              <StatCard value="—" label="Restaurant requests" icon="store" />
              <StatCard value="—" label="User accounts"       icon="user" />
              <StatCard value="—" label="Published reviews"   icon="comment" />
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 20 }}>{error}</div>
          )}

          {/* Jump to Flagged button when queue has items */}
          {!loading && flagged.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', marginBottom: 20 }}>
              <Icon name="flag" size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--danger)', flex: 1 }}>
                {flagged.length} flagged {flagged.length === 1 ? 'review needs' : 'reviews need'} a decision
              </span>
              <Button size="sm" onClick={() => setActiveSection('Flagged reviews')}>Review now</Button>
            </div>
          )}

          {loading && <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>}
        </>
      );
    }

    if (activeSection === 'Flagged reviews') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-.02em' }}>
                Flagged reviews
              </h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)', margin: 0 }}>
                {loading ? 'Loading…' : flagged.length > 0
                  ? `${flagged.length} ${flagged.length === 1 ? 'review' : 'reviews'} awaiting a decision`
                  : 'Queue is clear — nothing to review.'}
              </p>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 10, color: 'var(--danger)', fontFamily: 'var(--font-ui)', fontSize: 13.5, marginBottom: 20 }}>{error}</div>
          )}

          {loading ? (
            <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted-fg)' }}>Loading…</div>
          ) : flagged.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--card-radius)', border: '1px dashed var(--hairline-strong)', background: 'var(--muted-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)', marginBottom: 10 }}><Icon name="check" size={26} /></div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Queue is clear</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--muted-fg)' }}>No flagged reviews to moderate right now.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {flagged.map(rev => <FlaggedCard key={rev.review_id} rev={rev} onResolved={handleResolved} />)}
            </div>
          )}
        </>
      );
    }

    if (activeSection === 'Audit log') {
      return <AuditLogSection />;
    }

    // Any unimplemented section
    const navItem = ADMIN_NAV.find(n => n.label === activeSection);
    return <ComingSoon section={activeSection} icon={navItem?.icon || 'settings'} />;
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  const userInitials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'A';

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
          <Icon name="shield" size={11} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.75)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
            Admin
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => (
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
                {user?.name || 'Admin'}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'rgba(255,255,255,.45)' }}>Administrator</div>
            </div>
          </div>
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
            <span style={{ color: 'var(--muted-fg)', fontWeight: 500 }}>Admin</span>
            <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{activeSection}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Tamper-evident badge when on audit log */}
            {activeSection === 'Audit log' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--muted-fg)' }}>
                <Icon name="lock" size={13} /> Read-only · tamper-evident
              </span>
            )}
            {/* Bell with dot when flagged items exist */}
            <button type="button" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-fg)', padding: 7, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
              <Icon name="bell" size={19} />
              {!loading && flagged.length > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--surface)' }} />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px 30px 60px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
