// RestaurantList.js
// US-10: Restaurant Summary Cards
// US-06: Search by Restaurant Name  
// US-07: Search by Food Item

import React, { useState } from 'react';

// Dummy restaurant data - will be replaced with real API when backend is ready
const DUMMY_RESTAURANTS = [
    {
        id: 1,
        name: 'Pizza Palace',
        cuisine: 'Italian',
        location: 'Colombo 03',
        description: 'Authentic wood-fired pizzas and classic Italian dishes in a cozy atmosphere.',
        rating: 4.5,
        foodItems: ['pizza', 'pasta', 'lasagna']
    },
    {
        id: 2,
        name: 'Sushi Zen',
        cuisine: 'Japanese',
        location: 'Colombo 07',
        description: 'Fresh sushi and traditional Japanese cuisine prepared by expert chefs.',
        rating: 4.8,
        foodItems: ['sushi', 'ramen', 'tempura', 'sashimi']
    },
    {
        id: 3,
        name: 'Burger Hub',
        cuisine: 'American',
        location: 'Colombo 05',
        description: 'Juicy gourmet burgers with a wide variety of toppings and sides.',
        rating: 4.2,
        foodItems: ['burger', 'fries', 'milkshake', 'wings']
    },
    {
        id: 4,
        name: 'Spice Garden',
        cuisine: 'Sri Lankan',
        location: 'Colombo 01',
        description: 'Traditional Sri Lankan rice and curry with authentic spices and flavors.',
        rating: 4.6,
        foodItems: ['rice', 'curry', 'kottu', 'hoppers']
    },
    {
        id: 5,
        name: 'Taco Fiesta',
        cuisine: 'Mexican',
        location: 'Colombo 06',
        description: 'Vibrant Mexican street food with fresh ingredients and bold flavors.',
        rating: 4.3,
        foodItems: ['tacos', 'burrito', 'nachos', 'guacamole']
    },
    {
        id: 6,
        name: 'The Noodle House',
        cuisine: 'Chinese',
        location: 'Colombo 04',
        description: 'Handmade noodles and classic Chinese dishes cooked to perfection.',
        rating: 4.1,
        foodItems: ['noodles', 'dim sum', 'dumplings']
    }
];

const RestaurantList = () => {

    // Search states - tracks what the user types in each search box
    const [nameSearch, setNameSearch] = useState('');
    const [foodSearch, setFoodSearch] = useState('');
  // useState lets us store data that can change over time
  // When state changes, React automatically re-renders the component

  // restaurants - stores the list we get from the backend (starts as empty array)
  const [restaurants, setRestaurants] = useState([]);

  // loading - tracks whether we are still waiting for data (starts as true)
  const [loading, setLoading] = useState(true);

  // error - stores any error message if something goes wrong (starts as null)
  const [error, setError] = useState(null);


  // useEffect runs code after the component first appears on screen
  // The empty array [] at the end means "run this only once when page loads"
  useEffect(() => {

    // Make a GET request to our backend API
    axios.get('/api/restaurants')

      // .then runs if the request was successful
      .then(response => {
        setRestaurants(response.data.data);   // save the restaurant list
        setLoading(false);                     // stop showing loading message
      })

    // Filter restaurants based on both search inputs
    const filteredRestaurants = DUMMY_RESTAURANTS.filter(restaurant => {
        const matchesName = restaurant.name.toLowerCase().includes(nameSearch.toLowerCase());
        const matchesFood = foodSearch === '' ||
            restaurant.foodItems.some(item => item.toLowerCase().includes(foodSearch.toLowerCase())) ||
            restaurant.cuisine.toLowerCase().includes(foodSearch.toLowerCase());
        return matchesName && matchesFood;
    });

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>

            {/* Search bars - US-06 and US-07 */}
            <div style={{ marginBottom: '24px' }}>

                {/* US-06: Search by restaurant name */}
                <input
                    type="text"
                    placeholder="🔍 Search by restaurant name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        boxSizing: 'border-box'
                    }}
                />

                {/* US-07: Search by food item or cuisine */}
                <input
                    type="text"
                    placeholder="🍽️ Search by food item or cuisine..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Results count */}
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
                Restaurants ({filteredRestaurants.length} found)
            </h2>

            {/* Message when no results match the search */}
            {filteredRestaurants.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    No restaurants found matching your search.
                </p>
            )}

            {/* US-10: Restaurant Summary Cards - one card per restaurant */}
            {filteredRestaurants.map(restaurant => (
                <div
                    key={restaurant.id}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '10px',
                        padding: '20px',
                        marginBottom: '16px',
                        background: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>{restaurant.name}</h3>
                        <span style={{
                            background: '#27ae60',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '14px'
                        }}>
                            ★ {restaurant.rating}
                        </span>
                    </div>
                    <div>
                        <p style={{ margin: '8px 0 4px', color: '#666' }}>🍴 {restaurant.cuisine}</p>
                        <p style={{ margin: '4px 0', color: '#666' }}>📍 {restaurant.location}</p>
                        <p style={{ margin: '10px 0 0', color: '#444' }}>{restaurant.description}</p>
                    </div>
                </div>
            ))}

        </div>
    );
};

// Make this component available for App.js to use
export default RestaurantList;