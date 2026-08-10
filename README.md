# Cinepick — Movie Discovery Platform

[View the live application](https://ilynet-0302.github.io/Cinepick/)

Cinepick is a responsive movie and TV discovery platform built as a portfolio project. It combines live entertainment data, guided recommendations, personal collections, account management, and cross-device progress tracking in a polished React application.

## Project overview

| | |
| --- | --- |
| **Role** | Full-stack developer |
| **Project type** | Personal portfolio project |
| **Frontend** | React, TypeScript, Vite |
| **Backend** | Supabase Auth and PostgreSQL |
| **External data** | TMDB API |
| **Deployment** | GitHub Pages and GitHub Actions |

## Key features

- Live trending, popular, top-rated, and upcoming movie and TV data
- Advanced discovery by genre, media type, year, rating, and sort order
- Debounced multi-category search for titles and people
- Detailed title pages with cast, related content, ratings, and production data
- Guided “Pick for me” flow based on mood, runtime, company, and rating preference
- Fresh recommendation rounds generated from live TMDB results
- Watchlist, favorites, watched status, personal ratings, and viewing progress
- Email and password accounts with persistent authenticated sessions
- Cloud synchronization across devices for signed-in users
- Guest-mode persistence with automatic account-state separation
- Side-by-side title comparison and one-click random selection
- Responsive desktop, tablet, and mobile layouts with light and dark themes

## Engineering highlights

- Designed a normalized TypeScript domain model shared by movies and TV series.
- Separated server state from personal state using TanStack Query and dedicated context providers.
- Built a transparent recommendation engine with weighted genre matching, runtime limits, rating thresholds, popularity signals, and watched-history exclusion.
- Synchronized discovery filters with the URL to support refreshes, browser navigation, and shareable searches.
- Implemented a guest-first data layer that upgrades to Supabase synchronization after authentication.
- Added PostgreSQL Row Level Security policies so users can access only their own profiles and media records.
- Removed the original hardcoded demo catalog so every discovery surface uses live API results.
- Added automated tests, type-checked production builds, and continuous deployment through GitHub Actions.

## Technology stack

| Area | Technologies |
| --- | --- |
| UI | React 18, TypeScript, responsive CSS, Lucide icons |
| Routing | React Router |
| Data fetching | TanStack Query |
| Movie data | TMDB API |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL with Row Level Security |
| Testing | Vitest |
| Tooling | Vite, npm, TypeScript |
| Delivery | GitHub Actions, GitHub Pages |

## Architecture

TMDB communication is routed through a Supabase Edge Function. The browser sends only an allowlisted TMDB path to the function; the function applies origin checks and per-client rate limits before adding the server-side TMDB credential. Response normalization remains isolated in the frontend service layer. TanStack Query handles remote caching and request lifecycle state, while React context providers manage authentication and personal media state.

Guest activity is stored in the browser. After authentication, user collections and progress are synchronized with Supabase. Database ownership policies are enforced independently of the client, ensuring that each account can access only its own records.

The recommendation workflow retrieves live candidates from TMDB, scores them against the viewer’s answers, excludes previously watched titles, and returns a focused shortlist rather than cycling through a fixed catalog.

## Security and reliability

- Per-user database access enforced through Row Level Security
- Publishable client credentials separated from privileged database access
- TMDB credentials stored only as Supabase Edge Function secrets, never in the Vite bundle
- Allowlisted TMDB proxy routes with durable per-client minute and daily rate limits
- Runtime loading, error, empty, and unavailable-image states
- Strict TypeScript checks during production builds
- Automated recommendation-engine tests before deployment
- SPA route fallback for direct links and refreshed GitHub Pages routes

## Secure TMDB deployment

The frontend `.env` contains only the Supabase URL and publishable key shown in `.env.example`. Never add a TMDB credential to a variable prefixed with `VITE_`; Vite replaces those variables in public JavaScript at build time.

If a TMDB key has already appeared in a deployed bundle, revoke or regenerate it in TMDB before deploying this change. Store the replacement key and the backend deployment credentials as these GitHub Actions repository secrets:

- `TMDB_API_KEY` — the replacement TMDB v3 API key
- `RATE_LIMIT_SALT` — a long, randomly generated value used to hash client identifiers
- `SUPABASE_ACCESS_TOKEN` — a Supabase personal access token for the CLI
- `SUPABASE_DB_PASSWORD` — the linked project's database password
- `SUPABASE_PROJECT_ID` — the project's reference ID
- `VITE_SUPABASE_URL` — the public project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the public browser key

The deployment workflow applies the rate-limit migration, stores the server-only function secrets, deploys `tmdb-proxy`, and only then builds and publishes the static site. For a manual deployment, copy `supabase/.env.example` to the ignored `supabase/.env`, fill it locally, and run:

```sh
supabase link --project-ref your-project-ref
supabase db push
supabase secrets set --env-file supabase/.env --project-ref your-project-ref
supabase functions deploy tmdb-proxy --project-ref your-project-ref
```

## What this project demonstrates

Cinepick demonstrates product-oriented frontend development, third-party API integration, authentication, relational data modelling, secure user-owned persistence, recommendation logic, automated testing, responsive design, and continuous deployment.

TMDB provides the movie and television metadata used by the application. Cinepick is not endorsed or certified by TMDB.
