// RestaurantList.js
// US-10: Restaurant Summary Cards
// US-06: Search by Restaurant Name
// US-07: Search by Food Item
// US-37: Overall Rating Score

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RatingBadge = ({ overall_rating, review_count }) => {
  if (review_count === 0) {
    return (
      <span style={{
        background: '#95a5a6',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px'
      }}>
        Not yet rated
      </span>
    );
  }
  return (
    <span style={{
      background: '#27ae60',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px'
    }}>
      ★ {overall_rating} ({review_count} {review_count === 1 ? 'review' : 'reviews'})
    </span>
  );
};

const RestaurantList = () => {
  const [nameSearch, setNameSearch] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/restaurants')
      .then(response => {
        setRestaurants(response.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load restaurants. Please try again.');
        setLoading(false);
      });
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesName = restaurant.name.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesFood = foodSearch === '' ||
      restaurant.cuisine.toLowerCase().includes(foodSearch.toLowerCase());
    return matchesName && matchesFood;
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>

      {/* Search bars - US-06 and US-07 */}
      <div style={{ marginBottom: '24px' }}>
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

      {loading && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Loading restaurants...</p>
      )}

      {error && (
        <p style={{ textAlign: 'center', color: '#e74c3c', padding: '40px' }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            Restaurants ({filteredRestaurants.length} found)
          </h2>

          {filteredRestaurants.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No restaurants found matching your search.
            </p>
          )}

          {/* US-10 + US-37: Restaurant Summary Cards with rating */}
          {filteredRestaurants.map(restaurant => (
            <Link
              key={restaurant.id}
              to={`/restaurants/${restaurant.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>{restaurant.name}</h3>
                  <RatingBadge
                    overall_rating={restaurant.overall_rating}
                    review_count={restaurant.review_count}
                  />
                </div>
                <div>
                  <p style={{ margin: '8px 0 4px', color: '#666' }}>🍴 {restaurant.cuisine}</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>📍 {restaurant.location}</p>
                  <p style={{ margin: '10px 0 0', color: '#444' }}>{restaurant.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </>
      )}

    </div>
  );
};

export default RestaurantList;
