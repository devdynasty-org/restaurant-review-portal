// App.js
// This is the root component of our React application
// Every other component lives inside this one
// Think of it as the main page that holds everything together

import React from 'react';

// Import our RestaurantList component so we can use it here
import RestaurantList from './components/RestaurantList';
import AuthPage from './components/AuthPage';


function App() {
  return (

    // The outer div wraps the entire page
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f5f6fa' }}>

      {/* Header section - appears at the top of every page */}
      <header style={{
        background: '#2c3e50',
        color: 'white',
        padding: '24px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
          🍴 Restaurant Review Portal
        </h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
          DevDynasty — CB018298
        </p>
      </header>

      {/* Main content area - this is where RestaurantList renders */}
      <main>
              <AuthPage />
              <RestaurantList />
      </main>

    </div>
  );
}

// Make App available to index.js which renders it into the browser
export default App;