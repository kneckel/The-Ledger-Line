-- =============================================================================
-- The Ledger Line — schema for the AI-generated newsletter app
--
-- Run this in the Supabase SQL editor (or `supabase db push` via CLI).
-- The script is idempotent for the previous scaffold: it drops the old
-- `newsletters` and `subscribers` tables before creating the new shape.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tear down the previous scaffold (subscribers / old newsletters / old enums)
-- -----------------------------------------------------------------------------
drop table if exists public.subscribers cascade;
drop table if exists public.newsletters cascade;
drop type  if exists public.subscriber_status;
drop type  if exists public.newsletter_status;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.newsletter_status as enum ('draft', 'published', 'archived');
create type public.template_cadence  as enum ('monthly', 'quarterly', 'special', 'annual', 'onboarding');
create type public.export_format     as enum ('pdf', 'docx', 'md');
create type public.asset_kind        as enum ('logo', 'image', 'other');

-- -----------------------------------------------------------------------------
-- Templates  (seeded reference data — read-only from the app)
-- -----------------------------------------------------------------------------
create table public.templates (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null default '',
  cadence      public.template_cadence not null,
  slot_spec    jsonb not null,
  cover_style  jsonb not null default '{}'::jsonb,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Per-user app settings (author profile + brand kit)
-- -----------------------------------------------------------------------------
create table public.settings (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  author_name      text not null default '',
  author_role      text not null default '',
  author_photo_url text,
  brand            jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Roster of people the user may spotlight (Compliance Champion / Corner Office)
-- -----------------------------------------------------------------------------
create table public.people (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  role       text not null default '',
  photo_url  text,
  notes      text not null default '',
  created_at timestamptz not null default now()
);
create index people_user_id_idx on public.people(user_id);

-- -----------------------------------------------------------------------------
-- Generic uploaded assets (logos, supplemental images)
-- -----------------------------------------------------------------------------
create table public.assets (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  kind              public.asset_kind not null default 'image',
  file_path         text not null,
  original_filename text,
  mime_type         text,
  created_at        timestamptz not null default now()
);
create index assets_user_id_idx on public.assets(user_id);

-- -----------------------------------------------------------------------------
-- Newsletters (one row per issue) + version history + rendered exports
-- -----------------------------------------------------------------------------
create table public.newsletters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_id   uuid not null references public.templates(id),
  title         text not null default '',
  issue_number  int,
  period_label  text not null default '',
  status        public.newsletter_status not null default 'draft',
  share_token   text unique,
  inputs        jsonb not null default '{}'::jsonb,
  sections      jsonb not null default '{}'::jsonb,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index newsletters_user_id_idx     on public.newsletters(user_id);
create index newsletters_status_idx      on public.newsletters(status);
create index newsletters_share_token_idx on public.newsletters(share_token) where share_token is not null;

create table public.newsletter_versions (
  id            uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.newsletters(id) on delete cascade,
  sections      jsonb not null,
  created_at    timestamptz not null default now()
);
create index newsletter_versions_newsletter_id_idx on public.newsletter_versions(newsletter_id);

create table public.exports (
  id            uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.newsletters(id) on delete cascade,
  format        public.export_format not null,
  file_path     text not null,
  generated_at  timestamptz not null default now()
);
create index exports_newsletter_id_idx on public.exports(newsletter_id);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger newsletters_set_updated_at
  before update on public.newsletters
  for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row-level security
-- -----------------------------------------------------------------------------
alter table public.templates            enable row level security;
alter table public.settings             enable row level security;
alter table public.people               enable row level security;
alter table public.assets               enable row level security;
alter table public.newsletters          enable row level security;
alter table public.newsletter_versions  enable row level security;
alter table public.exports              enable row level security;

-- Templates: readable by everyone (anon + authed). The catalog is shared.
create policy "templates select all"
  on public.templates for select using (true);

-- Settings: owner only
create policy "settings select own" on public.settings for select using (auth.uid() = user_id);
create policy "settings insert own" on public.settings for insert with check (auth.uid() = user_id);
create policy "settings update own" on public.settings for update using (auth.uid() = user_id);

-- People: owner CRUD
create policy "people select own" on public.people for select using (auth.uid() = user_id);
create policy "people insert own" on public.people for insert with check (auth.uid() = user_id);
create policy "people update own" on public.people for update using (auth.uid() = user_id);
create policy "people delete own" on public.people for delete using (auth.uid() = user_id);

-- Assets: owner CRUD
create policy "assets select own" on public.assets for select using (auth.uid() = user_id);
create policy "assets insert own" on public.assets for insert with check (auth.uid() = user_id);
create policy "assets update own" on public.assets for update using (auth.uid() = user_id);
create policy "assets delete own" on public.assets for delete using (auth.uid() = user_id);

-- Newsletters: owner CRUD + anonymous SELECT for published rows with a token.
-- (The app filters by share_token in its query; RLS just unlocks the row class.)
create policy "newsletters select own"            on public.newsletters for select using (auth.uid() = user_id);
create policy "newsletters select published"     on public.newsletters for select using (status = 'published' and share_token is not null);
create policy "newsletters insert own"            on public.newsletters for insert with check (auth.uid() = user_id);
create policy "newsletters update own"            on public.newsletters for update using (auth.uid() = user_id);
create policy "newsletters delete own"            on public.newsletters for delete using (auth.uid() = user_id);

-- Versions: derived from the parent newsletter
create policy "versions select via owner"
  on public.newsletter_versions for select
  using (exists (select 1 from public.newsletters n where n.id = newsletter_id and n.user_id = auth.uid()));
create policy "versions insert via owner"
  on public.newsletter_versions for insert
  with check (exists (select 1 from public.newsletters n where n.id = newsletter_id and n.user_id = auth.uid()));

-- Exports: owner can read/write; anonymous can read exports of published issues
create policy "exports select via owner"
  on public.exports for select
  using (exists (select 1 from public.newsletters n where n.id = newsletter_id and n.user_id = auth.uid()));
create policy "exports select public for published"
  on public.exports for select
  using (exists (select 1 from public.newsletters n where n.id = newsletter_id and n.status = 'published'));
create policy "exports insert via owner"
  on public.exports for insert
  with check (exists (select 1 from public.newsletters n where n.id = newsletter_id and n.user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- Storage buckets (private; access via signed URLs)
-- -----------------------------------------------------------------------------
-- The `assets` bucket holds author / people photos that need to be visible on
-- public share pages (anyone with the share_token can read the newsletter).
-- Read access is public; write access is still scoped to the owner via the
-- storage RLS policies below (per-user folder prefix).
insert into storage.buckets (id, name, public)
  values ('assets',  'assets',  true)
  on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
  values ('exports', 'exports', false)
  on conflict (id) do nothing;

-- Object-level RLS: each user gets a `<user_id>/...` prefix in each bucket.
create policy "assets owner read"   on storage.objects for select
  using (bucket_id = 'assets'  and auth.uid()::text = (storage.foldername(name))[1]);
create policy "assets owner write"  on storage.objects for insert
  with check (bucket_id = 'assets'  and auth.uid()::text = (storage.foldername(name))[1]);
create policy "assets owner update" on storage.objects for update
  using (bucket_id = 'assets'  and auth.uid()::text = (storage.foldername(name))[1]);
create policy "assets owner delete" on storage.objects for delete
  using (bucket_id = 'assets'  and auth.uid()::text = (storage.foldername(name))[1]);

create policy "exports owner read"  on storage.objects for select
  using (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "exports owner write" on storage.objects for insert
  with check (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- Seed: the 12 Ledger Line templates
-- Each template's slot_spec lists the slots in render order.
-- "type" is the renderer; "name" is the slot's identifier within the issue.
-- =============================================================================
insert into public.templates (slug, name, description, cadence, slot_spec) values
  ('quarterly-edition', 'Quarterly Edition', 'Full quarterly issue — the master template, all sections.', 'quarterly',
   $${
     "slots": [
       {"name": "cover",                "type": "cover"},
       {"name": "welcome_letter",       "type": "welcome_letter",       "hint": "Warm welcome from Reneé Bruce introducing the quarter's theme.", "min_words": 80,  "max_words": 150},
       {"name": "feature_article",      "type": "feature_article",      "hint": "The issue's lead story tied to the main topic.",                "min_words": 400, "max_words": 700},
       {"name": "corner_office",        "type": "corner_office",        "hint": "Rotating column from a Regional Director or SME guest.",         "min_words": 300, "max_words": 450},
       {"name": "policy_refresher",     "type": "policy_refresher",     "hint": "One policy explained as WHAT IT SAYS / WHY IT EXISTS / WHAT YOU DO."},
       {"name": "spot_the_red_flag",    "type": "spot_the_red_flag",    "hint": "Short scenario with 4–6 red-flag blanks; answer key shown later in the issue."},
       {"name": "compliance_champion",  "type": "compliance_champion",  "hint": "Spotlight on a recognised colleague — what they did, in their words."},
       {"name": "audit_radar",          "type": "audit_radar",          "hint": "Timeline of audits across the year."},
       {"name": "award_announcement",   "type": "award_announcement",   "hint": "Award programme announcement card."},
       {"name": "dates_to_remember",    "type": "dates_to_remember",    "hint": "Compliance calendar table."},
       {"name": "quick_hits",           "type": "quick_hits",           "hint": "4–6 short news bullets."},
       {"name": "closing_cta",          "type": "closing_cta",          "hint": "Invitation to contribute / contact line."}
     ]
   }$$::jsonb),

  ('monthly-edition', 'Monthly Edition', 'Lean monthly brief — the essentials.', 'monthly',
   $${
     "slots": [
       {"name": "cover",             "type": "cover"},
       {"name": "welcome_letter",    "type": "welcome_letter",    "hint": "Brief monthly note from Reneé.", "min_words": 60, "max_words": 120},
       {"name": "feature_article",   "type": "feature_article",   "hint": "One headline story for the month.", "min_words": 300, "max_words": 500},
       {"name": "policy_refresher",  "type": "policy_refresher",  "hint": "One policy in plain English."},
       {"name": "dates_to_remember", "type": "dates_to_remember", "hint": "Key dates for the month ahead."},
       {"name": "quick_hits",        "type": "quick_hits",        "hint": "3–5 short news bullets."},
       {"name": "closing_cta",       "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('year-in-review', 'Year in Review', 'Annual recap — wins, risks, and the year ahead.', 'annual',
   $${
     "slots": [
       {"name": "cover",                "type": "cover"},
       {"name": "welcome_letter",       "type": "welcome_letter",       "hint": "Year-end note from Reneé reflecting on the year."},
       {"name": "year_recap",           "type": "feature_article",      "hint": "Recap of the year's compliance themes and milestones.",          "min_words": 500, "max_words": 800},
       {"name": "top_wins",             "type": "feature_article",      "hint": "The team's top wins of the year — be specific.",                  "min_words": 300, "max_words": 500},
       {"name": "biggest_risks",        "type": "feature_article",      "hint": "The biggest risks identified this year and how they were handled.", "min_words": 300, "max_words": 500},
       {"name": "award_announcement",   "type": "award_announcement",   "hint": "Reveal of the Gold Standard winners."},
       {"name": "compliance_champion",  "type": "compliance_champion",  "hint": "Standout champion of the year."},
       {"name": "outlook",              "type": "feature_article",      "hint": "Looking ahead — what the next year holds.",                       "min_words": 250, "max_words": 400},
       {"name": "closing_cta",          "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('regulatory-alert', 'Regulatory Alert', 'Single-topic special edition triggered by a regulation change.', 'special',
   $${
     "slots": [
       {"name": "cover",             "type": "cover"},
       {"name": "what_changed",      "type": "feature_article",   "hint": "What changed in plain language; who issued it; effective date.", "min_words": 250, "max_words": 450},
       {"name": "policy_refresher",  "type": "policy_refresher",  "hint": "The new rule explained as WHAT IT SAYS / WHY IT EXISTS / WHAT YOU DO."},
       {"name": "deadlines",         "type": "dates_to_remember", "hint": "All deadlines this regulation introduces."},
       {"name": "faq",               "type": "quick_hits",        "hint": "Frequently asked questions and quick answers."},
       {"name": "closing_cta",       "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('directors-quarterly-letter', 'Director''s Quarterly Letter', 'Extended Corner Office column — a single director''s perspective.', 'quarterly',
   $${
     "slots": [
       {"name": "cover",          "type": "cover"},
       {"name": "corner_office",  "type": "corner_office",     "hint": "Long-form letter from the featured Regional Director or SME.", "min_words": 600, "max_words": 1000},
       {"name": "kpi_sidebar",    "type": "quick_hits",        "hint": "3–5 KPI callouts that frame the letter."},
       {"name": "closing_cta",    "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('country-spotlight', 'Country Spotlight', 'Deep dive on one jurisdiction.', 'special',
   $${
     "slots": [
       {"name": "cover",                  "type": "cover"},
       {"name": "welcome_letter",         "type": "welcome_letter",    "hint": "Why this country, this issue."},
       {"name": "jurisdiction_profile",   "type": "feature_article",   "hint": "Profile of the country: regulator, key laws, recent activity.", "min_words": 400, "max_words": 700},
       {"name": "policy_refresher",       "type": "policy_refresher",  "hint": "The most consequential local rule right now."},
       {"name": "country_calendar",       "type": "dates_to_remember", "hint": "Country-specific dates."},
       {"name": "closing_cta",            "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('audit-readiness', 'Audit Readiness', 'Get-ready edition for the audit cycle.', 'special',
   $${
     "slots": [
       {"name": "cover",             "type": "cover"},
       {"name": "welcome_letter",    "type": "welcome_letter",    "hint": "Set the tone for audit prep."},
       {"name": "audit_radar",       "type": "audit_radar",       "hint": "The full year's audit timeline."},
       {"name": "top_findings",      "type": "feature_article",   "hint": "Top recurring findings to avoid this cycle.",   "min_words": 350, "max_words": 600},
       {"name": "prep_checklist",    "type": "quick_hits",        "hint": "Concise prep checklist — bullets, not prose."},
       {"name": "faq",               "type": "quick_hits",        "hint": "Common audit-prep questions answered."},
       {"name": "closing_cta",       "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('policy-pack', 'Policy Pack', 'Bundle of policy refreshers with a quiz.', 'monthly',
   $${
     "slots": [
       {"name": "cover",              "type": "cover"},
       {"name": "welcome_letter",     "type": "welcome_letter",    "hint": "Why this pack, this month."},
       {"name": "policy_one",         "type": "policy_refresher"},
       {"name": "policy_two",         "type": "policy_refresher"},
       {"name": "policy_three",       "type": "policy_refresher"},
       {"name": "policy_four",        "type": "policy_refresher"},
       {"name": "spot_the_red_flag",  "type": "spot_the_red_flag", "hint": "Quiz that tests the policies just covered."},
       {"name": "closing_cta",        "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('welcome-onboarding', 'Welcome / Onboarding Edition', 'For new joiners — orient them to compliance.', 'onboarding',
   $${
     "slots": [
       {"name": "cover",              "type": "cover"},
       {"name": "welcome_letter",     "type": "welcome_letter",    "hint": "Warm welcome to new joiners; what compliance does and why."},
       {"name": "who_we_are",         "type": "feature_article",   "hint": "Who the regional compliance team is and how to reach them.",       "min_words": 300, "max_words": 500},
       {"name": "first_30_days",      "type": "quick_hits",        "hint": "Bulleted checklist of what to do in the first 30 days."},
       {"name": "key_contacts",       "type": "dates_to_remember", "hint": "Repurposed as a contacts table — name / role / region / contact."},
       {"name": "spot_the_red_flag",  "type": "spot_the_red_flag", "hint": "Easy starter scenario for a new joiner."},
       {"name": "closing_cta",        "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('risk-and-red-flags', 'Risk & Red Flags Edition', 'Multiple scenarios + escalation paths.', 'special',
   $${
     "slots": [
       {"name": "cover",                "type": "cover"},
       {"name": "welcome_letter",       "type": "welcome_letter"},
       {"name": "scenario_one",         "type": "spot_the_red_flag"},
       {"name": "scenario_two",         "type": "spot_the_red_flag"},
       {"name": "scenario_three",       "type": "spot_the_red_flag"},
       {"name": "escalation_paths",     "type": "feature_article",  "hint": "How and when to escalate — with named ownership.", "min_words": 300, "max_words": 500},
       {"name": "closing_cta",          "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('year-end-awards', 'Year-End Awards', 'Spotlight the Gold Standard winners and full champion roster.', 'annual',
   $${
     "slots": [
       {"name": "cover",                  "type": "cover"},
       {"name": "welcome_letter",         "type": "welcome_letter",    "hint": "Frame the year and the awards."},
       {"name": "gold_standard",          "type": "award_announcement","hint": "Reveal of the Gold Standard winners."},
       {"name": "champion_one",           "type": "compliance_champion"},
       {"name": "champion_two",           "type": "compliance_champion"},
       {"name": "champion_three",         "type": "compliance_champion"},
       {"name": "full_roster",            "type": "quick_hits",        "hint": "Honourable mentions — full champion list as bullets."},
       {"name": "closing_cta",            "type": "closing_cta"}
     ]
   }$$::jsonb),

  ('exec-board-briefing', 'CEO / Board Briefing', 'One-pager for executive audiences.', 'special',
   $${
     "slots": [
       {"name": "cover",            "type": "cover"},
       {"name": "exec_summary",     "type": "feature_article",   "hint": "Tight executive summary — 3 themes, no jargon.",    "min_words": 200, "max_words": 350},
       {"name": "kpis",             "type": "quick_hits",        "hint": "5–7 KPI callouts with trend direction."},
       {"name": "top_risks",        "type": "feature_article",   "hint": "Top 3 risks with one sentence of mitigation each.",  "min_words": 200, "max_words": 350},
       {"name": "audit_radar",      "type": "audit_radar",       "hint": "The audit calendar — visual."},
       {"name": "closing_cta",      "type": "closing_cta"}
     ]
   }$$::jsonb)
;
