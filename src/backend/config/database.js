// config/database.js
// This file configures Sequelize's database connection
// We use environment variables so the same code works in dev/qa/production
// Just by changing the .env file — no code changes needed

require('dotenv').config();

const config = {
  // Development environment configuration
  development: {
    username: process.env.DB_USER,        // from .env
    password: process.env.DB_PASSWORD,    // from .env
    database: process.env.DB_NAME,        // from .env
    host: process.env.DB_HOST,            // from .env
    port: process.env.DB_PORT,            // from .env
    dialect: process.env.DB_DIALECT,      // 'mysql'
    logging: console.log,                  // show SQL queries in console (helps debugging)
    define: {
      timestamps: true,                    // auto-add created_at, updated_at
      underscored: true,                   // use snake_case in DB (created_at not createdAt)
    }
  },

  // Test environment — used when running automated tests
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',  // separate test DB
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,                         // no SQL noise during tests
  },

  // Production environment — used on Azure
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
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