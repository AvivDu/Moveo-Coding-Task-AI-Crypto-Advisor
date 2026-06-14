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

Each phase below will be appended after the corresponding module is implemented and verified.
