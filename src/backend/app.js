// ── Imports ──────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const db = require('./models');
const restaurantRoutes = require('./routes/restaurants');
const authRoutes = require('./routes/auth');

// ... dotenv config, app setup, middleware ...
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',   // your React frontend URL
  credentials: true,                  // allow cookies in cross-origin requests
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/auth', authRoutes);


// ── Health check route ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running successfully',
    team: 'DevDynasty',
    timestamp: new Date()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'This route does not exist'
  });
});

// Test database connection then start the server
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📍 Health check:     http://localhost:${PORT}/api/health`);
      console.log(`📍 Restaurants:      http://localhost:${PORT}/api/restaurants`);
    });
  })
  .catch(error => {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);  // exit if DB connection fails — fail fast
  });
