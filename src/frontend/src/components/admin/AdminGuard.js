import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminGuard = () => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/stats', { withCredentials: true })
      .then(() => setChecking(false))
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          window.location.href = '/admin/login';
        } else {
          setChecking(false);
        }
      });
  }, []);

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#666' }}>Verifying session...</p>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminGuard;
