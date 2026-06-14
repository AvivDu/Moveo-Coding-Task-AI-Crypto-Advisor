# AI Collaboration Log

This log records the engineering decisions made while building the AI Crypto Advisor, and how
AI tooling was used to execute them.

## Planning Phase

Before any code was written, a full module breakdown, API contracts, dependency graph, and
build order were drafted (see `CLAUDE.md`). This was reviewed and approved before implementation
started, so the build follows a fixed plan rather than being figured out ad hoc.

### Key decisions

- **Express + Node over .NET/C#**: the operator's primary background is C#/.NET, but the
  assignment scoped the stack to a JS-based free-tier-friendly toolchain (Vercel/Railway
  deploy targets, MongoDB Atlas free tier). The operator chose to use this as a learning
  opportunity rather than working in a familiar stack, and asked that Node/Express/Mongoose
  concepts be explained in terms of their ASP.NET/EF equivalents throughout the build.
- **MongoDB over a relational DB**: no SQL background either, but MongoDB Atlas's free tier and
  Mongoose's schema model were judged a good fit for the relatively simple, mostly-flat data
  shapes here (User, Preferences, Vote).
- **JWT via Authorization Bearer header, not httpOnly cookies**: the frontend (Vercel) and
  backend (Railway) are deployed on different origins. The operator chose Bearer-header JWT
  specifically to avoid cross-origin cookie/CORS configuration (SameSite, Secure, credentialed
  requests), trading some XSS-resistance for a simpler, more explainable auth flow.
- **Static fallback on every external API section**: the operator required that News, Prices,
  AI Insight, and Meme each degrade to a static JSON response if the live API fails or a key is
  missing, so a deployed demo never shows a broken or empty card. This was treated as a hard
  requirement, not a nice-to-have.
- **OpenRouter for AI Insight**: chosen over Hugging Face Inference because the operator already
  has an OpenRouter account/key and judged it more reliable on the free tier.
- **CryptoPanic deferred**: the operator does not yet have a CryptoPanic key. The News module is
  built and verified end-to-end against its static fallback; the live integration requires only
  adding the API key as an environment variable later, no code changes.
- **Onboarding quiz fields**: beyond the baseline (experience level, risk tolerance, favorite
  coins, interests), the operator added `investmentHorizon` and `investmentGoal` to give the AI
  Insight more signal for tailoring tone and advice.

### Where the operator drove decisions

- Confirmed the Bearer-header JWT approach over the cookie alternative that was also presented.
- Chose OpenRouter over Hugging Face and over a fallback-only first pass.
- Expanded the onboarding quiz beyond the originally proposed four fields.
- Confirmed which infrastructure accounts (Atlas, OpenRouter, Railway/Vercel) were ready, which
  shaped the build order for the dashboard modules (CryptoPanic-backed News built fallback-first).

## Build Phases

### Phase 1 — App Skeleton + DB Models + Shared Utils
Express app with CORS/JSON middleware and a health check, Mongoose connection to MongoDB Atlas,
the `User`, `Preferences`, and `Vote` schemas (with the unique compound index on `Vote` for
upsert-based voting), and the shared `AppError` / `fetchExternal` utilities used by every later
module. Verified: server boots, connects to Atlas, `/api/health` returns 200.

### Phase 2 — Auth
Signup and login routes with bcrypt password hashing and JWT issuance, plus the `requireAuth`
middleware that all protected routes depend on. Verified: signup creates a hashed-password user
and returns a token; login round-trips; a protected probe route returns 401 without a token and
200 with one; duplicate signup returns 409.

### Phase 3 — Onboarding / Preferences
`GET`/`PUT /api/preferences`, upserting a `Preferences` document and flipping
`hasCompletedOnboarding` on first save. Verified: GET returns `null` before onboarding, PUT
upserts and returns the saved preferences, and a subsequent login reflects
`hasCompletedOnboarding: true`.

### Phase 4 — Dashboard: News
`GET /api/dashboard/news`, backed by a CryptoPanic integration that falls back to a static
headline set whenever the API key is absent, the live call returns nothing, or it errors.
Verified: with no CryptoPanic key configured, the endpoint returns the static items flagged
`source:"fallback"`.

### Phase 5 — Dashboard: Prices
`GET /api/dashboard/prices`, pulling the user's `favoriteCoins` from their preferences (or a
default coin set) and querying CoinGecko's `coins/markets` endpoint, with a static snapshot as
fallback. Verified: live call returns real-time prices for the user's saved favorites; a forced
failure of the live call returns the static fallback flagged `source:"fallback"`.

### Phase 6 — Dashboard: AI Insight
`GET /api/dashboard/insight`, generating a short market insight via OpenRouter, with the prompt
shaped by the user's experience level, risk tolerance, interests, investment horizon, and goal.
Because free-tier model availability on OpenRouter shifts and individual free models can hit
shared rate limits, the service tries a short ordered list of free models and falls back to a
static insight pool (keyed by risk tolerance, rotating daily) if all of them fail or no API key
is configured. Verified: live call returns a generated insight flagged `source:"live"`; a forced
failure of the live call returns the static fallback flagged `source:"fallback"`.

### Phase 7 — Dashboard: Meme
`GET /api/dashboard/meme`, serving one entry from a curated static pool of crypto memes
(`memes.json`), rotating by day of month. By design there is no live external API for this
section — the static pool is the primary source, not a fallback. Verified: the endpoint returns
a valid item with `id`, `imageUrl`, and `caption`.

### Phase 8 — Voting
`POST`/`GET /api/votes`, backed by `voteService.js`. Voting upserts on the unique
`(userId, section, itemId)` index defined back in Phase 1, so re-voting the same item updates
the existing document rather than creating a duplicate. Verified: a first POST creates a vote, a
second POST with a different value updates the same document in place (same `_id`, new `value`),
and GET returns the current state for the user.
