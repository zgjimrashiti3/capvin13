# Restaurant Menu PWA

A QR-code-based digital menu. Customers scan a QR code and browse the menu on their phone. Admins manage categories and items via a dashboard.

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT auth, Swagger
- **Frontend**: React, Vite, React Router, React Query, Tailwind CSS, PWA (vite-plugin-pwa)

## Project Structure

```
restaurant-menu/
├── backend/          # NestJS API
├── frontend/         # React PWA
└── docker-compose.yml
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ running locally

### 1. Database

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE restaurant_menu;"
```

### 2. Backend

```bash
cd backend
npm install
# Configure .env (already created with defaults)
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.
Swagger docs: `http://localhost:3000/api/docs`

### 3. Seed Data

With the backend running and database ready, run the seed script:
```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin` / `admin123`
- 4 categories: Starters, Main Course, Desserts, Drinks
- 14 menu items with realistic names and prices

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Pages

| URL | Description |
|-----|-------------|
| `/menu` | Public menu (no login needed) |
| `/admin/login` | Admin login |
| `/admin` | Dashboard with stats |
| `/admin/categories` | Manage categories |
| `/admin/items` | Manage menu items |
| `/admin/qr` | QR code page |

## API Endpoints

### Public (no auth)
- `GET /api/categories` — All categories
- `GET /api/menu-items/all` — All items grouped by category
- `GET /api/menu-items?categoryId=<uuid>` — Items for a category

### Admin (Bearer token required)
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user
- `POST /api/categories` — Create category
- `PATCH /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category
- `PATCH /api/categories/:id/toggle` — Toggle active status
- `POST /api/menu-items` — Create item
- `PATCH /api/menu-items/:id` — Update item
- `DELETE /api/menu-items/:id` — Delete item
- `PATCH /api/menu-items/:id/toggle` — Toggle availability
- `POST /api/upload/image` — Upload image (multipart/form-data)

## Docker

Run everything with Docker Compose:
```bash
docker-compose up --build
```

Then seed manually:
```bash
docker-compose exec backend node dist/seed.js
```

Services:
- Database: `localhost:5432`
- Backend API: `localhost:3000`
- Frontend: `localhost:5173`

## Environment Variables

### Backend (`backend/.env`)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurant_menu
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_DEST=./uploads
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000/api
```

## PWA

The frontend is a fully installable PWA:
- Offline support via service worker (menu is cached)
- Install prompt on mobile browsers
- Manifest with restaurant theme colors

## Admin Credentials

```
Username: admin
Password: admin123
```
