import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AccessDenied from './pages/owner/AccessDenied';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { THEME } from './design/theme';
import { Icon } from './components/ui';
import AdminDashboard from './pages/admin/AdminDashboard';

const ownerPaths = ['/owner/login', '/owner/dashboard', '/access-denied', '/admin'];
// Paths that use their own full-screen shell (no shared TopNav/footer)
const portalPaths = ['/owner/dashboard', '/admin'];

// ── Sidebar-nav item with hover state ────────────────────────────────────────
function NavDropdownItem({ icon, label, onClick, danger }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
        background: hover ? 'var(--muted-bg)' : 'transparent',
        color: danger ? 'var(--danger)' : 'var(--ink)',
        fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, textAlign: 'left',
        transition: 'background .12s ease',
      }}
    >
      <Icon name={icon} size={15} style={{ color: danger ? 'var(--danger)' : 'var(--muted-fg)', flexShrink: 0 }} />
      {label}
    </button>
  );
}

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isHome = location.pathname === '/';
  const [accountOpen, setAccountOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accountOpen]);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate('/');
  };

  const initials = user
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('')
    : '';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--surface-translucent)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--hairline)',
    }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto',
        padding: '0 clamp(18px, 4vw, 40px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, color: 'var(--ink)', letterSpacing: '-.01em' }}>Tabletalk</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: 1 }} />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 18px)' }}>
          <Link to="/" style={navLinkStyle(isHome)}>Discover</Link>

          {user ? (
            <>
              {/* Role-specific dashboard shortcut */}
              {user.role === 'owner' && (
                <Link to="/owner/dashboard" style={navLinkStyle(location.pathname.startsWith('/owner/dashboard'))}>
                  Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" style={navLinkStyle(location.pathname.startsWith('/admin'))}>
                  Moderation
                </Link>
              )}

              {/* Avatar dropdown pill */}
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setAccountOpen(o => !o)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '5px 10px 5px 5px', borderRadius: 999, cursor: 'pointer',
                    background: accountOpen ? 'var(--muted-bg)' : 'transparent',
                    border: '1px solid var(--hairline-strong)',
                    transition: 'background .15s ease',
                  }}
                >
                  {/* Initials circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <Icon
                    name="chevron"
                    size={14}
                    style={{
                      color: 'var(--muted-fg)',
                      transform: accountOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform .15s ease',
                    }}
                  />
                </button>

                {accountOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
                    background: 'var(--surface)', border: '1px solid var(--hairline)',
                    borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 6, minWidth: 210,
                  }}>
                    {/* User info header */}
                    <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--hairline)', marginBottom: 4 }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted-fg)', marginTop: 1 }}>
                        {user.email}
                      </div>
                    </div>

                    <NavDropdownItem icon="comment"  label="My reviews"       onClick={() => { setAccountOpen(false); navigate('/profile'); }} />
                    <NavDropdownItem icon="bookmark" label="Saved places"     onClick={() => { setAccountOpen(false); navigate('/profile'); }} />
                    <NavDropdownItem icon="settings" label="Account settings" onClick={() => { setAccountOpen(false); navigate('/profile'); }} />

                    <div style={{ height: 1, background: 'var(--hairline)', margin: '4px 6px' }} />

                    <NavDropdownItem icon="logout" label="Sign out"          onClick={handleLogout} />
                    <NavDropdownItem icon="trash"  label="Delete my account" onClick={() => { setAccountOpen(false); navigate('/profile'); }} danger />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle(location.pathname === '/login')}>Log in</Link>
              <Link to="/register" style={{
                ...navLinkStyle(false),
                background: 'var(--accent)', color: 'var(--accent-ink)',
                borderRadius: 999, padding: '7px 16px',
              }}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function navLinkStyle(active) {
  return {
    fontFamily: 'var(--font-ui)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
    background: 'none', border: 'none', color: active ? 'var(--ink)' : 'var(--muted-fg)',
    padding: '7px 6px', transition: 'color .15s ease', textDecoration: 'none',
  };
}

function Layout() {
  const location = useLocation();
  const isOwner = ownerPaths.some(p => location.pathname.startsWith(p));
  const isPortal = portalPaths.some(p => location.pathname.startsWith(p));

  return (
    <div style={{ ...THEME, background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      {/* TopNav is hidden on portal pages — they have their own sidebar header */}
      {!isPortal && <TopNav />}

      <main>
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/dashboard" element={
            <ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/access-denied" element={<AccessDenied />} />
        </Routes>
      </main>

      {!isOwner && location.pathname !== '/login' && location.pathname !== '/register' && !isPortal && (
        <footer style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface)' }}>
          <div style={{
            maxWidth: 1180, margin: '0 auto',
            padding: '28px clamp(18px,4vw,40px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>Tabletalk</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted-fg)' }}>
              A DevDynasty project · Restaurant Review Portal
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
