// models/Restaurant.js
// Defines the Restaurant database model
// A restaurant is owned by a user with role 'owner'

'use strict';

module.exports = (sequelize, DataTypes) => {

  // Define the Restaurant model
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      // ── restaurant_id ─────────────────────────────────────────────────
      restaurant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ── owner_id ──────────────────────────────────────────────────────
      // Foreign key to users.id — the owner of this restaurant
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ── name ──────────────────────────────────────────────────────────
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Restaurant name cannot be empty'
          },
          len: {
            args: [2, 150],
            msg: 'Restaurant name must be between 2 and 150 characters'
          }
        }
      },

      // ── address ───────────────────────────────────────────────────────
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Address cannot be empty'
          }
        }
      },

      // ── cuisine_type ──────────────────────────────────────────────────
      cuisine_type: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      // ── description ───────────────────────────────────────────────────
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // ── overall_rating ────────────────────────────────────────────────
      // Cached aggregate rating, recalculated when reviews change
      overall_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00,
      },

      // ── status ────────────────────────────────────────────────────────
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'deleted'),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'suspended', 'deleted']],
            msg: 'Status must be active, suspended, or deleted'
          }
        }
      },
    },
    {
      // Table-level options
      tableName: 'restaurant',
      modelName: 'Restaurant',
    }
  );

  // ── Associations ──────────────────────────────────────────────────────
  // Called automatically by models/index.js after all models are loaded
  Restaurant.associate = (db) => {
    // A restaurant belongs to one owner (a user)
    Restaurant.belongsTo(db.User, {
      foreignKey: 'owner_id',
      as: 'owner',
    });

    // A restaurant has many menu items
    Restaurant.hasMany(db.MenuItem, {
      foreignKey: 'restaurant_id',
      as: 'menuItems',
    });

    // A restaurant has many reviews
    Restaurant.hasMany(db.Review, {
      foreignKey: 'restaurant_id',
      as: 'reviews',
    });
  };

  return Restaurant;
};
