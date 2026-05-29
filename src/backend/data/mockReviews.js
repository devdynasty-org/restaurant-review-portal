const reviews = [
  // Restaurant 1 - The Spice Garden (2 approved reviews)
  {
    id: 1,
    restaurantId: 1,
    status: 'approved',
    categoryRatings: { food: 5, service: 4, ambiance: 4, value: 4 }
  },
  {
    id: 2,
    restaurantId: 1,
    status: 'approved',
    categoryRatings: { food: 4, service: 5, ambiance: 3, value: 4 }
  },

  // Restaurant 2 - Tokyo Bites (2 approved reviews)
  {
    id: 3,
    restaurantId: 2,
    status: 'approved',
    categoryRatings: { food: 5, service: 5, ambiance: 5, value: 4 }
  },
  {
    id: 4,
    restaurantId: 2,
    status: 'approved',
    categoryRatings: { food: 4, service: 4, ambiance: 5, value: 3 }
  },

  // Restaurant 3 - La Piazza (1 approved review)
  {
    id: 5,
    restaurantId: 3,
    status: 'approved',
    categoryRatings: { food: 5, service: 5, ambiance: 5, value: 5 }
  },

  // Restaurant 4 - Dragon Palace (2 approved reviews)
  {
    id: 6,
    restaurantId: 4,
    status: 'approved',
    categoryRatings: { food: 3, service: 4, ambiance: 3, value: 4 }
  },
  {
    id: 7,
    restaurantId: 4,
    status: 'approved',
    categoryRatings: { food: 4, service: 3, ambiance: 4, value: 3 }
  },

  // Restaurant 5 - The Grill House (pending only — tests 'Not yet rated')
  {
    id: 8,
    restaurantId: 5,
    status: 'pending',
    categoryRatings: { food: 4, service: 4, ambiance: 4, value: 4 }
  }
];

module.exports = reviews;
