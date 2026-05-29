const express = require('express');
const router = express.Router();
const restaurants = require('../data/mockData');
const { calculateRating } = require('../services/ratingService');

router.get('/', (req, res) => {
  const data = restaurants.map(r => ({ ...r, ...calculateRating(r.id) }));
  res.json({
    success: true,
    count: data.length,
    data
  });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const restaurant = restaurants.find(r => r.id === id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }
  res.json({
    success: true,
    data: { ...restaurant, ...calculateRating(id) }
  });
});

module.exports = router;
