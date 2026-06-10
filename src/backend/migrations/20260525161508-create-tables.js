// migrations/20260525161508-create-users.js
// Creates the 'users' table in MySQL
// 
// up()   → CREATE TABLE users (runs when you migrate forward)
// down() → DROP TABLE users   (runs when you rollback)
//
// IMPORTANT: This must match the User model fields exactly
// Model defines structure in code, migration creates it in MySQL

'use strict';

module.exports = {
  
  // ── UP ─────────────────────────────────────────────────────────────
  // Runs when applying the migration forward
  // Creates the users table with all columns, constraints, and indexes
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      
      // ── id ─────────────────────────────────────────────────────────
      // Primary key — uniquely identifies each user
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      
      // ── email ──────────────────────────────────────────────────────
      // The login identifier — must be unique across all users
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      
      // ── password_hash ──────────────────────────────────────────────
      // bcrypt hash of the password — never plain text
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      
      // ── name ───────────────────────────────────────────────────────
      // User's display name
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      
      // ── role ───────────────────────────────────────────────────────
      // Determines what areas of the system the user can access
      role: {
        type: Sequelize.ENUM('customer', 'owner', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
      },
      
      // ── is_active ──────────────────────────────────────────────────
      // Lets admin suspend accounts without deleting them
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      
      // ── email_verified ─────────────────────────────────────────────
      // Tracks whether user has clicked the verification link
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      
      // ── created_at ─────────────────────────────────────────────────
      // Automatically set when record is created
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      
      // ── updated_at ─────────────────────────────────────────────────
      // Automatically updated whenever the record changes
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    
    // ── Add Index on email ────────────────────────────────────────────
    // This makes login lookups (WHERE email = '...') extremely fast
    // Without an index, MySQL scans every row — slow with millions of users
    await queryInterface.addIndex('user', ['email'], {
      name: 'user_email_index',
      unique: true,
    });
  },

  // ── DOWN ───────────────────────────────────────────────────────────
  // Runs when rolling back the migration
  // Drops the entire users table (deletes all data!)
  // 
  // WARNING: This is destructive — only run in development
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  },
};