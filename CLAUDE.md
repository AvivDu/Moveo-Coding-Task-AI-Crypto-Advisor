# CLAUDE.md — AI Crypto Advisor

## 1. Project Overview

A personalized crypto investor dashboard: users sign up, complete a one-time onboarding quiz,
and land on a daily dashboard with four preference-tailored sections (Market News, Coin Prices,
AI Insight of the Day, Crypto Meme), each with thumbs up/down voting persisted to MongoDB.

## 2. Modules & Boundaries

| Module | Responsibility | Depends on | Complexity |
|--------|----------------|------------|------------|
| **DB Models** | Mongoose schemas for `User`, `Preferences`, `Vote`; the Atlas connection. | — | Low |
| **App Skeleton** | Express app, middleware pipeline (CORS, JSON parsing, error handler), router mounting, env config. | — | Low |
| **Auth** | Signup, login, password hashing (bcrypt), JWT issuance, auth middleware that guards protected routes. | DB Models, App Skeleton | Medium |
| **Onboarding / Preferences** | Save and read the user's quiz answers; mark onboarding complete. | DB Models, Auth | Low |
| **Dashboard: News** | Fetch crypto news (CryptoPanic) tailored by preferences; static JSON fallback. | Auth, Preferences | Medium |
| **Dashboard: Prices** | Fetch coin prices (CoinGecko) for the user's favorite coins; static JSON fallback. | Auth, Preferences | Medium |
| **Dashboard: AI Insight** | Generate a daily insight via OpenRouter, prompt-shaped by preferences; static fallback. | Auth, Preferences | Medium |
| **Dashboard: Meme** | Serve a crypto meme from a curated static JSON pool. | Auth | Low |
| **Voting** | Record/update a thumbs up/down per user per content item; read a user's votes. | DB Models, Auth | Low |
| **Shared Utils** | One external-API client wrapper (timeout + fallback), one error helper, one config loader. | App Skeleton | Low |
| **Frontend** | React (Vite) SPA: auth pages, onboarding flow, dashboard with four section components and voting UI; one API client + one auth/fetch hook reused everywhere. | All backend modules | High |

Backend keeps strict `controllers/` (HTTP in/out) vs `services/` (business logic + external
calls) separation. Controllers never call external APIs directly; services never touch
`req`/`res`.

## 3. Module Contracts

> **Auth convention:** JWT in the `Authorization: Bearer <token>` header, token stored in
> frontend storage. Chosen over httpOnly cookies because the deploy is cross-origin
> (Vercel frontend → Railway backend) and Bearer avoids SameSite/Secure/credentialed-CORS
> friction, and is simpler to demo and explain. Used consistently across all protected routes.

### DB Models
- **User**: `{ email (unique, required), passwordHash (required), hasCompletedOnboarding (bool, default false), createdAt }`
- **Preferences**: `{ userId (ref User, unique), experienceLevel, riskTolerance, favoriteCoins [string], interests [string], investmentHorizon, investmentGoal, updatedAt }`
- **Vote**: `{ userId (ref User), section (enum: news|prices|insight|meme), itemId (string), value (enum: up|down), updatedAt }` with a unique compound index on `(userId, section, itemId)` so a re-vote updates in place.
- **Success:** models compile, connection to Atlas succeeds, indexes created.

### Auth
- **POST `/api/auth/signup`** — in: `{ email, password }` → out: `{ token, user: { id, email, hasCompletedOnboarding } }`. Rejects duplicate email (409) and weak/missing fields (400).
- **POST `/api/auth/login`** — in: `{ email, password }` → out: `{ token, user }`; 401 on bad credentials.
- **Auth middleware** — reads Bearer token, verifies JWT, attaches `req.userId`; 401 if missing/invalid.
- **Example:** `POST /api/auth/login { "email":"a@b.com","password":"secret123" }` → `200 { "token":"eyJ...", "user":{ "id":"...", "email":"a@b.com", "hasCompletedOnboarding":true } }`
- **External APIs:** none. **Fallback:** n/a.

### Onboarding / Preferences
- **GET `/api/preferences`** (auth) → `{ preferences | null }`.
- **PUT `/api/preferences`** (auth) — in: `{ experienceLevel, riskTolerance, favoriteCoins[], interests[], investmentHorizon, investmentGoal }` → upserts, sets `hasCompletedOnboarding=true`, returns saved preferences.
- **Example:** `PUT { "experienceLevel":"beginner","riskTolerance":"low","favoriteCoins":["bitcoin","ethereum"],"interests":["defi","news"],"investmentHorizon":"long","investmentGoal":"growth" }` → `200 { preferences }`.
- **External APIs:** none. **Fallback:** n/a.

### Dashboard: News
- **GET `/api/dashboard/news`** (auth) → `{ items: [{ id, title, url, source, publishedAt }], source: "live"|"fallback" }`.
- **External API:** CryptoPanic. **Fallback:** curated static JSON of recent-style headlines; response flagged `source:"fallback"`. Card never renders empty.

