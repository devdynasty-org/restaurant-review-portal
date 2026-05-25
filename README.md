# Restaurant Review Portal

A full-stack web application for restaurant reviews, ratings, and discovery.

**Team:** DevDynasty  
**Project Code:** CB018298  
**Module:** COMP70066 — Software Engineering Principles and Practices

---

## Team Members

| Member | Role |
|---|---|
| Udara (M1) | Backend Lead |
| Lilan (M2) | CI/CD and DevOps |
| Pasan (M3) | Frontend Lead |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| ORM | Sequelize |
| Database | MySQL 8 |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt (salt rounds = 12) |
| Deployment | Azure App Service |

---

## Project Structure

restaurant-review-portal/
├── docs/                      # Project documentation
├── src/
│   ├── backend/               # Node.js + Express API
│   │   ├── config/            # Database & app configuration
│   │   ├── controllers/       # Request handlers (business logic)
│   │   ├── middleware/        # Validation, auth, error handling
│   │   ├── migrations/        # Sequelize schema migrations
│   │   ├── models/            # Sequelize models (database schema)
│   │   ├── routes/            # Express route definitions
│   │   ├── utils/             # Helper utilities (JWT, etc.)
│   │   └── app.js             # Entry point
│   ├── database/              # Database setup scripts
│   └── frontend/              # React.js app
└── tests/                     # Automated tests

---

## Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **MySQL** 8.x running locally
- **Git** with SSH configured for GitHub

### Setup

1. **Clone the repository:**
```bash
   git clone git@github.com:devdynasty-org/restaurant-review-portal.git
   cd restaurant-review-portal
```

2. **Create the database:**
```bash
   mysql -u root -p
```
```sql
   CREATE DATABASE restaurant_review_dev;
   CREATE USER 'devdynasty'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
   GRANT ALL PRIVILEGES ON restaurant_review_dev.* TO 'devdynasty'@'localhost';
   FLUSH PRIVILEGES;
```

3. **Install backend dependencies:**
```bash
   cd src/backend
   npm install
```

4. **Set up environment variables:**
   Create a `.env` file in `src/backend/` with:

   PORT=8000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=restaurant_review_dev
DB_USER=devdynasty
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_DIALECT=mysql
JWT_SECRET=GENERATE_YOUR_OWN_SECRET
JWT_EXPIRES_IN=24h

Generate a JWT secret with:
```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. **Run database migrations:**
```bash
   npx sequelize-cli db:migrate
```

6. **Start the backend:**
```bash
   npm run dev
```

   Server runs at: http://localhost:8000

---

## Branching Strategy

main         ← Production-ready code only (protected)
└── develop  ← Integration branch — all features merge here first
└── feature/RRP-USXX-description  ← Daily work branches

**Rules:**
- Never push directly to `main` or `develop`
- All work happens on `feature/...` branches
- Merge to `develop` via Pull Request with code review
- After Stage 3 testing, develop merges to main

---

## API Documentation

Base URL: `http://localhost:8000/api`

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [
    { "field": "fieldName", "message": "Specific error" }
  ]
}
```

---

### Authentication Endpoints

#### `POST /api/auth/register`

Create a new customer account. Returns a JWT token for immediate authentication.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass@2026",
  "name": "Full Name"
}
```

**Validation rules:**

| Field | Rules |
|---|---|
| `email` | Required, valid email format, unique in database |
| `password` | Required, min 8 chars, 1 uppercase, 1 number, 1 special char |
| `name` | Required, 2-100 characters |

**Success response (`201 Created`):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Full Name",
      "role": "customer",
      "is_active": true,
      "email_verified": false,
      "createdAt": "2026-05-25T17:23:32.131Z",
      "updatedAt": "2026-05-25T17:23:32.131Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error responses:**

| Scenario | HTTP Status | Response |
|---|---|---|
| Invalid email format | 400 | `{ field: "email", message: "Must be a valid email address" }` |
| Email already registered | 400 | `{ field: "email", message: "Email is already registered" }` |
| Password too short | 400 | `{ field: "password", message: "Password must be at least 8 characters" }` |
| Password missing uppercase | 400 | `{ field: "password", message: "Password must contain at least one uppercase letter" }` |
| Password missing number | 400 | `{ field: "password", message: "Password must contain at least one number" }` |
| Password missing special char | 400 | `{ field: "password", message: "Password must contain at least one special character" }` |
| Name too short or missing | 400 | `{ field: "name", message: "Name must be between 2 and 100 characters" }` |
| Server error | 500 | `{ message: "An error occurred while creating your account" }` |

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "AlicePass@2026",
    "name": "Alice Johnson"
  }'
```

---

### Utility Endpoints

#### `GET /api/health`

Health check — verify the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running successfully",
  "team": "DevDynasty",
  "timestamp": "2026-05-25T..."
}
```

---

## Security

- Passwords are hashed with **bcrypt (salt rounds = 12)** before storage
- Password hashes are NEVER returned in API responses (stripped via Sequelize `toJSON` override)
- JWT tokens expire after 24 hours by default
- Environment secrets (DB credentials, JWT secret) are stored in `.env` (gitignored)
- All input is validated server-side before reaching the database

---

## Database Schema

### `users` table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `role` | ENUM | NOT NULL, DEFAULT 'customer' | customer / owner / admin |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verification flag |
| `created_at` | TIMESTAMP | NOT NULL | Auto-generated |
| `updated_at` | TIMESTAMP | NOT NULL | Auto-updated |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

---

## Development Workflow

1. Pick a story from JIRA → move to "In Progress"
2. Create feature branch: `git checkout -b feature/RRP-USXX-description`
3. Code, commit frequently with conventional commit messages
4. Push to remote: `git push origin feature/RRP-USXX-description`
5. Open Pull Request to `develop` on GitHub
6. Request review from a teammate
7. Merge after approval → move JIRA story to "Done"

### Commit message format

type(scope): brief description
Longer body explaining what and why (optional)

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

**Example:**
feat(US-01): customer registration endpoint with validation

---

## License

Academic project — not licensed for external use.