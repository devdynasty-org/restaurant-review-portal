'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {

    // ── 1. Owner user ───────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('Owner@1234', 12);

    await queryInterface.bulkInsert('user', [{
      name:           'Dev Owner',
      email:          'owner@devdynasty.com',
      password_hash:  passwordHash,
      role:           'owner',
      is_active:      1,
      email_verified: 1,
      created_at:     new Date(),
      updated_at:     new Date(),
    }], {});

    const [[ownerRow]] = await queryInterface.sequelize.query(
      `SELECT id FROM \`user\` WHERE email = 'owner@devdynasty.com' LIMIT 1`
    );
    const ownerId = ownerRow.id;

    // ── 2. Restaurants ──────────────────────────────────────────────────────
    await queryInterface.bulkInsert('restaurant', [
      { restaurant_id: 1, owner_id: ownerId, name: 'The Spice Garden', address: 'Colombo 03', cuisine_type: 'Indian',    description: 'Authentic Indian cuisine',           overall_rating: 0.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 2, owner_id: ownerId, name: 'Tokyo Bites',      address: 'Colombo 07', cuisine_type: 'Japanese',  description: 'Fresh sushi and Japanese dishes',     overall_rating: 0.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 3, owner_id: ownerId, name: 'La Piazza',        address: 'Colombo 05', cuisine_type: 'Italian',   description: 'Wood-fired pizzas and handmade pasta', overall_rating: 0.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 4, owner_id: ownerId, name: 'Dragon Palace',    address: 'Colombo 04', cuisine_type: 'Chinese',   description: 'Traditional Chinese dim sum',         overall_rating: 0.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 5, owner_id: ownerId, name: 'The Grill House',  address: 'Colombo 02', cuisine_type: 'American',  description: 'Premium burgers and BBQ',             overall_rating: 0.00, status: 'active', created_at: new Date(), updated_at: new Date() },
    ], {});

    // ── 3. Menu items ───────────────────────────────────────────────────────
    await queryInterface.bulkInsert('menu_item', [
      // The Spice Garden (1)
      { restaurant_id: 1, name: 'Samosa Chaat',    description: 'Crushed samosa, chickpeas, tamarind, mint yoghurt', category: 'To Start',        price: 780,  is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 1, name: 'Tandoori Prawns', description: 'Charred tiger prawns, ajwain, lime',               category: 'To Start',        price: 1650, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 1, name: 'Butter Chicken',  description: 'Tomato-fenugreek gravy, smoked butter, fresh cream', category: 'Mains',          price: 1980, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 1, name: 'Paneer Lababdar', description: 'Cottage cheese, charred peppers, cashew gravy',    category: 'Mains',           price: 1620, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 1, name: 'Lamb Rogan Josh', description: 'Kashmiri chillies, slow-braised shoulder',         category: 'Mains',           price: 2350, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 1, name: 'Garlic Naan',     description: 'Clay-oven, toasted garlic, coriander butter',      category: 'Breads & Rice',   price: 420,  is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 1, name: 'Saffron Pulao',   description: 'Basmati, whole spices, fried onion',               category: 'Breads & Rice',   price: 680,  is_active: 1, created_at: new Date(), updated_at: new Date() },

      // Tokyo Bites (2)
      { restaurant_id: 2, name: 'Salmon Nigiri',      description: 'Two pieces, aged shari, fresh wasabi',          category: 'Nigiri & Sashimi', price: 920,  is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 2, name: "Chef's Sashimi Set", description: 'Nine seasonal cuts, daikon, shiso',             category: 'Nigiri & Sashimi', price: 3200, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 2, name: 'Spicy Tuna Roll',    description: 'Akami, chilli mayo, tempura crunch',            category: 'Rolls',            price: 1450, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 2, name: 'Dragon Roll',        description: 'Eel, avocado, sweet soy glaze',                 category: 'Rolls',            price: 1980, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 2, name: 'Chicken Karaage',    description: 'Marinated thigh, kewpie, lemon',                category: 'Warm',             price: 1280, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 2, name: 'Miso Ramen',         description: 'Pork broth, corn, soft egg, scallion',          category: 'Warm',             price: 1750, is_active: 1, created_at: new Date(), updated_at: new Date() },

      // La Piazza (3)
      { restaurant_id: 3, name: 'Burrata & Tomato',  description: 'Heirloom tomato, basil oil, sourdough',          category: 'Antipasti', price: 1480, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 3, name: 'Arancini',           description: 'Saffron risotto, mozzarella, pomodoro',          category: 'Antipasti', price: 1120, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 3, name: 'Margherita D.O.P.',  description: 'San Marzano, fior di latte, basil',              category: 'Pizza',     price: 1680, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 3, name: 'Diavola',            description: 'Spicy salami, chilli honey, fior di latte',      category: 'Pizza',     price: 1980, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 3, name: 'Cacio e Pepe',       description: 'Tonnarelli, pecorino, black pepper',             category: 'Pasta',     price: 1750, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 3, name: 'Tagliatelle Ragu',   description: '6-hour beef & pork, parmigiano',                 category: 'Pasta',     price: 2150, is_active: 1, created_at: new Date(), updated_at: new Date() },

      // Dragon Palace (4)
      { restaurant_id: 4, name: 'Har Gow',             description: 'Crystal prawn dumplings, four pieces',          category: 'Dim Sum',        price: 880,  is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 4, name: 'Char Siu Bao',        description: 'Steamed bun, honey-glazed pork',                category: 'Dim Sum',        price: 720,  is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 4, name: 'Kung Pao Chicken',    description: 'Dried chilli, peanuts, Sichuan pepper',         category: 'Wok',            price: 1450, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 4, name: 'Salt & Pepper Squid', description: 'Crisp squid, chilli, spring onion',             category: 'Wok',            price: 1620, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 4, name: 'Yangzhou Fried Rice', description: 'Prawn, char siu, egg, peas',                    category: 'Rice & Noodles', price: 1180, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 4, name: 'Dan Dan Noodles',     description: 'Sesame, chilli oil, minced pork',               category: 'Rice & Noodles', price: 1280, is_active: 1, created_at: new Date(), updated_at: new Date() },

      // The Grill House (5)
      { restaurant_id: 5, name: 'The Classic',          description: 'Aged beef, cheddar, house pickles, brioche', category: 'Burgers',      price: 1680, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 5, name: 'Smokehouse',           description: 'Pulled brisket, slaw, bourbon BBQ',         category: 'Burgers',      price: 1980, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 5, name: 'Baby Back Ribs',       description: 'Half rack, dry rub, maple glaze',           category: 'From the Pit', price: 2650, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 5, name: 'Buttermilk Chicken',   description: 'Crisp thigh, hot honey, ranch',             category: 'From the Pit', price: 1750, is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 5, name: 'Truffle Fries',        description: 'Parmesan, herbs, garlic aioli',             category: 'Sides',        price: 880,  is_active: 1, created_at: new Date(), updated_at: new Date() },
      { restaurant_id: 5, name: 'Mac & Cheese',         description: 'Three-cheese, toasted crumb',               category: 'Sides',        price: 920,  is_active: 1, created_at: new Date(), updated_at: new Date() },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_item', { restaurant_id: [1, 2, 3, 4, 5] }, {});
    await queryInterface.bulkDelete('restaurant', { restaurant_id: [1, 2, 3, 4, 5] }, {});
    await queryInterface.bulkDelete('user', { email: 'owner@devdynasty.com' }, {});
  },
};
