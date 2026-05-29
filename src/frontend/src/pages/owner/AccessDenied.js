import React from 'react';

const AccessDenied = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.code}>403</h2>
        <h3 style={styles.title}>Access Denied</h3>
        <p style={styles.message}>You don't have permission to view this page.</p>
        <a href="/" style={styles.link}>Back to Home</a>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' },
  card: { textAlign: 'center', backgroundColor: '#fff', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  code: { fontSize: '3rem', margin: '0 0 0.5rem', color: '#c0392b' },
  title: { margin: '0 0 0.75rem', fontSize: '1.25rem' },
  message: { color: '#666', marginBottom: '1.5rem' },
  link: { color: '#2d6a4f', fontWeight: '600', textDecoration: 'none' }
};

export default AccessDenied;