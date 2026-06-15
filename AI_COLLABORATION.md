# AI Collaboration Log

This log is written from my (the AI's) perspective, documenting how this project was built in
collaboration with the operator. It's not a changelog of *what* was built — the commit history
already covers that — it's a record of *how* we worked: what the operator specified or decided,
what they asked me to explain or justify, where they corrected my output or pushed back, and
where they handed me a contract and let me execute against it. Keeping this log itself was one
of the operator's decisions, made specifically so an interviewer can see how the architecture and
decisions in this repo actually originated.

The operator's background is C#/.NET, with no prior Node/Express/Mongoose or React experience,
and no SQL background either. They told me this up front and asked me to explain
Node/Express/Mongoose concepts in terms of ASP.NET Core/EF equivalents throughout the build,
treating this as a learning exercise rather than a black box.

## Planning Phase

Before I wrote any code, the operator asked me to draft a full module breakdown, API contracts,
dependency graph, and build order as `CLAUDE.md`. They reviewed it, asked clarifying questions
about the proposed stack and auth approach, and only approved it once they were comfortable. The
build then followed that fixed plan module-by-module — every phase below maps to a row in that
plan.

### Decisions the operator drove, and what they asked me

- **Express + Node over .NET/C#**: the assignment scoped the stack to a JS-based,
  free-tier-friendly toolchain (Vercel/Railway, MongoDB Atlas free tier). The operator chose to
  treat this as a learning opportunity rather than insisting on a familiar stack, but asked me to
  map Node/Express/Mongoose concepts to ASP.NET Core/EF equivalents (middleware ~ pipeline,
  Mongoose schema ~ EF entity, controller/service split ~ the layering they already knew) so they
  could follow my reasoning, not just accept my code.
- **MongoDB over a relational DB**: the operator raised that they have no SQL background either.
  I proposed MongoDB Atlas's free tier plus Mongoose's schema model as a reasonable fit for the
  relatively simple, mostly-flat data here (User, Preferences, Vote), framing Mongoose's
  schema-level validation as close to the EF model they already knew. They agreed.
- **JWT via `Authorization: Bearer`, not httpOnly cookies**: I presented this as a real tradeoff —
  cookies are more XSS-resistant, but the frontend (Vercel) and backend (Railway) are
  cross-origin, which makes cookie-based auth fiddlier to configure and explain. The operator
  picked Bearer-header JWT specifically because of the cross-origin deploy and wanting a simple,
  demoable auth flow, explicitly accepting the XSS tradeoff for a project at this scale.
- **Static fallback on every external API section**: the operator made this a hard requirement up
  front — News, Prices, AI Insight, and Meme must each degrade to a static JSON response if the
  live API fails or a key is missing, so a deployed demo never shows a broken or empty card
  regardless of which third-party keys are configured.
- **OpenRouter for AI Insight**: the operator already had an OpenRouter account/key, so they chose
  it over Hugging Face Inference for the AI Insight section.
- **CryptoPanic deferred**: the operator didn't have a CryptoPanic key when News was built.
  Rather than blocking on that, they told me to build and verify the News module end-to-end
  against its static fallback, with the live integration deferred to "just add the env var
  later, no code change" — their explicit call to keep the build moving.
- **Onboarding quiz fields**: the operator expanded the quiz beyond the four fields I originally
  proposed (experience level, risk tolerance, favorite coins, interests), adding
  `investmentHorizon` and `investmentGoal` because they wanted the AI Insight prompt to have more
  signal to tailor tone and advice on.

## Implementation — how phases actually went

### Phase 1 — App Skeleton + DB Models + Shared Utils
I set up the Express app, Mongoose connection, and the `User`/`Preferences`/`Vote` schemas per
the contracts in `CLAUDE.md`, including the unique compound index on `Vote` that the later voting
upsert logic depends on. The operator reviewed the schema shapes against the contract and
confirmed the controller/service folder split before any business logic existed — they wanted
that boundary right from the start so the "controllers never call external APIs" rule would hold
later.

### Phase 2 — Auth
I built signup/login with bcrypt + JWT, and the `requireAuth` middleware every protected route
depends on. The operator asked me to demonstrate the protected-route check concretely (401
without a token, 200 with one, 409 on duplicate signup) before moving on — the first "trust but
verify" checkpoint in the build, before anything was built on top of it.

### Phase 3 — Onboarding / Preferences
`GET`/`PUT /api/preferences`, upserting a `Preferences` document and flipping
`hasCompletedOnboarding` on first save. Straightforward against the contract; the operator
verified the GET-before-onboarding (`null`) → PUT → GET-after (`hasCompletedOnboarding: true`)
round trip manually.

### Phase 4 — Dashboard: News
`GET /api/dashboard/news`, CryptoPanic-backed with a static fallback. Since the operator had no
CryptoPanic key at this point, I built and they verified this phase *only* against the fallback
path (`source:"fallback"`) — a direct consequence of the "CryptoPanic deferred" decision above.
The operator flagged that the key should be addable later with zero code changes, which shaped
how I structured the news service.

### Phase 5 — Dashboard: Prices
`GET /api/dashboard/prices`, pulling `favoriteCoins` from preferences (or a default set) via
CoinGecko's `coins/markets` endpoint, with a static snapshot fallback. The operator verified both
the live path (real prices for their saved favorites) and the forced-failure fallback path.

### Phase 6 — Dashboard: AI Insight
`GET /api/dashboard/insight`, generating a market insight via OpenRouter, prompt-shaped by
experience level, risk tolerance, interests, horizon, and goal. The operator raised a real
concern here: free-tier OpenRouter models can hit shared rate limits or disappear from the free
tier without notice. They asked me to handle this defensively rather than just wrapping one model
call in a try/catch, so I built an ordered list of free models tried in sequence, falling back to
a static insight pool (keyed by risk tolerance, rotating daily) only if all of them fail or no
key is configured. The operator verified both the live-generation path and the all-models-fail
fallback.

### Phase 7 — Dashboard: Meme
`GET /api/dashboard/meme`, serving from a curated static pool (`memes.json`), rotating by day of
month. The operator decided from the start that this section should have *no* live API at all —
the static pool is the primary source by design, not a degraded fallback, since a meme card
doesn't need to be "live" to do its job.

### Phase 8 — Voting
`POST`/`GET /api/votes`, upserting on the `(userId, section, itemId)` index from Phase 1. The
operator specifically checked the "re-vote updates in place, doesn't duplicate" behavior — same
`_id`, new `value` — since that was the whole point of defining that index back in Phase 1.

### Phase 9 — Frontend
I built a React (Vite) SPA: `apiRequest`/`useApi` for the Bearer-token-aware fetch wrapper,
`AuthContext` for JWT/user state, `react-router-dom` routing with
`ProtectedRoute`/`OnboardingRoute` gating on auth state and `hasCompletedOnboarding`, a single
onboarding form covering all six preference fields, and a dashboard that loads all four section
endpoints plus `/api/votes` in parallel into `NewsCard`/`PricesCard`/`InsightCard`/`MemeCard` with
a shared `VoteButtons` component doing optimistic updates. The operator walked through the full
flow in the browser themselves — signup → onboarding → dashboard (News on fallback since no
CryptoPanic key, Prices and AI Insight live) → vote on multiple items → reload → votes persist →
log out/in skips onboarding and keeps votes — before considering this phase done.

### Phase 10 — Visual Redesign
The operator wanted a real visual pass rather than the functional-but-plain UI from Phase 9.
Instead of asking me to invent a design from scratch, they did the redesign themselves on
claude.ai/design (via the DesignSync staging workflow) and asked me to pull their edited files
back and reconcile them into the actual React app — new CSS tokens, a `lucide-react` icon system
across all cards and auth pages, and a full step-based onboarding wizard (3 steps with progress
indicator, option cards, coin grid, interest chips) replacing the single long form.

Two things stood out while reconciling:
- The design mockup for onboarding didn't include a step for `investmentHorizon`, even though
  it's a required field in the `/api/preferences` contract. The operator caught this and had me
  add a third "Investment horizon" option-card section to step 3 so the contract still held — the
  redesign couldn't be allowed to silently drop a field the backend depends on.
- The dashboard redesign introduced a "personalization" header strip (profile/risk/goal/coins
  summary), which meant the dashboard now also needed to fetch `/api/preferences` on load — a
  small but real backend-contract consequence of a purely visual change.
- After reconciling, the operator asked me to remove the temporary `frontend/design-sync/`
  staging folder and commit the result in one pass.

### Phase 11 — Deployment
The operator deployed the backend to Railway (root directory `backend`, `npm start`) and the
frontend to Vercel (root directory `frontend`, Vite preset) themselves, walking through each
dashboard step by step with me narrating what to click and what to look for in logs/output. I
didn't have direct access to either dashboard.

- **Atlas IP whitelist**: the first deploy hit a `MongooseServerSelectionError` because Atlas's
  Network Access list didn't include Railway's egress IPs. The operator added `0.0.0.0/0` (allow
  from anywhere) in Atlas Network Access, which resolved it — acceptable for a free-tier demo
  project where the connection string itself is the real secret.
- **CORS_ORIGIN sequencing**: `CORS_ORIGIN` was first set to `http://localhost:5173` as a
  placeholder on Railway, then updated to the real Vercel URL once the frontend deploy produced
  one, since the value wasn't known until after the frontend existed.
- **SPA refresh 404 on Vercel**: after a full manual end-to-end pass (signup → onboarding →
  dashboard → vote), reloading the page on a non-root route returned Vercel's `404: NOT_FOUND`.
  This is the standard SPA-on-static-host issue — Vercel was looking for a file at that path
  instead of serving `index.html` for client-side routing. I added `frontend/vercel.json` with a
  catch-all rewrite to `index.html`; the operator confirmed the fix after redeploy (votes and
  routing both survive a refresh).
- **README live URLs**: the operator asked for the live Vercel/Railway URLs to be added to
  `README.md` under a new "Live Demo" section, reviewed before committing.
- From this point on, the operator asked that before any commit in this project, I check whether
  the change should also be reflected in `AI_COLLABORATION.md`, `DEV_RECAP` (if present), and/or
  `README.md`, rather than only updating the code.

### Phase 12 — News Provider Swap (CryptoPanic → CoinDesk RSS)
The operator asked me to replace CryptoPanic with `cryptocurrency.cv`'s "free" news API. Before
writing any code, I checked that endpoint directly and found it actually requires x402 USDC
micropayments per request on Arbitrum — not a free, no-key API as described, and incompatible
with the assignment's "free public APIs" requirement. I flagged this to the operator instead of
wiring up a paid integration.

The operator asked me to find a genuinely free alternative. I checked CryptoCompare's news
endpoint (now requires a key via CoinDesk's developer portal) and landed on CoinDesk's public RSS
feed (`coindesk.com/arc/outboundfeeds/rss/`), which needs no key. Since there's no XML parser
dependency in the backend, I wrote a small regex-based `<item>` extractor in `newsService.js`
rather than adding a new package — appropriate given the static fallback already covers
parse/format failures. A first pass returned only fallback data because my tag-extraction regex
didn't allow attributes on the opening tag (`<guid isPermaLink="false">` didn't match
`<guid>...`), so every item's `id` came back empty and got filtered out; I caught this by running
`getNews()` directly and inspecting the result before calling it done, fixed the regex, and
re-verified `source:"live"` with real headlines.

Also removed the now-unused `CRYPTOPANIC_API_KEY` from `env.js` and `.env.example`, and added a
one-line note to `README.md` that CryptoPanic was substituted because they moved to a paid API in
April 2026.

### Phase 13 — Edit Preferences, Custom/Searchable Coins, and Assignment Re-check
With the core build and deployment done, the operator asked for a round of quality-of-life
improvements before final submission and asked me to re-confirm the original assignment's
deliverables were fully met.

**Assignment re-check**: all functional requirements (auth, onboarding, four dashboard sections
with fallbacks, voting, deployment) were already complete. I flagged the remaining items as
non-code submission tasks: a short written project description, the optional bonus write-up on
using vote feedback for future model training, and sharing DB access with the reviewer.

**Coin search verification first**: the operator specifically asked me to confirm CoinGecko's
`/search` endpoint was genuinely free before I built anything on top of it, given the
`cryptocurrency.cv` news API had turned out to require payment. I checked it directly
(`GET https://api.coingecko.com/api/v3/search?query=bit`) and confirmed it returns real coin data
with no key or payment required, then proceeded.

**Edit preferences**: added a single-page `EditPreferencesPage` (the operator chose a single page
over a multi-step wizard for editing, since the onboarding wizard's step framing doesn't fit a
"change a few answers" flow) at `/preferences/edit`, reached via a new "Edit preferences" button
on the dashboard. It reuses the existing `GET`/`PUT /api/preferences` endpoints — no backend
changes needed for this part.

**Shared components**: to avoid duplicating the onboarding wizard's markup between
`OnboardingPage` and the new edit page, I extracted `OptionCardGroup`, `InterestChips`, and
`CoinPicker` into their own components, and moved the shared option arrays into
`constants/preferencesOptions.js`. Both pages now render from the same components.

**Coin picker upgrades**: the favorite-coins picker was previously limited to 8 hardcoded coins.
`CoinPicker` now also supports a debounced CoinGecko-backed search (new
`GET /api/dashboard/coins/search` endpoint, backed by `searchService.js`) so users can find and
add any coin by name, plus a manual "add as custom coin" path for a raw CoinGecko id if search
doesn't find it. The operator chose "search-to-add inside the coin picker" over a separate
dashboard search feature, to keep the change scoped.

## Where the operator made the calls vs. where they delegated to me

- **The operator decided**: Express/Mongoose over .NET/SQL (a deliberate learning tradeoff),
  Bearer-header JWT over cookies (cross-origin simplicity over XSS-resistance), making static
  fallbacks a hard requirement everywhere, deferring CryptoPanic, expanding the onboarding quiz
  fields, choosing OpenRouter, treating Meme as static-only by design, doing the visual
  redesign themselves rather than delegating the design work to me, the single-page edit
  preferences layout, and scoping coin search to "search-to-add inside the coin picker" rather
  than a separate dashboard feature.
- **The operator delegated to me**: the actual Express/Mongoose/React code for every phase, the
  controller/service split mechanics, the OpenRouter multi-model fallback implementation details,
  and reconciling the redesigned CSS/components back into the codebase.
- **The operator verified manually before moving on**: every phase's checklist item in
  `CLAUDE.md` — auth 401/200 behavior, preferences round-trip, each dashboard section's live
  *and* fallback path, vote upsert behavior, and the full signup → onboarding → dashboard → vote
  → reload flow in the browser.
