// routes/owner.js
// Owner-only routes: manage own restaurants, menus, and flag reviews.
// Rebuilt from session/mock onto JWT auth + real Sequelize models.
//
// Moderation model (Option B+, post-moderation):
//   - Customer reviews are auto-'approved' (visible immediately)
//   - Owners FLAG inappropriate reviews (status -> 'flagged' + reason)
//   - Admins later approve the flag (remove) or dismiss it (restore)
//   - Owners do NOT approve or delete reviews — that is the admin's role

const express = require('express');
const router = express.Router();

// Real database models
const db = require('../models');
const { Restaurant, MenuItem, Review, User } = db;
const { calculateRating } = require('../services/ratingService');
const restaurantMeta = require('../data/restaurantMeta');

// Auth: must be logged in (authenticate) AND be an owner (requireRole)
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Every route in this file requires a logged-in owner
router.use(authenticate);
router.use(requireRole('owner'));

// Formats a DB restaurant to the shape the owner dashboard expects
async function formatOwnerRestaurant(r) {
  const meta   = restaurantMeta[r.restaurant_id] || {};
  const rating = await calculateRating(r.restaurant_id);
  return {
    id:           r.restaurant_id,
    name:         r.name,
    cuisine:      r.cuisine_type,
    location:     r.address,
    description:  r.description,
    ...meta,
    ...rating,
  };
}

// ── GET /dashboard ────────────────────────────────────────────────────────────
// Alias of /restaurants — returns the owner's restaurants with ratings
router.get('/dashboard', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { owner_id: req.user.id },
      order: [['name', 'ASC']],
    });
    const data = await Promise.all(restaurants.map(formatOwnerRestaurant));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching owner dashboard:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
});

// ── GET /reviews/pending ──────────────────────────────────────────────────────
// Pending reviews across all restaurants owned by the logged-in owner
router.get('/reviews/pending', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { owner_id: req.user.id },
      attributes: ['restaurant_id'],
    });
    const restaurantIds = restaurants.map(r => r.restaurant_id);

    const reviews = await Review.findAll({
      where: { restaurant_id: restaurantIds, status: 'pending' },
      include: [{ model: User, as: 'author', attributes: ['name'] }],
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

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching pending reviews:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending reviews' });
  }
});

// ── PUT /reviews/:id/approve ──────────────────────────────────────────────────
router.put('/reviews/:id/approve', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const review = await Review.findByPk(reviewId, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });

    if (!review || !review.restaurant || review.restaurant.owner_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = 'approved';
    await review.save();

    return res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error('Error approving review:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve review' });
  }
});

// ── DELETE /reviews/:id ───────────────────────────────────────────────────────
router.delete('/reviews/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const review = await Review.findByPk(reviewId, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });

    if (!review || !review.restaurant || review.restaurant.owner_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = 'rejected';
    await review.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error rejecting review:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject review' });
  }
});

// ── GET /restaurants ─────────────────────────────────────────────────────────
// List the restaurants owned by the logged-in owner
router.get('/restaurants', async (req, res) => {
  try {
    const data = await Restaurant.findAll({
      where: { owner_id: req.user.id },
      include: [{ model: MenuItem, as: 'menuItems' }],
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching owner restaurants:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

// ── POST /restaurants ────────────────────────────────────────────────────────
// Create a new restaurant owned by the logged-in owner
router.post('/restaurants', async (req, res) => {
  try {
    const { name, address, cuisine_type, description } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name and address are required',
      });
    }

    const restaurant = await Restaurant.create({
      owner_id: req.user.id,           // tie to the logged-in owner
      name,
      address,
      cuisine_type: cuisine_type || null,
      description: description || null,
      status: 'active',
    });

    return res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    console.error('Error creating restaurant:', err);
    return res.status(500).json({ success: false, message: 'Failed to create restaurant' });
  }
});

// ── POST /restaurants/:id/menu ───────────────────────────────────────────────
// Add a menu item to one of the owner's restaurants
router.post('/restaurants/:id/menu', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);

    // Ownership check: the restaurant must belong to this owner
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant || restaurant.owner_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { name, description, category, price } = req.body;
    if (!name || price == null) {
      return res.status(400).json({
        success: false,
        message: 'Menu item name and price are required',
      });
    }

    const item = await MenuItem.create({
      restaurant_id: restaurantId,
      name,
      description: description || null,
      category: category || null,
      price,
      is_active: true,
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    console.error('Error adding menu item:', err);
    return res.status(500).json({ success: false, message: 'Failed to add menu item' });
  }
});

// ── PUT /restaurants/:id/menu/:itemId ────────────────────────────────────────
// Edit a menu item on one of the owner's restaurants
router.put('/restaurants/:id/menu/:itemId', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const itemId = parseInt(req.params.itemId);

    // Ownership check
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant || restaurant.owner_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // The item must belong to this restaurant
    const item = await MenuItem.findByPk(itemId);
    if (!item || item.restaurant_id !== restaurantId) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Apply only the fields provided
    const { name, description, category, price, is_active } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (category !== undefined) item.category = category;
    if (price !== undefined) item.price = price;
    if (is_active !== undefined) item.is_active = is_active;

    await item.save();

    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', '),
      });
    }
    console.error('Error updating menu item:', err);
    return res.status(500).json({ success: false, message: 'Failed to update menu item' });
  }
});

// ── PUT /reviews/:id/flag ────────────────────────────────────────────────────
// Flag a review on one of the owner's restaurants as inappropriate.
// Sets status -> 'flagged', records the reason and who flagged it.
// This pushes the review into the admin moderation queue.
router.put('/reviews/:id/flag', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { flag_reason } = req.body;

    if (!flag_reason) {
      return res.status(400).json({
        success: false,
        message: 'A flag reason is required',
      });
    }

    // Load the review + its restaurant to verify ownership
    const review = await Review.findByPk(reviewId, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Ownership check: the review must be on a restaurant this owner owns
    if (!review.restaurant || review.restaurant.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only flag reviews on your own restaurants',
      });
    }

    // Flag it — moves into the admin queue
    review.status = 'flagged';
    review.flag_reason = flag_reason;
    review.flagged_by = req.user.id;
    await review.save();

    return res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error('Error flagging review:', err);
    return res.status(500).json({ success: false, message: 'Failed to flag review' });
  }
});

module.exports = router;
