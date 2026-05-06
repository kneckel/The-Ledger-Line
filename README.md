# Newsletter App

A scaffolded React app for creating and sending newsletters.
**Stack:** Vite + React 18 + TypeScript + Tailwind + React Router · Supabase (auth + Postgres) · Vercel.

## Project structure

```
newsletter-app/
├── public/                       Static assets
├── src/
│   ├── components/
│   │   ├── layout/               AppLayout, ProtectedRoute
│   │   ├── newsletter/           (placeholder — drop editor/preview pieces here)
│   │   ├── subscribers/          (placeholder — list/import pieces)
│   │   └── ui/                   (placeholder — buttons, inputs, etc.)
│   ├── contexts/AuthContext.tsx  Supabase session provider
│   ├── hooks/                    useNewsletters, useSubscribers
│   ├── lib/supabase.ts           Typed Supabase client
│   ├── pages/                    Route components
│   ├── services/                 newsletter.service, subscriber.service (DB layer)
│   ├── types/database.types.ts   DB types (regenerate from Supabase)
│   ├── App.tsx                   Routes
│   └── main.tsx                  Entry
├── supabase/
│   └── migrations/0001_initial_schema.sql   Tables + RLS policies
├── .env.example
├── vercel.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting started

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the contents of `supabase/migrations/0001_initial_schema.sql`. This creates the `newsletters` and `subscribers` tables with row-level security so each user only sees their own rows.
3. Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings → API).

```bash
cp .env.example .env
```

### 3. Run the dev server

```bash
npm run dev
```

Open `http://localhost:5173`. Sign up with email + password — Supabase will send a confirmation link. Once confirmed, you'll land on the dashboard.

### 4. Regenerate DB types (optional but recommended)

After any schema change, regenerate `src/types/database.types.ts` so the Supabase client stays typed:

```bash
export SUPABASE_PROJECT_ID=your-project-ref
npm run supabase:types
```

(Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and logged in.)

### 5. Deploy to Vercel

```bash
vercel
```

Vercel will detect Vite from `vercel.json`. Set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars in the project's settings. The `rewrites` rule in `vercel.json` makes client-side routing work on deep links.

## What's wired up

- **Auth** — email/password sign in & sign up via Supabase, session persisted, `ProtectedRoute` guards app pages, sign-out in sidebar.
- **Newsletters CRUD** — list, create, edit, with auto-save target. Status enum (`draft` / `scheduled` / `sent` / `archived`).
- **Subscribers CRUD** — add, list, status enum (`active` / `unsubscribed` / `bounced`), tags array column.
- **RLS** — every query is scoped to `auth.uid() = user_id`. The DB enforces it; the service layer just adds ergonomics.
- **Path alias** — `@/` resolves to `src/`.

## What's intentionally not done

These are next steps to pick up with Claude Code:

- **Sending email.** The `sent` status exists but no provider is wired in. Plug in Resend, Postmark, or AWS SES — probably as a Supabase Edge Function so the API key stays server-side.
- **Rich editor.** The editor is a textarea right now. Drop in TipTap, Lexical, or a markdown editor of your choice.
- **Preview.** A preview pane that renders the content as the email will appear.
- **Templates.** A `templates` table + UI to start newsletters from a saved template.
- **Scheduling.** `scheduled_for` exists on the schema; a cron-triggered Edge Function can pick up due newsletters.
- **Subscriber import.** CSV upload for the subscribers page.
- **Analytics.** Open/click tracking — needs the email provider plus a tracking endpoint.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Type-check without building |
| `npm run lint` | Run ESLint |
| `npm run supabase:types` | Regenerate DB types from Supabase |
