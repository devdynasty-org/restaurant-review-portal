import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AccessDenied from './pages/owner/AccessDenied';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGuard from './components/admin/AdminGuard';

const PublicLayout = () => (
  <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f5f6fa' }}>
    <header style={{
      background: '#2c3e50',
      color: 'white',
      padding: '24px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
        🍴 Restaurant Review Portal
      </h1>
      <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
        DevDynasty — CB018298
      </p>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/access-denied" element={<AccessDenied />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;