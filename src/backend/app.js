const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
const restaurantRoutes = require('./routes/restaurants');
const authRoutes = require('./routes/auth');
const ownerRoutes = require('./routes/owner');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
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
    secure: false,
    maxAge: 1000 * 60 * 60 * 2
  }
}));

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running successfully',
    team: 'DevDynasty',
    timestamp: new Date()
  });
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'This route does not exist'
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Test health:      http://localhost:${PORT}/api/health`);
  console.log(`All restaurants:  http://localhost:${PORT}/api/restaurants`);
  console.log(`One restaurant:   http://localhost:${PORT}/api/restaurants/1`);
});