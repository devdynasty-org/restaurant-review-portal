const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    name: 'John Owner',
    email: 'owner@restaurant.com',
    password: bcrypt.hashSync('owner123', 10),
    role: 'owner',
    restaurantIds: [1, 2]
  },
  {
    id: 2,
    name: 'Jane Customer',
    email: 'customer@example.com',
    password: bcrypt.hashSync('customer123', 10),
    role: 'customer',
    restaurantIds: []
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@restaurant.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    restaurantIds: []
  }
];

module.exports = users;