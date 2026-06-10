import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admin/stats', { withCredentials: true })
      .then(res => setStats(res.data.data))
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          window.location.href = '/admin/login';
        } else {
          setError('Failed to load stats.');
        }
      });
  }, []);

  const handleLogout = async () => {
    await axios.post('/api/auth/admin/logout', {}, { withCredentials: true });
    window.location.href = '/admin/login';
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Admin Portal</h2>
        <nav>
          <p style={styles.navItem}>Dashboard</p>
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>Log Out</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.heading}>Dashboard</h1>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {stats && (
          <div style={styles.grid}>
            <div style={{ ...styles.card, borderTop: '4px solid #f39c12' }}>
              <p style={styles.cardLabel}>Pending Reviews</p>
              <p style={styles.cardValue}>{stats.pendingReviews}</p>
            </div>
            <div style={{ ...styles.card, borderTop: '4px solid #2980b9' }}>
              <p style={styles.cardLabel}>Total Users</p>
              <p style={styles.cardValue}>{stats.newUsers}</p>
            </div>
            <div style={{ ...styles.card, borderTop: '4px solid #c0392b' }}>
              <p style={styles.cardLabel}>Flagged Content</p>
              <p style={styles.cardValue}>{stats.flaggedContent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  sidebar: { width: '220px', backgroundColor: '#1a1a2e', color: '#fff', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' },
  sidebarTitle: { fontSize: '1.1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1rem' },
  navItem: { padding: '0.5rem 0.75rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', cursor: 'default', fontSize: '0.9rem' },
  logoutBtn: { marginTop: 'auto', padding: '0.5rem', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' },
  main: { flex: 1, padding: '2rem' },
  topbar: { marginBottom: '2rem' },
  heading: { fontSize: '1.5rem', margin: 0 },
  error: { color: 'red', fontSize: '0.875rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  cardLabel: { margin: '0 0 8px', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardValue: { margin: 0, fontSize: '2.5rem', fontWeight: '700', color: '#1a1a2e' }
};

export default AdminDashboard;
