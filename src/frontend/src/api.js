// src/api.js
// Single shared axios instance for the whole app.
//
// Why this exists:
//   - withCredentials: true makes the browser send the httpOnly auth cookie
//     on EVERY request. Without it, logged-in actions fail with 401.
//   - baseURL '/api' means we call api.get('/restaurants') instead of
//     axios.get('/api/restaurants') everywhere. The proxy in package.json
//     forwards /api to the backend at http://localhost:8000.
//
// Every component imports THIS instead of raw axios, so the cookie config
// can never be forgotten on a per-file basis again.

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
