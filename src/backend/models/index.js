// models/index.js
// This is the central initialization point for all Sequelize models
// It does 3 things:
//   1. Sets up the database connection
//   2. Loads all model files in this folder automatically
//   3. Exports everything as a single object

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Load the environment-appropriate config
const env = process.env.NODE_ENV || 'development';
const config = require('../../database/config/database')[env];

// Create the Sequelize connection instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Container that will hold all our models
const db = {};

// Read the current folder, find all model files, and load them
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&           // not hidden files
      file !== 'index.js' &&                // not THIS file
      file.slice(-3) === '.js'              // only .js files
    );
  })
  .forEach(file => {
    // Load each model and register it
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Run any model associations (relationships between models)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Attach Sequelize utilities to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;