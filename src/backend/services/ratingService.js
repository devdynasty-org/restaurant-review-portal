const reviewStore = require('../data/mockReviews');

const CATEGORIES = ['food', 'service', 'ambiance', 'value'];

function calculateRating(restaurantId) {
  const approved = reviewStore.getByRestaurant(restaurantId, 'approved');

  if (approved.length === 0) {
    return { overall_rating: null, review_count: 0, category_ratings: null };
  }

  const allValues = approved.flatMap(r => Object.values(r.categoryRatings));
  const overall = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;

  const category_ratings = {};
  CATEGORIES.forEach(key => {
    const vals = approved.map(r => r.categoryRatings[key]);
    category_ratings[key] = parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1));
  });

  return {
    overall_rating: parseFloat(overall.toFixed(1)),
    review_count: approved.length,
    category_ratings,
  };
}

module.exports = { calculateRating };
