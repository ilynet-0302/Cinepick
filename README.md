# Cinepick — Movie Discovery Platform

Cinepick is a polished React application for discovering films and series, making a confident choice for tonight, and building a personal taste profile over time. All title, person, and discovery data comes directly from TMDB.

The product loop is simple: **Discover → Decide → Watch → Track → Improve recommendations**.

## Highlights

- Cinematic home experience with trending and personalized rails
- Composable Discover filters with shareable URL state
- Debounced multi-title search and locally saved recent searches
- Rich movie details, cast profiles, ratings, related titles, and quick actions
- Persistent Watchlist, Favorites, and Watched collections
- Guided “Pick for me” flow that returns only three confident suggestions
- One-click movie roulette and side-by-side movie comparison
- Local taste profile with genre DNA, favorite eras, directors, and activity stats
- Supabase email/password accounts with persistent sessions
- Cloud-synced watchlists, favorites, watched status, ratings, and viewing progress
- Secure per-user Row Level Security policies
- Dark and light themes persisted in LocalStorage
- Responsive desktop, tablet, and mobile navigation
- Loading, error, empty, and missing-image states
- Live TMDB integration across every discovery surface

## Screens

| Area | What it demonstrates |
| --- | --- |
| Home | Editorial hero, trending titles, recommendations, roulette |
| Discover | Genre, type, year and rating filters synced to the URL |
| Pick for me | Mood, runtime, company and preference-based shortlisting |
| Movie detail | Metadata, actions, cast, rating, facts and similar titles |
| Library | Watchlist, favorites and watched collections |
| Profile | Personal statistics and a locally calculated taste profile |
| Compare | Rating, runtime, genre, director, budget and revenue comparison |

## Technology

- React 18 and TypeScript
- Vite
- React Router
- TanStack Query
- Lucide icons
- Plain responsive CSS with theme tokens
- Vitest
- TMDB API
- Supabase Auth and Postgres
- LocalStorage

## Architecture

```text
src/
├── components/       shared navigation and movie UI
├── data/             TMDB genre metadata
├── features/         recommendation scoring and tests
├── hooks/            reusable browser hooks (debounce)
├── pages/            route-level features
├── services/         isolated TMDB communication
├── store/            local collection and rating state
├── types.ts          shared domain types
├── App.tsx           route map
└── styles.css        visual system and responsive layouts
```

UI components never construct TMDB requests. API access and normalization live in `src/services/tmdb.ts`; TanStack Query owns server-state caching. Personal data is managed by `LibraryContext`: guests use versioned LocalStorage, while authenticated users synchronize through Supabase with Row Level Security.

## Getting started

Requirements: Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

Open `http://localhost:5173/Cinepick/`.

## Environment variables

```env
VITE_TMDB_API_KEY=your_tmdb_v3_api_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Create a developer key from [The Movie Database](https://developer.themoviedb.org/docs/getting-started). Do not commit `.env`. A valid key is required because the project intentionally contains no bundled movie catalog.

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Supabase setup

1. Open the Supabase SQL Editor.
2. Run `supabase/migrations/202608090001_accounts_and_progress.sql`.
3. Under Authentication → Providers → Email, disable **Confirm email** for immediate signup.

The migration creates `profiles` and `user_media`, signup/profile triggers, ownership indexes, and RLS policies that restrict every row to its authenticated owner. Never expose a database password or `service_role` key in this client application.

## Commands

```bash
npm run dev       # local development server
npm run build     # type-check and production build
npm run preview   # preview the generated build
npm test          # unit tests
```

## URL state

Discover selections survive refreshes and browser navigation and can be shared directly:

```text
/discover?genre=878&type=movie&rating=7&year=2020s&sort=rating
```

## Local data

The following state stays in the browser:

- Watchlist, Favorites, and Watched IDs
- Personal ratings
- Recent searches
- Theme preference

Delete the `cinepick-library-v2`, `cinepick-searches`, and `cinepick-theme` LocalStorage keys to reset the experience.

## What I learned

The most interesting design problem was keeping server state and personal state independent: TMDB responses can expire and refresh, while a user’s library keys remain stable locally. A normalized service layer gives movies and TV shows one UI contract. URL-owned filters also make Discover feel like a real product—refresh, back/forward navigation, and shared links behave predictably without a separate global store.

The recommendation features intentionally use understandable rules instead of pretending to be AI. Mood-to-genre mapping, runtime limits, ratings, watched-history exclusion, and a small popularity boost produce useful results while remaining easy to inspect and improve.

## Deployment

The repository includes a GitHub Actions workflow that tests, builds, and deploys the application to GitHub Pages after every push to `main`.

Configure the repository's Pages source as **GitHub Actions** and add these repository Actions secrets before deploying:

```text
VITE_TMDB_API_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The production site is published at `https://ilynet-0302.github.io/Cinepick/`. The build also includes an SPA fallback so direct links and refreshed React routes continue to work on GitHub Pages.

## Production build

```bash
npm run build
```

The static output is generated in `dist/` and can be deployed to any SPA-compatible host. Configure the host to fall back unknown routes to `index.html`.
