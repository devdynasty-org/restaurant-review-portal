// models/User.js
// Defines the User database model for our authentication system
// Every authenticated user (customer, owner, admin) lives in this table

'use strict';

const bcrypt = require('bcrypt');

// Salt rounds determine how expensive (slow) the hash is to compute
// Higher = more secure but slower
// 10 is the industry standard balance for 2026
const SALT_ROUNDS = 12;

module.exports = (sequelize, DataTypes) => {
  
  // Define the User model
  // sequelize.define() creates a table mapping
  const User = sequelize.define(
    'User',                    // model name (used in code: User.create, User.findAll)
    {
      // ── id ────────────────────────────────────────────────────────────
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ── email ─────────────────────────────────────────────────────────
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address'
          },
          notEmpty: {
            msg: 'Email cannot be empty'
          }
        }
      },

      // ── password_hash ─────────────────────────────────────────────────
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password cannot be empty'
          }
        }
      },

      // ── name ──────────────────────────────────────────────────────────
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name cannot be empty'
          },
          len: {
            args: [2, 100],
            msg: 'Name must be between 2 and 100 characters'
          }
        }
      },

      // ── role ──────────────────────────────────────────────────────────
      role: {
        type: DataTypes.ENUM('customer', 'owner', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
        validate: {
          isIn: {
            args: [['customer', 'owner', 'admin']],
            msg: 'Role must be customer, owner, or admin'
          }
        }
      },

      // ── is_active ─────────────────────────────────────────────────────
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // ── deleted_at ────────────────────────────────────────────────────
      // CR-001 (SCRUM-284): soft-delete timestamp. NULL = active; set = anonymised.
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      // ── email_verified ────────────────────────────────────────────────
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      // Table-level options
      tableName: 'user',
      modelName: 'User',
      
      // ── Lifecycle Hooks ─────────────────────────────────────────────
      // These run automatically at specific moments in a record's lifecycle
      // For passwords, we hash them BEFORE saving to the database
      hooks: {
        
        // Runs before User.create() inserts into DB
        beforeCreate: async (user) => {
          if (user.password_hash) {
            // The controller passes plain password as `password_hash`
            // We hash it here before MySQL ever sees it
            user.password_hash = await bcrypt.hash(user.password_hash, SALT_ROUNDS);
          }
        },
        
        // Runs before User.update() saves changes to DB
        // Only re-hashes if the password actually changed (avoid double-hashing)
        beforeUpdate: async (user) => {
          if (user.changed('password_hash')) {
            user.password_hash = await bcrypt.hash(user.password_hash, SALT_ROUNDS);
          }
        }
      }
    }
  );

  // ── Instance Method: comparePassword ──────────────────────────────────
  // Compares a plain-text password against this user's stored hash
  // Returns true if they match, false otherwise
  User.prototype.comparePassword = async function(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password_hash);
  };
  
  // ── Override toJSON method ──────────────────────────────────────────────
  // This method strips password_hash before sending user data in API responses
  // SECURITY: password hashes should never leave the server
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    return values;
  };

  return User;
};