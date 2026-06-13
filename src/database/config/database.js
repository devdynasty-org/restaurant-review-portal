// config/database.js
// This file configures Sequelize's database connection
// We use environment variables so the same code works in dev/qa/production
// Just by changing the .env file — no code changes needed
//
// NOTE: dotenv is intentionally NOT loaded here. The app entry point
// (app.js) calls dotenv.config() before requiring any other module,
// so process.env is already populated by the time this file is read.
// This keeps the config file dependency-free so it can live outside
// the backend package without needing access to backend's node_modules.

const config = {
  // Development environment configuration
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_review_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log,                  // show SQL queries in console (helps debugging)
    define: {
      timestamps: true,                    // auto-add created_at, updated_at
      underscored: true,                   // use snake_case in DB (created_at not createdAt)
    }
  },

  // Test environment — used when running automated tests
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: (process.env.DB_NAME || 'restaurant_review_dev') + '_test',  // separate test DB
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,                         // no SQL noise during tests
  },

  // Production environment — used on Azure
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_review_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
};

// Export the config object
// Sequelize CLI also needs this in CommonJS module.exports format
module.exports = config;