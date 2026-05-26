const express = require('express');
const router = express.Router();
const { ownerLogin, ownerLogout, adminLogin, adminLogout } = require('../controllers/authController');

router.post('/owner/login', ownerLogin);
router.post('/owner/logout', ownerLogout);
router.post('/admin/login', adminLogin);
router.post('/admin/logout', adminLogout);

module.exports = router;