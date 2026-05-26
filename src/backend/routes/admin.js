const express = require('express');
const router = express.Router();
const { isAdminAuthenticated } = require('../middleware/authMiddleware');
const { actionLog, logAdminAction } = require('../data/adminActionLog');
const users = require('../data/mockUsers');

router.use(isAdminAuthenticated);

router.get('/stats', (req, res) => {
  logAdminAction(req.session.user.id, 'VIEW_STATS');

  return res.status(200).json({
    success: true,
    data: {
      pendingReviews: 3,
      newUsers: users.length,
      flaggedContent: 1
    }
  });
});

router.get('/logs', (req, res) => {
  logAdminAction(req.session.user.id, 'VIEW_LOGS');

  return res.status(200).json({
    success: true,
    data: actionLog
  });
});

module.exports = router;
