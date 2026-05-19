const express = require('express');
const router = express.Router();
const { ownerLogin, ownerLogout } = require('../controllers/authController');

router.post('/owner/login', ownerLogin);
router.post('/owner/logout', ownerLogout);

module.exports = router;