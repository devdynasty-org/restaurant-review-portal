import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OwnerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/owner/dashboard', { withCredentials: true })
      .then(res => {
        setRestaurants(res.data.data);
      })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          window.location.href = '/owner/login';
        } else {
          setError('Failed to load dashboard.');
        }
      });
  }, []);

  const handleLogout = async () => {
    await axios.post('/api/auth/owner/logout', {}, { withCredentials: true });
    window.location.href = '/owner/login';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Owner Dashboard</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Log Out</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <h3 style={styles.sectionTitle}>Your Restaurants</h3>

      {restaurants.length === 0 ? (
        <p style={styles.empty}>No restaurants found.</p>
      ) : (
        <div style={styles.grid}>
          {restaurants.map(r => (
            <div key={r.id} style={styles.card}>
              <h4 style={styles.restaurantName}>{r.name}</h4>
              <p style={styles.restaurantMeta}>{r.cuisine} · {r.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', margin: 0 },
  logoutBtn: { padding: '0.4rem 1rem', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '0.875rem' },
  sectionTitle: { fontSize: '1.1rem', marginBottom: '1rem' },
  empty: { color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  card: { backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  restaurantName: { margin: '0 0 4px', fontSize: '1rem' },
  restaurantMeta: { margin: 0, color: '#666', fontSize: '0.85rem' }
};

export default OwnerDashboard;