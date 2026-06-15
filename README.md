# AI Crypto Advisor

A personalized crypto investor dashboard. Users sign up, complete a one-time onboarding quiz
about their experience level, risk tolerance, goals, and favorite coins, and land on a daily
dashboard with four tailored sections — Market News, Coin Prices, AI Insight of the Day, and a
Crypto Meme — each with thumbs up/down voting.

## Live Demo

- Frontend: https://moveo-coding-task-ai-crypto-advisor-six.vercel.app
- Backend API: https://moveo-coding-task-ai-crypto-advisor-production.up.railway.app

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth (bcrypt password hashing)
- **Frontend**: React (Vite), React Router
- **External APIs**: CoinGecko (prices), OpenRouter (AI insight), CoinDesk RSS (news) — each with
  a static fallback so the dashboard never renders empty or broken

> Note: News originally targeted CryptoPanic, but they moved to a paid API in April 2026, so the
> News section now uses CoinDesk's public RSS feed instead (no API key required).

## Project Structure

```
backend/    Express API (controllers/services/models/routes)
frontend/   React (Vite) SPA
```

Backend follows a strict `controllers/` (HTTP in/out) vs `services/` (business logic + external
API calls) separation.

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, and optional API keys
npm run dev
```

Environment variables (`backend/.env`):

| Variable | Required | Description |
|---|---|---|
| `PORT` | no | Server port (default `4000`) |
| `MONGODB_URI` | yes | MongoDB Atlas connection string |
| `JWT_SECRET` | yes | Secret used to sign auth tokens |
| `OPENROUTER_API_KEY` | no | Enables live AI Insight; falls back to a static insight pool if absent |
| `CORS_ORIGIN` | yes | Allowed origin for the frontend (e.g. `http://localhost:5173`) |

The server starts on `http://localhost:4000`. `GET /api/health` should return `{ "status": "ok" }`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL to the backend URL
npm run dev
```

The app runs on `http://localhost:5173`.

## Core Flow

1. **Sign up / log in** — JWT issued and stored, sent as `Authorization: Bearer <token>` on
   protected requests.
2. **Onboarding** — a one-time quiz (experience level, risk tolerance, investment horizon and
   goal, favorite coins, interests) that personalizes the dashboard. The favorite-coins picker
   supports searching for and adding any CoinGecko-listed coin, not just the curated defaults.
3. **Dashboard** — four cards (News, Prices, AI Insight, Meme), each backed by a live external
   API with a static fallback, plus thumbs up/down voting that persists per user.
4. **Edit preferences** — users can revisit and change their onboarding answers at any time from
   the dashboard, which immediately re-personalizes the cards above.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — module breakdown, API contracts, and build plan
- [`AI_COLLABORATION.md`](AI_COLLABORATION.md) — log of how this project was built in
  collaboration with Claude Code
