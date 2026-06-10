// models/MenuItem.js
// Defines the MenuItem database model
// A menu item (dish) belongs to a restaurant

'use strict';

module.exports = (sequelize, DataTypes) => {

  // Define the MenuItem model
  const MenuItem = sequelize.define(
    'MenuItem',
    {
      // ── item_id ───────────────────────────────────────────────────────
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ── restaurant_id ─────────────────────────────────────────────────
      // Foreign key to restaurant.restaurant_id — the parent restaurant
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ── name ──────────────────────────────────────────────────────────
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Menu item name cannot be empty'
          }
        }
      },

      // ── description ───────────────────────────────────────────────────
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // ── category ──────────────────────────────────────────────────────
      category: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      // ── price ─────────────────────────────────────────────────────────
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: 'Price cannot be negative'
          }
        }
      },

      // ── is_active ─────────────────────────────────────────────────────
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      // Table-level options
      tableName: 'menu_item',
      modelName: 'MenuItem',
    }
  );

  // ── Associations ──────────────────────────────────────────────────────
  MenuItem.associate = (db) => {
    // A menu item belongs to one restaurant
    MenuItem.belongsTo(db.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
    });
  };

  return MenuItem;
};
