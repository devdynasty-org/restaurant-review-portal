// routes/restaurants.js
// Public restaurant browsing + review submission
// Refactored from mock data onto real Sequelize models

const express = require('express');
const router = express.Router();

// Real database models (loaded via models/index.js)
const db = require('../models');
const { Restaurant, Review, MenuItem, User } = db;

// JWT auth middleware — populates req.user for protected routes
const authenticate = require('../middleware/auth');

// ── Helper: recalculate a restaurant's cached overall_rating ───────────────
// Post-moderation model: only 'approved' reviews count toward the average.
// Averages the four rating dimensions across all approved reviews, then
// writes the single cached value back to restaurant.overall_rating.
async function recalculateRating(restaurantId) {
  const reviews = await Review.findAll({
    where: { restaurant_id: restaurantId, status: 'approved' },
    attributes: ['food_quality', 'customer_service', 'ambiance', 'value_for_money'],
  });

  let newRating = 0;
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, r) => {
      const reviewAvg =
        (r.food_quality + r.customer_service + r.ambiance + r.value_for_money) / 4;
      return sum + reviewAvg;
    }, 0);
    newRating = (total / reviews.length).toFixed(2);
  }

  await Restaurant.update(
    { overall_rating: newRating },
    { where: { restaurant_id: restaurantId } }
  );

  return newRating;
}

// ── GET / ──────────────────────────────────────────────────────────────────
// List all active restaurants (uses the cached overall_rating column)
router.get('/', async (req, res) => {
  try {
    const data = await Restaurant.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error listing restaurants:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

// ── GET /:id ─────────────────────────────────────────────────────────────────
// One restaurant with its menu items
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const restaurant = await Restaurant.findByPk(id, {
      include: [{ model: MenuItem, as: 'menuItems' }],
    });

    if (!restaurant || restaurant.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({ success: true, data: restaurant });
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurant' });
  }
});

// ── GET /:id/reviews ─────────────────────────────────────────────────────────
// Approved reviews for a restaurant (newest first), with author name
router.get('/:id/reviews', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reviews = await Review.findAll({
      where: { restaurant_id: id, status: 'approved' },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// ── POST /:id/reviews ────────────────────────────────────────────────────────
// Submit a review — REQUIRES LOGIN (authenticate middleware)
// The author is the logged-in user (req.user.id), not a free-text name.
// Post-moderation: the review is 'approved' (visible) immediately.
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);

    // Confirm the restaurant exists and is active
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant || restaurant.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Pull the four rating dimensions + optional comment from the body
    const { food_quality, customer_service, ambiance, value_for_money, comments } = req.body;

    // Basic presence check (the model also validates 1-5 ranges)
    if (
      food_quality == null ||
      customer_service == null ||
      ambiance == null ||
      value_for_money == null
    ) {
      return res.status(400).json({
        success: false,
        message: 'All four rating dimensions are required',
      });
    }

    // Create the review tied to the logged-in user
    const review = await Review.create({
      user_id: req.user.id,
      restaurant_id: restaurantId,
      food_quality,
      customer_service,
      ambiance,
      value_for_money,
      comments: comments || null,
      status: 'approved',   // post-moderation: visible immediately
    });

    // Refresh the restaurant's cached overall_rating
    await recalculateRating(restaurantId);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    // Sequelize validation errors (e.g. rating out of 1-5 range)
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    console.error('Error creating review:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

module.exports = router;
