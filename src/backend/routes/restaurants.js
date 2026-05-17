const express = require('express');
const router = express.Router();
const restaurants = require('../data/mockData');

router.get('/', (req, res) => {
  res.json({
    success: true,
    count: restaurants.length,
    data: restaurants
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
    data: restaurant
  });
});

module.exports = router;
