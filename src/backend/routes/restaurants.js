const express = require('express');
const router = express.Router();
const db = require('../models');
const { Restaurant, Review, MenuItem, User } = db;
const authenticate = require('../middleware/auth');
const { calculateRating } = require('../services/ratingService');
const restaurantMeta = require('../data/restaurantMeta');

// Groups flat MenuItem rows into { section, items[] } shape the frontend expects
function formatMenu(menuItems = []) {
  const sections = {};
  menuItems.forEach(item => {
    const section = item.category || 'Other';
    if (!sections[section]) sections[section] = [];
    sections[section].push({
      name:  item.name,
      desc:  item.description,
      price: parseFloat(item.price),
    });
  });
  return Object.entries(sections).map(([section, items]) => ({ section, items }));
}

// Maps a DB Restaurant instance to the shape the frontend expects
async function formatRestaurant(r, includeMenu = false) {
  const meta   = restaurantMeta[r.restaurant_id] || {};
  const rating = await calculateRating(r.restaurant_id);
  return {
    id:           r.restaurant_id,
    name:         r.name,
    cuisine:      r.cuisine_type,
    location:     r.address,
    description:  r.description,
    ...meta,
    menu: includeMenu ? formatMenu(r.menuItems) : undefined,
    ...rating,
  };
}

// Recalculates and saves the cached overall_rating on the restaurant row
async function recalculateRating(restaurantId) {
  const { overall_rating } = await calculateRating(restaurantId);
  await Restaurant.update(
    { overall_rating: overall_rating ?? 0 },
    { where: { restaurant_id: restaurantId } }
  );
}

// GET /api/restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
    const data = await Promise.all(restaurants.map(r => formatRestaurant(r, false)));
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error listing restaurants:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

// GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const restaurant = await Restaurant.findByPk(id, {
      include: [{ model: MenuItem, as: 'menuItems', where: { is_active: true }, required: false }],
    });

    if (!restaurant || restaurant.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({ success: true, data: await formatRestaurant(restaurant, true) });
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurant' });
  }
});

// GET /api/restaurants/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reviews = await Review.findAll({
      where: { restaurant_id: id, status: 'approved' },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });

    const data = reviews.map(r => ({
      id:           r.review_id,
      restaurantId: r.restaurant_id,
      status:       r.status,
      date:         r.created_at.toISOString().slice(0, 10),
      author:       r.author ? r.author.name : 'Anonymous',
      body:         r.comments,
      categoryRatings: {
        food:     r.food_quality,
        service:  r.customer_service,
        ambiance: r.ambiance,
        value:    r.value_for_money,
      },
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// POST /api/restaurants/:id/reviews  — requires login
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant || restaurant.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { food_quality, customer_service, ambiance, value_for_money, comments } = req.body;

    if (food_quality == null || customer_service == null || ambiance == null || value_for_money == null) {
      return res.status(400).json({ success: false, message: 'All four rating dimensions are required' });
    }

    const review = await Review.create({
      user_id:          req.user.id,
      restaurant_id:    restaurantId,
      food_quality,
      customer_service,
      ambiance,
      value_for_money,
      comments:         comments || null,
      status:           'approved',
    });

    await recalculateRating(restaurantId);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: err.errors.map(e => e.message).join(', ') });
    }
    console.error('Error creating review:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

module.exports = router;
