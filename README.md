# CSBSJU Connect - MERN Stack


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