### Dashboard: Prices
- **GET `/api/dashboard/prices`** (auth) → `{ items: [{ id, symbol, name, price, change24h, image }], source }`. Coins come from the user's `favoriteCoins` (default set if none).
- **External API:** CoinGecko. **Fallback:** static JSON snapshot for the default coin set.

### Dashboard: AI Insight
- **GET `/api/dashboard/insight`** (auth) → `{ id, text, generatedAt, source }`. Prompt shaped by experience level, risk tolerance, interests.
- **External API:** OpenRouter (free-tier model). **Fallback:** rotating static insight pool keyed to risk tolerance.

### Dashboard: Meme
- **GET `/api/dashboard/meme`** (auth) → `{ id, imageUrl, caption }`. **External API:** none (curated static JSON pool by design — no live Reddit). **Fallback:** is the primary source.

### Voting
- **POST `/api/votes`** (auth) — in: `{ section, itemId, value }` → upserts the vote; returns saved vote. Re-voting same item updates value.
- **GET `/api/votes`** (auth) → `{ votes: [...] }` for hydrating the dashboard's vote state.
- **Example:** `POST { "section":"news","itemId":"abc123","value":"up" }` → `200 { vote }`.
- **External APIs:** none. **Fallback:** n/a.

## 4. Dependency Graph

```
[DB Models] + [App Skeleton] + [Shared Utils]
        |
      [Auth]
        |
[Onboarding / Preferences]
        |
[News] [Prices] [AI Insight] [Meme]   (each with static fallback)
        |
     [Voting]
        |
   [Frontend]
```

## 5. Build Order (each verified before the next)

1. **App Skeleton + DB Models + Shared Utils** — verified by: server boots, `/api/health` returns 200, Atlas connection logs success, models register.
2. **Auth** — verified by: signup creates a user with a hashed password; login returns a JWT; a protected probe route returns 401 without the token and 200 with it (tested via curl/REST client).
3. **Onboarding / Preferences** — verified by: PUT then GET round-trips the preferences and flips `hasCompletedOnboarding`.
4. **News** — verified by: live call returns items; forcing the failure path returns the static fallback flagged `source:"fallback"`.
5. **Prices** — verified by: live call returns favorite-coin prices; fallback path proven.
6. **AI Insight** — verified by: live call returns text; fallback path proven.
7. **Meme** — verified by: returns a valid meme item from the static pool.
8. **Voting** — verified by: POST creates a vote, re-POST updates it (no duplicate), GET returns it.
9. **Frontend** — verified by: full flow in the browser — signup → onboarding → dashboard shows all four cards (with fallbacks if keys absent) → voting persists across reload.

## 6. Success Criteria Checklist

- [ ] Server boots, connects to Atlas, `/api/health` green.
- [ ] Signup/login issue and verify JWTs; protected routes reject missing/invalid tokens.
- [ ] Preferences upsert + read; onboarding flag set.
- [ ] News returns live data **and** a proven static fallback.
- [ ] Prices returns favorite-coin live data **and** a proven static fallback.
- [ ] AI Insight returns live text **and** a proven static fallback.
- [ ] Meme always returns a valid item from the static pool.
- [ ] Voting upserts (no duplicates), reads back, survives reload.
- [ ] Frontend: responsive, componentized, all four cards populated, voting works end-to-end.
- [ ] No code comments anywhere; controllers/services separated; commits plain (no AI attribution).
- [ ] `AI_COLLABORATION.md` maintained per phase.

## 7. Resolved Decisions

1. **LLM provider:** OpenRouter (OpenAI-compatible endpoint, free-tier model) for the AI Insight.
2. **Account / key readiness:** Ready — MongoDB Atlas, OpenRouter, Railway/Vercel. **Not yet:** CryptoPanic. News module is built and verified against its **static fallback**; the live CryptoPanic key is wired in later when available, no code change beyond supplying the env var.
3. **Auth mechanism:** JWT via `Authorization: Bearer` header, consistent across all protected routes.
4. **Onboarding quiz fields:** `experienceLevel`, `riskTolerance`, `favoriteCoins`, `interests`, `investmentHorizon` (short/medium/long), `investmentGoal` (growth/income/learning).
5. **Secrets handling:** Real keys in a local `.env` for Atlas + OpenRouter during the build; CryptoPanic verified via fallback now, key added at deploy time. `.env` git-ignored; `.env.example` committed.

## Running Checklist

- [x] Step 1: App Skeleton + DB Models + Shared Utils
- [x] Step 2: Auth
- [x] Step 3: Onboarding / Preferences
- [x] Step 4: Dashboard — News
- [x] Step 5: Dashboard — Prices
- [x] Step 6: Dashboard — AI Insight
- [x] Step 7: Dashboard — Meme
- [x] Step 8: Voting
- [ ] Step 9: Frontend
