const express = require('express');
const router = express.Router();
const restaurants = require('../data/mockData');
const reviewStore = require('../data/mockReviews');
const { calculateRating } = require('../services/ratingService');

router.get('/', (req, res) => {
  const data = restaurants.map(r => ({ ...r, ...calculateRating(r.id) }));
  res.json({ success: true, count: data.length, data });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const restaurant = restaurants.find(r => r.id === id);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found' });
  }
  res.json({ success: true, data: { ...restaurant, ...calculateRating(id) } });
});

router.get('/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id);
  const reviews = reviewStore.getByRestaurant(id, 'approved')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ success: true, data: reviews });
});

router.post('/:id/reviews', (req, res) => {
  const restaurantId = parseInt(req.params.id);
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found' });
  }
  const { author, title, body, categoryRatings } = req.body;
  if (!author || !title || !body || !categoryRatings) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const review = reviewStore.add({
    restaurantId,
    status: 'pending',
    date: new Date().toISOString().slice(0, 10),
    author, title, body, categoryRatings,
  });
  res.status(201).json({ success: true, data: review });
});

module.exports = router;
