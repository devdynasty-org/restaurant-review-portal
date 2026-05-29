const reviews = require('../data/mockReviews');

function calculateRating(restaurantId) {
  const approved = reviews.filter(
    r => r.restaurantId === restaurantId && r.status === 'approved'
  );

  if (approved.length === 0) {
    return { overall_rating: null, review_count: 0 };
  }

  const allValues = approved.flatMap(r => Object.values(r.categoryRatings));
  const mean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;

  return {
    overall_rating: parseFloat(mean.toFixed(1)),
    review_count: approved.length
  };
}

module.exports = { calculateRating };
