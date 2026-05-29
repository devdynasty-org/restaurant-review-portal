// ── Imports ──────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const db = require('./models');
const restaurantRoutes = require('./routes/restaurants');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const restaurantRoutes = require('./routes/restaurants');
const authRoutes = require('./routes/auth');
const ownerRoutes = require('./routes/owner');

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
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'devdynasty-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2
  }
}));

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/owner', ownerRoutes);
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

const frontendBuild = path.join(__dirname, '../frontend/build');

if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));

  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'This route does not exist'
    });
  });
}

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
