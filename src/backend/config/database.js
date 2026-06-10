// config/database.js
// This file configures Sequelize's database connection
// We use environment variables so the same code works in dev/qa/production
// Just by changing the .env file — no code changes needed

require('dotenv').config();

const config = {
  // Development environment configuration
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_review_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log,                  // show SQL queries in console (helps debugging)
    define: {
      timestamps: true,                    // auto-add created_at, updated_at
      underscored: true,                   // use snake_case in DB (created_at not createdAt)
    }
  },

  // Production environment — used on Azure
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_review_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,                         // never log in production
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,                              // max 10 connections
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Export the config object
// Sequelize CLI also needs this in CommonJS module.exports format
module.exports = config;