# 🍴 Restaurant Review Portal

A full-stack web application where customers can browse restaurants, explore menus with prices, and leave reviews. Built by **Team DevDynasty**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Team](#team)

---

## Overview

The Restaurant Review Portal is a full-stack web app that allows customers to:

- Browse a list of restaurants with ratings, cuisine type, and location
- View detailed menus with prices
- Leave and read reviews for restaurants
- Restaurant owners can log in to a protected dashboard to manage their listings

The backend is served as a REST API (Node.js + Express) and the frontend is a React single-page application. In production, Express serves the built React app as static files, making the whole project deployable as a single Azure App Service.

---

## Tech Stack

| Layer | Technology |
|------------|--------------------------------------|
| Frontend | React 19, React Router v7, Axios |
| Backend | Node.js, Express 5 |
| Auth | express-session, bcryptjs |
| Database | MySQL (schema in `src/database/`) |
| Hosting | Microsoft Azure App Service |
| CI/CD | GitHub Actions |

---

## Project Structure

```
restaurant-review-portal/
├── .github/
│   └── workflows/
│       └── deploy.yaml        # CI/CD pipeline → Azure App Service
├── docs/
│   └── DevDynasty_VersionControlSystem&Policy.pdf
├── src/
│   ├── backend/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── data/
│   │   │   ├── mockData.js    # Seed restaurant data
│   │   │   └── mockUsers.js   # Seed user accounts
│   │   ├── middleware/        # Auth middleware (owner-only routes)
│   │   ├── routes/
│   │   │   ├── auth.js        # POST /api/auth/login, /logout
│   │   │   ├── owner.js       # GET  /api/owner/dashboard (protected)
│   │   │   └── restaurants.js # GET  /api/restaurants, /:id
│   │   ├── app.js             # Express app entry point
│   │   └── package.json
│   ├── database/              # MySQL schema & migrations (upcoming)
│   └── frontend/
│       ├── public/
│       └── src/
│           ├── components/
│           │   └── RestaurantList.js
│           ├── pages/owner/
│           │   ├── OwnerLogin.js
│           │   ├── OwnerDashboard.js
│           │   └── AccessDenied.js
│           ├── App.js
│           └── index.js
├── tests/                     # Test suite (upcoming)
├── .gitignore
└── package.json               # Root scripts for Azure startup
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/devdynasty-org/restaurant-review-portal.git
cd restaurant-review-portal
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `src/backend/` (see [Environment Variables](#environment-variables) below).

### 4. Run in development mode

Open two terminals:

```bash
# Terminal 1 — start the backend (runs on http://localhost:5000)
cd src/backend
npm run dev

# Terminal 2 — start the frontend (runs on http://localhost:3000)
cd src/frontend
npm start
```

The React dev server proxies all `/api/*` requests to `localhost:5000`, so both servers work together seamlessly.

### 5. Verify the backend is healthy

```
GET http://localhost:5000/api/health
```

---

## Environment Variables

Create `src/backend/.env` with the following keys:

```env
PORT=5000
SESSION_SECRET=your-secret-here
NODE_ENV=development
```

| Variable | Description | Default |
|------------------|----------------------------------------|------------------------|
| `PORT` | Port the Express server listens on | `5000` |
| `SESSION_SECRET` | Secret used to sign session cookies | `devdynasty-secret` |
| `NODE_ENV` | `development` or `production` | `development` |

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## API Reference

All endpoints are prefixed with `/api`.

### Restaurants

| Method | Endpoint | Description |
|--------|------------------------|-------------------------------|
| GET | `/api/restaurants` | List all restaurants |
| GET | `/api/restaurants/:id` | Get a single restaurant by ID |

### Auth (Owner)

| Method | Endpoint | Description |
|--------|---------------------|-------------------------------|
| POST | `/api/auth/login` | Log in as a restaurant owner |
| POST | `/api/auth/logout` | End the current session |

### Owner Dashboard *(protected — owner role required)*

| Method | Endpoint | Description |
|--------|----------------------|-------------------------------|
| GET | `/api/owner/dashboard` | Owner-only dashboard data |

### Health Check

| Method | Endpoint | Description |
|--------|--------------|----------------------|
| GET | `/api/health` | Server status check |

---

## Deployment

The project deploys automatically to **Azure App Service** whenever code is pushed to the `main` branch, via the GitHub Actions workflow at `.github/workflows/deploy.yaml`.

**Pipeline steps:**

1. Check out the repository
2. Set up Node.js 22
3. Install backend dependencies (`src/backend`)
4. Install frontend dependencies (`src/frontend`)
5. Build the React app (`src/frontend/build/`)
6. Deploy the full repository to Azure Web App

**Required GitHub Secrets:**

| Secret | Description |
|-------------------------------|--------------------------------------|
| `AZURE_WEBAPP_NAME` | Name of the Azure App Service |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Publish profile XML from Azure portal |

In production, Express serves the compiled React build as static files, so only one App Service is needed.

---

## Team

**DevDynasty**

| Contributor | GitHub |
|-------------|--------|
| Lilan Mihiranga | [@LilanMihiranga](https://github.com/LilanMihiranga) |
| Udara Kotuwella | [@Ucko2](https://github.com/Ucko2) |
| Pasan Sugathapala | [@Pasansuga](https://github.com/Pasansuga) |

---

## Branch Strategy

| Branch | Purpose |
|-----------|----------------------------------------------|
| `main` | Stable, production-ready code |
| `develop` | Active development and feature integration |

Feature branches are merged into `develop` via pull requests and then promoted to `main` for release. See `docs/DevDynasty_VersionControlSystem&Policy.pdf` for the full branching and commit policy.
