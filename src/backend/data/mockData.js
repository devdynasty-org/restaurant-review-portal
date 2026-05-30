const restaurants = [
  {
    id: 1,
    name: 'The Spice Garden',
    cuisine: 'Indian',
    location: 'Colombo 03',
    description: 'Authentic Indian cuisine',
    priceLevel: 2,
    accent: '#c2410c',
    tags: ['Vegetarian friendly', 'Family', 'Dinner'],
    blurb: 'Authentic Indian cooking — slow-simmered curries, tandoor breads, and a courtyard scented with cardamom.',
    menu: [
      { section: 'To Start', items: [
        { name: 'Samosa Chaat', desc: 'Crushed samosa, chickpeas, tamarind, mint yoghurt', price: 780 },
        { name: 'Tandoori Prawns', desc: 'Charred tiger prawns, ajwain, lime', price: 1650 },
      ]},
      { section: 'Mains', items: [
        { name: 'Butter Chicken', desc: 'Tomato-fenugreek gravy, smoked butter, fresh cream', price: 1980 },
        { name: 'Paneer Lababdar', desc: 'Cottage cheese, charred peppers, cashew gravy', price: 1620 },
        { name: 'Lamb Rogan Josh', desc: 'Kashmiri chillies, slow-braised shoulder', price: 2350 },
      ]},
      { section: 'Breads & Rice', items: [
        { name: 'Garlic Naan', desc: 'Clay-oven, toasted garlic, coriander butter', price: 420 },
        { name: 'Saffron Pulao', desc: 'Basmati, whole spices, fried onion', price: 680 },
      ]},
    ],
  },
  {
    id: 2,
    name: 'Tokyo Bites',
    cuisine: 'Japanese',
    location: 'Colombo 07',
    description: 'Fresh sushi and Japanese dishes',
    priceLevel: 3,
    accent: '#0e7490',
    tags: ['Sushi', 'Date night', 'Counter seating'],
    blurb: 'A tiny sushi counter where the day\'s catch decides the menu. Sit at the bar and let the chef lead.',
    menu: [
      { section: 'Nigiri & Sashimi', items: [
        { name: 'Salmon Nigiri', desc: 'Two pieces, aged shari, fresh wasabi', price: 920 },
        { name: 'Chef\'s Sashimi Set', desc: 'Nine seasonal cuts, daikon, shiso', price: 3200 },
      ]},
      { section: 'Rolls', items: [
        { name: 'Spicy Tuna Roll', desc: 'Akami, chilli mayo, tempura crunch', price: 1450 },
        { name: 'Dragon Roll', desc: 'Eel, avocado, sweet soy glaze', price: 1980 },
      ]},
      { section: 'Warm', items: [
        { name: 'Chicken Karaage', desc: 'Marinated thigh, kewpie, lemon', price: 1280 },
        { name: 'Miso Ramen', desc: 'Pork broth, corn, soft egg, scallion', price: 1750 },
      ]},
    ],
  },
  {
    id: 3,
    name: 'La Piazza',
    cuisine: 'Italian',
    location: 'Colombo 05',
    description: 'Wood-fired pizzas and handmade pasta',
    priceLevel: 3,
    accent: '#b91c1c',
    tags: ['Wood-fired', 'Wine list', 'Group dining'],
    blurb: 'Wood-fired pizzas with a 48-hour dough and handmade pasta rolled each morning. Bring friends.',
    menu: [
      { section: 'Antipasti', items: [
        { name: 'Burrata & Tomato', desc: 'Heirloom tomato, basil oil, sourdough', price: 1480 },
        { name: 'Arancini', desc: 'Saffron risotto, mozzarella, pomodoro', price: 1120 },
      ]},
      { section: 'Pizza', items: [
        { name: 'Margherita D.O.P.', desc: 'San Marzano, fior di latte, basil', price: 1680 },
        { name: 'Diavola', desc: 'Spicy salami, chilli honey, fior di latte', price: 1980 },
      ]},
      { section: 'Pasta', items: [
        { name: 'Cacio e Pepe', desc: 'Tonnarelli, pecorino, black pepper', price: 1750 },
        { name: 'Tagliatelle Ragu', desc: '6-hour beef & pork, parmigiano', price: 2150 },
      ]},
    ],
  },
  {
    id: 4,
    name: 'Dragon Palace',
    cuisine: 'Chinese',
    location: 'Colombo 04',
    description: 'Traditional Chinese dim sum',
    priceLevel: 2,
    accent: '#a16207',
    tags: ['Dim sum', 'Lunch', 'Lazy Susan'],
    blurb: 'Traditional dim sum carts and Cantonese classics, served family-style on big round tables.',
    menu: [
      { section: 'Dim Sum', items: [
        { name: 'Har Gow', desc: 'Crystal prawn dumplings, four pieces', price: 880 },
        { name: 'Char Siu Bao', desc: 'Steamed bun, honey-glazed pork', price: 720 },
      ]},
      { section: 'Wok', items: [
        { name: 'Kung Pao Chicken', desc: 'Dried chilli, peanuts, Sichuan pepper', price: 1450 },
        { name: 'Salt & Pepper Squid', desc: 'Crisp squid, chilli, spring onion', price: 1620 },
      ]},
      { section: 'Rice & Noodles', items: [
        { name: 'Yangzhou Fried Rice', desc: 'Prawn, char siu, egg, peas', price: 1180 },
        { name: 'Dan Dan Noodles', desc: 'Sesame, chilli oil, minced pork', price: 1280 },
      ]},
    ],
  },
  {
    id: 5,
    name: 'The Grill House',
    cuisine: 'American',
    location: 'Colombo 02',
    description: 'Premium burgers and BBQ',
    priceLevel: 2,
    accent: '#9a3412',
    tags: ['Burgers', 'BBQ', 'Casual'],
    blurb: 'Premium burgers and low-and-slow BBQ. Newly opened — be among the first to leave a review.',
    menu: [
      { section: 'Burgers', items: [
        { name: 'The Classic', desc: 'Aged beef, cheddar, house pickles, brioche', price: 1680 },
        { name: 'Smokehouse', desc: 'Pulled brisket, slaw, bourbon BBQ', price: 1980 },
      ]},
      { section: 'From the Pit', items: [
        { name: 'Baby Back Ribs', desc: 'Half rack, dry rub, maple glaze', price: 2650 },
        { name: 'Buttermilk Chicken', desc: 'Crisp thigh, hot honey, ranch', price: 1750 },
      ]},
      { section: 'Sides', items: [
        { name: 'Truffle Fries', desc: 'Parmesan, herbs, garlic aioli', price: 880 },
        { name: 'Mac & Cheese', desc: 'Three-cheese, toasted crumb', price: 920 },
      ]},
    ],
  },
];

module.exports = restaurants;
