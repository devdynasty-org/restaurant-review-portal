import React, { useState } from 'react';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        '/api/auth/admin/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      if (err.response?.status === 403) {
        window.location.href = '/access-denied';
      } else {
        setError('Invalid email or password.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Portal</h2>
        <p style={styles.subtitle}>Restricted Access</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>Log In</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a2e' },
  card: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', width: '360px' },
  title: { margin: '0 0 4px', fontSize: '1.5rem' },
  subtitle: { margin: '0 0 1.5rem', color: '#888', fontSize: '0.9rem' },
  error: { color: 'red', fontSize: '0.875rem', marginBottom: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '600' },
  input: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.65rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }
};

export default AdminLogin;
