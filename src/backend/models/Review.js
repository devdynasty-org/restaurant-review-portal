// models/Review.js
// Defines the Review database model (maps to restaurant_review table)
// A customer's multi-dimensional review of a restaurant
// Includes flag columns for the post-moderation workflow (Option B+)

'use strict';

module.exports = (sequelize, DataTypes) => {

  // Define the Review model
  const Review = sequelize.define(
    'Review',
    {
      // ── review_id ─────────────────────────────────────────────────────
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ── user_id ───────────────────────────────────────────────────────
      // Foreign key to user.id — the customer who wrote the review
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ── restaurant_id ─────────────────────────────────────────────────
      // Foreign key to restaurant.restaurant_id — the reviewed restaurant
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ── food_quality ──────────────────────────────────────────────────
      food_quality: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Food quality must be between 1 and 5' },
          max: { args: [5], msg: 'Food quality must be between 1 and 5' }
        }
      },

      // ── customer_service ──────────────────────────────────────────────
      customer_service: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Customer service must be between 1 and 5' },
          max: { args: [5], msg: 'Customer service must be between 1 and 5' }
        }
      },

      // ── ambiance ──────────────────────────────────────────────────────
      ambiance: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Ambiance must be between 1 and 5' },
          max: { args: [5], msg: 'Ambiance must be between 1 and 5' }
        }
      },

      // ── value_for_money ───────────────────────────────────────────────
      value_for_money: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Value for money must be between 1 and 5' },
          max: { args: [5], msg: 'Value for money must be between 1 and 5' }
        }
      },

      // ── comments ──────────────────────────────────────────────────────
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // ── status ────────────────────────────────────────────────────────
      // Post-moderation model: reviews are 'approved' (visible) by default.
      // An owner can flag → 'flagged'. An admin can remove → 'removed'
      // or restore → 'approved'.
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'removed', 'flagged'),
        allowNull: false,
        defaultValue: 'approved',
        validate: {
          isIn: {
            args: [['pending', 'approved', 'rejected', 'removed', 'flagged']],
            msg: 'Invalid review status'
          }
        }
      },

      // ── flag_reason ───────────────────────────────────────────────────
      // Set when an owner flags a review. Null otherwise.
      flag_reason: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      // ── flagged_by ────────────────────────────────────────────────────
      // The user (owner) who raised the flag. Null if not flagged.
      flagged_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      // Table-level options
      tableName: 'restaurant_review',
      modelName: 'Review',
    }
  );

  // ── Associations ──────────────────────────────────────────────────────
  Review.associate = (db) => {
    // A review belongs to the customer who wrote it
    Review.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'author',
    });

    // A review belongs to a restaurant
    Review.belongsTo(db.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });

    // The owner who flagged this review (optional)
    Review.belongsTo(db.User, {
      foreignKey: 'flagged_by',
      as: 'flagger',
    });
  };

  return Review;
};
