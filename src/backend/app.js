const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const restaurantRoutes = require('./routes/restaurants');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/restaurants', restaurantRoutes);

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Test health:      http://localhost:${PORT}/api/health`);
  console.log(`All restaurants:  http://localhost:${PORT}/api/restaurants`);
  console.log(`One restaurant:   http://localhost:${PORT}/api/restaurants/1`);
});
