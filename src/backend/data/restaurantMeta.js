// UI-only fields that aren't in the database schema.
// Keyed by restaurant_id. Merged into API responses at the route layer.
const meta = {
  1: {
    priceLevel: 2,
    accent: '#c2410c',
    tags: ['Vegetarian friendly', 'Family', 'Dinner'],
    blurb: 'Authentic Indian cooking — slow-simmered curries, tandoor breads, and a courtyard scented with cardamom.',
  },
  2: {
    priceLevel: 3,
    accent: '#0e7490',
    tags: ['Sushi', 'Date night', 'Counter seating'],
    blurb: "A tiny sushi counter where the day's catch decides the menu. Sit at the bar and let the chef lead.",
  },
  3: {
    priceLevel: 3,
    accent: '#b91c1c',
    tags: ['Wood-fired', 'Wine list', 'Group dining'],
    blurb: 'Wood-fired pizzas with a 48-hour dough and handmade pasta rolled each morning. Bring friends.',
  },
  4: {
    priceLevel: 2,
    accent: '#a16207',
    tags: ['Dim sum', 'Lunch', 'Lazy Susan'],
    blurb: 'Traditional dim sum carts and Cantonese classics, served family-style on big round tables.',
  },
  5: {
    priceLevel: 2,
    accent: '#9a3412',
    tags: ['Burgers', 'BBQ', 'Casual'],
    blurb: 'Premium burgers and low-and-slow BBQ. Newly opened — be among the first to leave a review.',
  },
};

module.exports = meta;
