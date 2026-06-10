const isOwnerAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorised. Please log in.',
      redirect: '/admin/login'
    });
  }

  if (req.session.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied.',
      redirect: '/access-denied'
    });
  }

  next();
};

module.exports = { isOwnerAuthenticated };