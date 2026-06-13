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
const { Review, Restaurant, User, AuditLog } = db;

// ── Audit helper ─────────────────────────────────────────────────────────────
async function writeAudit(req, { action, targetType, targetId, targetDescription, meta, detail }) {
  try {
    await AuditLog.create({
      actor_id:           req.user.id,
      actor_name:         req.user.name,
      actor_role:         'admin',
      action,
      target_type:        targetType || null,
      target_id:          targetId   || null,
      target_description: targetDescription || null,
      meta:               meta   || null,
      detail:             detail || null,
    });
  } catch (err) {
    // Audit failure must never break the main action — log and continue.
    console.error('Audit write failed:', err.message);
  }
}

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
    const review = await Review.findByPk(reviewId, {
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['name'] },
        { model: User,       as: 'author',     attributes: ['name'] },
      ],
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = 'removed';
    await review.save();

    // Write immutable audit entry
    const snippet = review.comments ? `"${review.comments.slice(0, 60)}${review.comments.length > 60 ? '…' : ''}"` : `#${reviewId}`;
    await writeAudit(req, {
      action:            'remove',
      targetType:        'review',
      targetId:          reviewId,
      targetDescription: `Review ${snippet}`,
      meta:              review.restaurant?.name || '',
      detail:            `Admin upheld owner flag — review removed from public listing.`,
    });

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
    const review = await Review.findByPk(reviewId, {
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['name'] },
        { model: User,       as: 'author',     attributes: ['name'] },
      ],
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = 'approved';
    review.flag_reason = null;
    review.flagged_by = null;
    await review.save();

    // Write immutable audit entry
    const snippet = review.comments ? `"${review.comments.slice(0, 60)}${review.comments.length > 60 ? '…' : ''}"` : `#${reviewId}`;
    await writeAudit(req, {
      action:            'decline',
      targetType:        'review',
      targetId:          reviewId,
      targetDescription: `Owner flag on review ${snippet}`,
      meta:              review.restaurant?.name || '',
      detail:            `Admin declined flag — review meets content guidelines and stays published.`,
    });

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

// ── GET /audit-log ────────────────────────────────────────────────────────────
// Full chronological audit trail. Optional ?action= filter.
router.get('/audit-log', async (req, res) => {
  try {
    const { action } = req.query;
    const where = action && action !== 'all' ? { action } : {};
    const logs = await AuditLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 200,
    });
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('Error fetching audit log:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit log' });
  }
});

module.exports = router;
