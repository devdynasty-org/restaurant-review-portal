const db = require('../models');

async function calculateRating(restaurantId) {
  const reviews = await db.Review.findAll({
    where: { restaurant_id: restaurantId, status: 'approved' },
  });

  if (reviews.length === 0) {
    return { overall_rating: null, review_count: 0, category_ratings: null };
  }

  const avg = (key) => {
    const vals = reviews.map(r => r[key]);
    return parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1));
  };

  const category_ratings = {
    food:     avg('food_quality'),
    service:  avg('customer_service'),
    ambiance: avg('ambiance'),
    value:    avg('value_for_money'),
  };

  const all = Object.values(category_ratings);
  const overall_rating = parseFloat((all.reduce((s, v) => s + v, 0) / all.length).toFixed(1));

  return { overall_rating, review_count: reviews.length, category_ratings };
}

module.exports = { calculateRating };
