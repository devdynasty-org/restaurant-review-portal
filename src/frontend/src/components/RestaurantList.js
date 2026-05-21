// RestaurantList.js
// This component fetches restaurants from our backend and displays them
// A component in React is like a reusable building block of the UI

import React, { useState, useEffect } from 'react';

// axios is a tool that helps us make HTTP requests to our backend API
import axios from 'axios';


const RestaurantList = () => {

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
    axios.get('http://localhost:5000/api/restaurants')

      // .then runs if the request was successful
      .then(response => {
        setRestaurants(response.data.data);   // save the restaurant list
        setLoading(false);                     // stop showing loading message
      })

      // .catch runs if something went wrong
      .catch(err => {
        setError('Could not load restaurants. Is the backend server running?');
        setLoading(false);
      });

  }, []);


  // What to show while data is loading
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading restaurants...</p>
      </div>
    );
  }

  // What to show if there was an error
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
        <p>{error}</p>
      </div>
    );
  }

  // What to show when data is ready
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>

      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Restaurants ({restaurants.length} found)
      </h2>

      {/* Loop through each restaurant and display a card */}
      {restaurants.map(restaurant => (
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
              ⭐ {restaurant.rating}
            </span>
          </div>
          <p style={{ margin: '8px 0 4px', color: '#666' }}>🍽 {restaurant.cuisine}</p>
          <p style={{ margin: '4px 0', color: '#666' }}>📍 {restaurant.location}</p>
          <p style={{ margin: '10px 0 0', color: '#444' }}>{restaurant.description}</p>
        </div>
      ))}
    </div>
  );
};

// Make this component available for App.js to use
export default RestaurantList;