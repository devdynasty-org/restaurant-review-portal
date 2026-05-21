const express = require('express');
const router = express.Router();
const { isOwnerAuthenticated } = require('../middleware/authMiddleware');
const restaurants = require('../data/mockData');

router.use(isOwnerAuthenticated);

router.get('/dashboard', (req, res) => {
  const { restaurantIds } = req.session.user;

  const ownerRestaurants = restaurants.filter(r => restaurantIds.includes(r.id));

  return res.status(200).json({
    success: true,
    data: ownerRestaurants
  });
});

module.exports = router;