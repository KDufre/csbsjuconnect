# CSBSJU Connect - MERN Conversion

This is a MERN conversion of your original prototype.

## Structure
- `client/` - React + Vite + TypeScript frontend
- `server/` - Node.js + Express + MongoDB API

## Quick start

### 1. Server
```bash
cd server
npm install
cp .env.example .env
# set MONGODB_URI and JWT_SECRET
npm run dev
```

### 2. Client
```bash
cd client
npm install
cp .env.example .env
# set VITE_API_URL and optional VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

## Deploy
- Frontend: Netlify / Vercel
- Backend: Render / Railway / Fly / VM

## Notes
- Your original app used localStorage.
- This version moves auth, rides, and bookings to MongoDB.
- The frontend still keeps the same overall page structure and styling.
