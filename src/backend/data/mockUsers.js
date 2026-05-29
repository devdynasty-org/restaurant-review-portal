const bcrypt = require('bcrypt');

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
  }
];

module.exports = users;