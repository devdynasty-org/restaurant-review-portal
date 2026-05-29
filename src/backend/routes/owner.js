const express = require('express');
const router = express.Router();
const { isOwnerAuthenticated } = require('../middleware/authMiddleware');
const restaurants = require('../data/mockData');
const reviewStore = require('../data/mockReviews');
const { calculateRating } = require('../services/ratingService');

router.use(isOwnerAuthenticated);

router.get('/dashboard', (req, res) => {
  const { restaurantIds } = req.session.user;
  const ownerRestaurants = restaurants
    .filter(r => restaurantIds.includes(r.id))
    .map(r => ({ ...r, ...calculateRating(r.id) }));
  return res.status(200).json({ success: true, data: ownerRestaurants });
});

router.get('/restaurants', (req, res) => {
  const { restaurantIds } = req.session.user;
  const ownerRestaurants = restaurants
    .filter(r => restaurantIds.includes(r.id))
    .map(r => ({ ...r, ...calculateRating(r.id) }));
  return res.status(200).json({ success: true, data: ownerRestaurants });
});

router.get('/reviews/pending', (req, res) => {
  const { restaurantIds } = req.session.user;
  const pending = reviewStore.getAll()
    .filter(r => restaurantIds.includes(r.restaurantId) && r.status === 'pending')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(200).json({ success: true, data: pending });
});

router.put('/reviews/:id/approve', (req, res) => {
  const { restaurantIds } = req.session.user;
  const id = parseInt(req.params.id);
  const review = reviewStore.getById(id);
  if (!review || !restaurantIds.includes(review.restaurantId)) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }
  const updated = reviewStore.approve(id);
  return res.status(200).json({ success: true, data: updated });
});

router.delete('/reviews/:id', (req, res) => {
  const { restaurantIds } = req.session.user;
  const id = parseInt(req.params.id);
  const review = reviewStore.getById(id);
  if (!review || !restaurantIds.includes(review.restaurantId)) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }
  reviewStore.remove(id);
  return res.status(200).json({ success: true });
});

module.exports = router;
