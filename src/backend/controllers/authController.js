const bcrypt = require('bcryptjs');
const users = require('../data/mockUsers');
const { logAdminAction } = require('../data/adminActionLog');

const ownerLogin = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      redirect: '/access-denied'
    });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    restaurantIds: user.restaurantIds
  };

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: req.session.user
  });
};

const ownerLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true, message: 'Logged out' });
  });
};

const adminLogin = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      redirect: '/access-denied'
    });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    restaurantIds: user.restaurantIds
  };

  logAdminAction(user.id, 'ADMIN_LOGIN', { email: user.email });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: req.session.user
  });
};

const adminLogout = (req, res) => {
  const userId = req.session.user?.id;
  logAdminAction(userId, 'ADMIN_LOGOUT');

  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true, message: 'Logged out' });
  });
};

module.exports = { ownerLogin, ownerLogout, adminLogin, adminLogout };