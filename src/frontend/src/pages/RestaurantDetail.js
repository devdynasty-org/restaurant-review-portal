// RestaurantDetail.js
// US-37: Display overall rating on restaurant detail page

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/restaurants/${id}`)
      .then(response => {
        setRestaurant(response.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Restaurant not found.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>
        <p style={{ color: '#e74c3c' }}>{error || 'Restaurant not found.'}</p>
        <Link to="/" style={{ color: '#2c3e50' }}>← Back to restaurants</Link>
      </div>
    );
  }

  const { name, cuisine, location, description, overall_rating, review_count } = restaurant;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>

      <Link to="/" style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}>
        ← Back to restaurants
      </Link>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '30px',
        marginTop: '20px',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{name}</h2>
        <p style={{ margin: '4px 0', color: '#666' }}>🍴 {cuisine}</p>
        <p style={{ margin: '4px 0', color: '#666' }}>📍 {location}</p>
        <p style={{ margin: '16px 0', color: '#444' }}>{description}</p>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        {/* US-37: Rating section */}
        {review_count > 0 ? (
          <div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
              ★ {overall_rating} / 5
            </div>
            <p style={{ margin: '6px 0 0', color: '#666', fontSize: '14px' }}>
              Based on {review_count} {review_count === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '20px', color: '#95a5a6', fontWeight: '500' }}>
              Not yet rated
            </div>
            <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '13px' }}>
              No approved reviews yet.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default RestaurantDetail;
