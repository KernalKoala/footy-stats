# Footy Stats

A football statistics dashboard that fetches data from the FootyStats API and displays league standings, match results/fixtures, and team/player deep dives. Built with Next.js 14, Supabase Auth, Upstash Redis caching, and TanStack Query.

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Framework     | Next.js 14 (App Router) + TypeScript |
| Styling       | Tailwind CSS + shadcn/ui             |
| Auth          | Supabase Auth                        |
| Database      | Supabase (PostgreSQL)                |
| Cache         | Upstash Redis                        |
| Data Fetching | Server routes + TanStack Query       |
| Charts        | Recharts                             |
| Deployment    | Vercel                               |

## Features

- Email/password authentication with protected routes
- League overview dashboard with summary stat cards
- Sortable league standings table with team form
- Match results and fixtures with date filtering and detail view
- Team deep-dive pages with stats, form charts, and squad stats
- User preferences: favourite leagues and default filters (persisted per user)
- Responsive design with mobile navigation, error boundaries, and toast notifications

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Upstash Redis](https://upstash.com) database
- A [FootyStats API](https://footystats.org/api) key

## Environment Variables

Create a `.env.local` file in the project root (see `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# FootyStats API
FOOTYSTATS_API_KEY=your_footystats_api_key
```

> **Note:** If Upstash Redis is not configured, the app falls back to calling the FootyStats API directly (without caching). This is fine for development but caching is recommended in production to stay within the API rate limit (1800 requests/hour).

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables (see above).

3. Run the database migration (see [Database Setup](#database-setup)).

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Database Setup

The app requires a `user_preferences` table in Supabase. Run the migration in `supabase/migrations/001_user_preferences.sql` via the Supabase dashboard:

1. Go to your Supabase project → **SQL Editor**
2. Click **New query**
3. Paste the contents of `supabase/migrations/001_user_preferences.sql` and click **Run**

This creates the table with Row Level Security (RLS) policies scoped to each user.

### Auth Configuration

For local development you may want to disable email confirmation:

- Supabase dashboard → **Authentication → Providers → Email** → toggle off **Confirm email**

To create a user, either use the signup page (if enabled) or add one via **Authentication → Users → Add User** with "Auto Confirm" checked.

## FootyStats API Notes

The FootyStats API is subscription-based — you can only access leagues and seasons included in your plan. The service layer:

- Uses `chosen_leagues_only=true` to list only your subscribed leagues
- Validates each league's season is accessible before exposing it in the UI
- Caches responses in Redis (5 min for matches, 1 hour for standings, 24 hours for league lists)

## Available Scripts

```bash
npm run dev          # Start the dev server
npm run build        # Production build
npm run start        # Start the production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

## Deployment (Vercel)

1. Push the repository to GitHub/GitLab/Bitbucket.

2. In [Vercel](https://vercel.com/new), import the repository.

3. Add the environment variables (from `.env.local`) in the Vercel project settings under **Settings → Environment Variables**. Use a **separate Supabase project and Upstash database for production**.

4. Deploy. Vercel auto-detects Next.js and builds the app.

5. Enable **Vercel Analytics** in the project dashboard (the `<Analytics />` component is already wired up).

### Post-Deployment

- Run the Supabase migration against your **production** Supabase project.
- In Supabase → **Authentication → URL Configuration**, add your Vercel domain to the redirect allow-list so the auth callback works.
- Verify the health check endpoint responds: `https://your-app.vercel.app/api/health`

## Health Check

A public health check endpoint is available at `/api/health`:

```bash
curl https://your-app.vercel.app/api/health
# {"status":"ok","timestamp":"...","service":"footy-stats"}
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login / signup pages
│   ├── (dashboard)/     # Protected dashboard, standings, matches, team, settings
│   ├── api/             # API route handlers (leagues, matches, team, preferences, health)
│   └── auth/callback/   # Supabase auth callback
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── dashboard/       # Dashboard-specific components
│   ├── matches/         # Match-related components
│   └── shared/          # Navbar, providers
├── hooks/               # TanStack Query hooks
├── lib/
│   ├── supabase/        # Supabase client utilities
│   ├── footystats/      # API service layer + types
│   └── redis.ts         # Upstash Redis cache wrapper
├── types/               # Shared TypeScript interfaces
└── middleware.ts        # Auth middleware
```
