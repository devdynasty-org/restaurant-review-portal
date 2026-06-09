// routes/admin.js
// Admin-only routes: the review moderation queue.
// Rebuilt for the post-moderation (Option B+) model.
//
// Flow:
//   - Owners flag reviews → status becomes 'flagged' (enters this queue)
//   - Admin reviews the queue and either:
//       * REMOVE  → status 'removed'  (review hidden from public)
//       * DISMISS → status 'approved' (flag rejected, review restored)
//   - Either way, the flag metadata is cleared on dismiss.

const express = require('express');
const router = express.Router();

// Real database models
const db = require('../models');
const { Review, Restaurant, User } = db;

// Auth: must be logged in AND be an admin
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Every route in this file requires a logged-in admin
router.use(authenticate);
router.use(requireRole('admin'));

// ── GET /reviews/flagged ─────────────────────────────────────────────────────
// The moderation queue: all reviews currently flagged by owners.
// Includes the review author, the restaurant, and who flagged it — so the
// admin has full context to make a decision.
router.get('/reviews/flagged', async (req, res) => {
  try {
    const flagged = await Review.findAll({
      where: { status: 'flagged' },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'name'] },
        { model: User, as: 'flagger', attributes: ['id', 'name'] },
      ],
      order: [['updated_at', 'DESC']],
    });
    return res.status(200).json({ success: true, count: flagged.length, data: flagged });
  } catch (err) {
    console.error('Error fetching flagged reviews:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch flagged reviews' });
  }
});

// ── PUT /reviews/:id/remove ──────────────────────────────────────────────────
// Admin upholds the flag: the review is removed (hidden from public).
// Status -> 'removed'. The review row is kept (soft delete) for audit/history.
router.put('/reviews/:id/remove', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = 'removed';
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review removed',
      data: review,
    });
  } catch (err) {
    console.error('Error removing review:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove review' });
  }
});

// ── PUT /reviews/:id/dismiss ─────────────────────────────────────────────────
// Admin rejects the flag: the review is restored to public view.
// Status -> 'approved', and the flag metadata is cleared.
router.put('/reviews/:id/dismiss', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = 'approved';
    review.flag_reason = null;
    review.flagged_by = null;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Flag dismissed, review restored',
      data: review,
    });
  } catch (err) {
    console.error('Error dismissing flag:', err);
    return res.status(500).json({ success: false, message: 'Failed to dismiss flag' });
  }
});

module.exports = router;
