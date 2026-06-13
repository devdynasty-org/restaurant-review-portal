// Unit tests for the rating aggregation service.
// Uses the seeded mock review data, so expected values are deterministic.
const { calculateRating } = require('../../src/backend/services/ratingService');

describe('calculateRating', () => {
  test('aggregates only approved reviews for a restaurant', () => {
    // Restaurant 1 has reviews 1 & 2 approved (review 9 is pending and ignored).
    //   food:    (5 + 4) / 2 = 4.5
    //   service: (4 + 5) / 2 = 4.5
    //   ambiance:(4 + 3) / 2 = 3.5
    //   value:   (4 + 4) / 2 = 4.0
    //   overall: 33 / 8       = 4.1 (rounded)
    const result = calculateRating(1);

    expect(result.review_count).toBe(2);
    expect(result.overall_rating).toBe(4.1);
    expect(result.category_ratings).toEqual({
      food: 4.5,
      service: 4.5,
      ambiance: 3.5,
      value: 4.0,
    });
  });

  test('returns a null rating when a restaurant has no approved reviews', () => {
    // Restaurant 5 (Grill House) only has a pending review.
    const result = calculateRating(5);

    expect(result.review_count).toBe(0);
    expect(result.overall_rating).toBeNull();
    expect(result.category_ratings).toBeNull();
  });

  test('returns a null rating for an unknown restaurant id', () => {
    const result = calculateRating(9999);

    expect(result.review_count).toBe(0);
    expect(result.overall_rating).toBeNull();
  });
});