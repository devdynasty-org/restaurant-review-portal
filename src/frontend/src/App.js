import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AccessDenied from './pages/owner/AccessDenied';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { THEME } from './design/theme';
import { Icon } from './components/ui';
import AdminDashboard from './pages/admin/AdminDashboard';

const ownerPaths = ['/owner/login', '/owner/dashboard', '/access-denied', '/admin'];

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isOwner = ownerPaths.some(p => location.pathname.startsWith(p));
  const isHome = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
          <Link to="/" style={navLinkStyle(!isOwner && isHome)}>Discover</Link>

          {user ? (
            <>
              {/* Role-specific dashboard link */}
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
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted-fg)' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} style={{
                ...navLinkStyle(false),
                border: '1px solid var(--hairline-strong)', borderRadius: 999, padding: '7px 16px',
                display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
              }}>
                <Icon name="logout" size={14} /> Log out
              </button>
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

  return (
    <div style={{ ...THEME, background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      <TopNav />

      <main>
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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

      {!isOwner && (
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
