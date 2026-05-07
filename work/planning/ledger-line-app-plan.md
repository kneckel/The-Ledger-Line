# The Ledger Line — App Plan

_Last updated: 2026-05-06_

## 1. Overview

A two-sided web app that lets **Reneé Bruce, Regional Head of Compliance and Reporting** (non-technical), do two things:

- **Compose** financial-compliance newsletters via a guided form, one editor per slot, with sections pre-filled from past issues
- **View** a library of drafts and published issues, accessible from any machine

Published issues can be shared via unauthenticated link. Distribution today is PDF over email, so PDF fidelity is the priority export.

**About the author:**
- Reneé Bruce — Regional Head of Compliance and Reporting (formerly Regional Finance Director; recently transitioned)
- Profile photo: `src/assets/renee-profile.png`
- Her name and role appear as the standing author on the Welcome letter

## 2. Brand

**Name:** *The Ledger Line — Financial Compliance · Insight · Integrity*

**Voice:** approachable, "make compliance make sense", with friendly competition (quizzes, awards). Engaging, fun, interactive.

**Visual DNA** (drawn from `D:\Downloads\compliance_newsletter_vol1.pdf`):
- Cream body background
- Deep teal/navy headers
- Orange/gold accent pops
- Dark stat-callout cards with gold numbers
- Pull quotes with left vertical bar
- Status pills (Strong / Developing / At Risk)
- Calendar table with "DD Mmm" date format

**Content structure** (drawn from `D:\Downloads\The_Ledger_Line_Issue_01 (10).docx`).

## 3. Locked decisions

| Decision | Choice |
|---|---|
| Templates | Strict slots (not free-form) |
| Cadence | Both monthly AND quarterly + special/annual/onboarding variants |
| Generation | **Form-driven, no AI.** One editor per slot. Slot `prompt_hint` / length bounds become UI placeholders. |
| Past-issue pre-fill | New issues default to a copy of the most-recent published issue of the same template. Reneé can override and pick a specific past issue, or start blank. |
| Quiz interactivity | Printable only — blank checklist + answer key on later page |
| Distribution | PDF via email (today) — PDF is priority export |
| Public share | Unauthenticated `/n/<share_token>` route, PDF download button |
| People photos | Saved roster (`people` table) — no re-upload across issues |
| Out of scope | Subscribers list, email-sending infra, AI generation |

## 4. Architecture

- **Frontend:** Vite + React 18 + TypeScript + Tailwind + React Router (keep current scaffold stack)
- **Auth + DB + Storage:** Supabase
- **AI:** none. Generation is deterministic — form input + past-issue inheritance.
- **PDF rendering:** Puppeteer in a Vercel serverless function rendering an HTML preview route
- **DOCX:** `docx` npm library
- **Markdown:** trivial template fill
- **Hosting:** Vercel
- **Supabase project:** `zzewpichxvfadsueprhu` (already wired in `.env`)
- **No** Supabase Edge Functions in scope. **No** AI provider keys.

## 5. Database schema (draft)

```
templates                    Static catalog (seeded)
  id, name, cadence, slot_spec JSONB, cover_style JSONB

newsletters                  One per issue
  id, user_id, template_id, title, issue_number, period_label,
  status (draft|published), share_token, sections JSONB,
  inputs JSONB, created_at, updated_at, published_at

newsletter_versions          Snapshot on every save
  id, newsletter_id, sections JSONB, created_at

people                       Roster for Champion/awardee photos
  id, user_id, name, role, photo_url, notes

assets                       Generic uploads (logos, supplemental images)
  id, user_id, kind, file_path, original_filename, mime_type

exports                      Rendered PDF/DOCX/MD per published issue
  id, newsletter_id, format (pdf|docx|md), file_path, generated_at

settings                     Per-user app config (author profile, brand kit)
  user_id, author_name, author_role, author_photo_url, brand JSONB
  -- seeded with: name="Reneé Bruce", role="Regional Head of Compliance and Reporting",
  -- photo="src/assets/renee profile pic.png"
```

**RLS policies:**
- All tables: owner (`user_id = auth.uid()`) sees own
- `newsletters`: anonymous can SELECT rows where `status = 'published'` AND `share_token = <param>`
- `exports`: anonymous can SELECT exports of published newsletters via signed-URL flow

## 6. Slot library

Each slot is a typed JSON shape Reneé fills via a per-slot editor. The renderer maps slot name → component.

| Slot | Shape | Notes |
|---|---|---|
| `cover` | `{ kicker, title, subtitle, issue_number, period_label, toc[] }` | TOC auto-built from following slots |
| `welcome_letter` | `{ heading, author, body }` (80–150w) | Author = Reneé Bruce, Regional Head of Compliance and Reporting (from `settings`) |
| `feature_article` | `{ kicker, title, standfirst, body, pull_quotes[1-2], stat_callouts[2-3] }` (400–700w body) | |
| `corner_office` | `{ author_name, author_role, author_photo_ref, title, standfirst, body, closing_line }` (300–450w) | Rotating column — Regional Director / SME guests; resolves through `people` roster |
| `policy_refresher` | `{ title, owner, what_it_says, why_it_exists, what_you_do[] }` | |
| `spot_the_red_flag` | `{ scenario, blanks[4-6], answer_key[] }` | Answer key rendered on later page |
| `compliance_champion` | `{ person_ref, why_recognized, quote }` | `person_ref` resolves to roster |
| `audit_radar` | `{ intro, timeline[] }` | Each item: `{ date, name, country }` |
| `award_announcement` | `{ title, paths[], prize, deadline }` | |
| `dates_to_remember` | `{ rows[] }` | Each row: `{ date, event, category, jurisdiction }` |
| `quick_hits` | `{ items[4-6] }` | Each item: `{ headline, body }` |
| `closing_cta` | `{ message, contact }` | |

Each slot also carries `hint` (originally a prompt hint for AI; now used as the UI **placeholder / helper text** in the form) and length bounds (used as **soft warnings** in the editor — "this section is usually 300–450 words").

## 7. Templates (12 total)

| # | Template | Cadence | Slot composition (high level) |
|---|---|---|---|
| 1 | Quarterly Edition (master) | quarterly | All 12 slots |
| 2 | Monthly Edition | monthly | feature, policy, dates, quick hits, closing |
| 3 | Year-in-Review | annual | feature (recap), wins, risks, awards, outlook |
| 4 | Regulatory Alert | special | alert banner, what changed, who's affected, deadlines, what to do, FAQ |
| 5 | FD Quarterly Letter | quarterly | corner_office (extended), KPI sidebar |
| 6 | Country Spotlight | special | jurisdiction profile, landscape, changes, contacts, calendar |
| 7 | Audit Readiness Edition | special | timeline, top findings, prep checklist, FAQ |
| 8 | Policy Pack | monthly | 3–5 policy refreshers, quiz |
| 9 | Welcome / Onboarding Edition | onboarding | who-we-are, first-30-days, contacts, glossary, quiz |
| 10 | Risk & Red Flags Edition | special | multi-scenario quiz, risk radar, escalation paths |
| 11 | Year-End Awards | annual | Gold Standard winners, champion roster, leaderboard |
| 12 | CEO/Board Briefing | special | exec summary, KPIs, top risks, one-page |

## 8. Composition algorithm

Deterministic, no AI. The "algorithm" is form + inheritance:

1. **New issue creation:** Reneé picks a template. The app finds the **most-recent published issue of the same template** for her user_id and pre-fills `sections` with a deep copy of its content. If none exists, sections start empty.
2. **Pre-fill source override:** before pre-filling, the create dialog also offers "use a specific past issue" (drop-down of her own past issues for that template) and "start blank".
3. **Per-slot form:** each slot type has a tailored editor:
   - `welcome_letter`, `feature_article`, `corner_office`, `policy_refresher` (the prose blocks within), `closing_cta` → **rich-text editor** (no markdown exposed)
   - `dates_to_remember`, `audit_radar` → **table editor** (add/remove/reorder rows)
   - `quick_hits` → **item list** (headline + body)
   - `compliance_champion` → **person picker** from the `people` roster + recognition text + quote
   - `spot_the_red_flag` → scenario textarea + 4–6 blanks + answer key list
   - `cover` → mostly auto-built (title, kicker, period, TOC). Reneé just confirms / tweaks the kicker.
4. **Per-slot reset actions:** "reset to last issue" and "reset to template default" — replace per-section regenerate.
5. **Auto-save:** every change saves a snapshot row into `newsletter_versions`.
6. **Renderer** maps `slot_type → React component`. Same `sections` JSON renders to web view, PDF, DOCX, and MD.

## 9. Roadmap

### Phase 1 — Schema + secure plumbing  ✅ done (2026-05-06)

**Done:**
- Replaced `supabase/migrations/0001_initial_schema.sql` — drops the old subscribers/newsletters scaffold and creates `templates`, `settings`, `people`, `assets`, `newsletters`, `newsletter_versions`, `exports`. Includes RLS, share-token logic for public read of published issues, Storage buckets `assets/` and `exports/` with per-user folder policies, and seeds all 12 templates with their `slot_spec`.
- Deleted `src/services/subscriber.service.ts`, `src/hooks/useSubscribers.ts`, `src/pages/SubscribersPage.tsx`.
- Rewrote `src/types/database.types.ts` for the new schema (used `type` aliases throughout — interfaces don't structurally satisfy Supabase's `Record<string, unknown>` constraints).
- Added `src/services/template.service.ts` and `src/hooks/useTemplates.ts`.
- Updated `src/App.tsx`, `src/components/layout/AppLayout.tsx` (rebranded to *The Ledger Line*, removed subscribers nav), `src/pages/DashboardPage.tsx`, `src/pages/NewslettersPage.tsx`, `src/pages/EditorPage.tsx` (Phase-1 thin form: pick a template + set title/period; the wizard lands in Phase 3).
- Updated `package.json` so `npm run typecheck` actually checks (was a no-op).
- `npm run build` is green.
- ~~Edge Function scaffold for AI generation~~ — was created in Phase 1 then **removed** when the plan pivoted away from AI. No Edge Functions remain.

**Pre-existing nit (not Phase 1 scope):** `npm run lint` fails because ESLint v9 expects `eslint.config.js` but the scaffold ships with no config. Defer.

**User actions required to actually run the new schema:**
- Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor for project `zzewpichxvfadsueprhu` (or `supabase db push` via CLI). It is destructive — drops the old tables.

### Phase 2 — Slot library + template renderer  ✅ done (2026-05-06)

**Done:**
- **Brand kit:** `tailwind.config.js` extended with `brand.*` palette (cream, ink, orange, gold, gold-bright, teal, coral, card-dark, cream-2). Google Fonts (Playfair Display + Inter) wired in `index.html`. Component layer in `src/index.css` adds `.newsletter-doc` and helper classes (`.nl-kicker`, `.nl-pull-quote`, `.nl-stat-card`, `.nl-cal`, etc.) so newsletter styling is scoped and doesn't bleed into app chrome.
- **Section content types:** `src/types/sections.ts` — discriminated union over `_type`, one shape per slot (`CoverContent`, `WelcomeLetterContent`, `FeatureArticleContent`, …). Includes shared fragments: `PullQuote`, `StatCallout`, `CalendarRow`, `AuditRadarItem`, `QuickHit`, `PolicyAction`.
- **12 slot components** in `src/components/newsletter/slots/`: `CoverSlot` (with auto-generated TOC + last-word-in-gold title), `WelcomeLetterSlot`, `FeatureArticleSlot` (pull quotes + stat callouts grid), `CornerOfficeSlot` (photo column + body), `PolicyRefresherSlot` (three-column WHAT/WHY/HOW), `SpotTheRedFlagSlot` (scenario + blank checklist + answer-key reveal), `ComplianceChampionSlot`, `AuditRadarSlot` (vertical timeline with orange bullets), `AwardAnnouncementSlot` (dark card), `DatesToRememberSlot` (zebra-striped calendar table), `QuickHitsSlot`, `ClosingCtaSlot` (dark band footer). Plus a shared `RichBody` for HTML/plain-text rendering.
- **Sample / placeholder content** in `src/components/newsletter/sample-content.ts` — `defaultContent(slotType, hint)` returns a placeholder shape so empty slots still render structure; the slot's `hint` from the template seed becomes the placeholder text.
- **Renderer** in `src/components/newsletter/Newsletter.tsx`: walks `template.slot_spec.slots` in order, dispatches to the right slot component by `slot.type`, builds the cover TOC automatically, and appends an answer-key page if any quiz slots exist.
- **Preview route + page:** new `/newsletters/:id/preview` route → `PreviewPage.tsx`, which loads the newsletter, its template, the author's `settings`, and the `people` roster, then hands them to `NewsletterRenderer`. Editor page now has a **Preview** button next to Save.
- New services + helpers: `src/services/template.service.ts#getById`, `src/services/settings.service.ts`, `src/services/people.service.ts`.
- `npm run build` is green (105 modules, ~407 KB JS / ~20 KB CSS bundled).

**To try it:** `npm run dev`, sign in, create a draft (any template), click **Preview**. Empty slots render as structured placeholders so you can see the brand styling immediately. Filling content lands in Phase 3.

### Phase 3 — Create flow + section editors  ✅ done (2026-05-06)

**Done:**
- **Editor primitives** in `src/components/editor/primitives/`: `TextField`, `TextArea` (with word-count + min/max target), `ListEditor` (generic add/remove/reorder), `PersonPicker` (dropdown from `people` roster + inline "Add new" with photo upload to Supabase Storage).
- **12 per-slot editors** in `src/components/editor/slots/`: `CoverEditor`, `WelcomeLetterEditor`, `FeatureArticleEditor` (with pull-quote + stat-callout list editors), `CornerOfficeEditor` (with PersonPicker), `PolicyRefresherEditor` (three columns), `SpotTheRedFlagEditor` (scenario / blanks / answer key), `ComplianceChampionEditor`, `AuditRadarEditor` (timeline), `AwardAnnouncementEditor`, `DatesToRememberEditor` (calendar table), `QuickHitsEditor`, `ClosingCtaEditor`.
- **`SlotEditorCard`** wrapper that gives every section a header (number, name, hint), collapse/expand, "Reset to last issue" (when applicable), and "Reset" (to template default with confirmation).
- **EditorPage rewritten:**
  - **New mode:** template picker + title/period + **pre-fill source picker** (Most recent published / specific past issue / Start blank). On Create, sections are deep-copied from the chosen source.
  - **Edit mode:** title/period inputs + accordion of all 12 slot editors in template order, **auto-save** debounced 1s after the last keystroke, save indicator (Saving… / Saved / Save failed), each save also writes a snapshot to `newsletter_versions`.
- **Settings page** at `/settings` (sidebar nav added): author profile (name, role, photo upload) + people roster CRUD. Profile feeds the Welcome letter byline; roster powers the Compliance Champion / Corner Office pickers.
- New service methods: `newsletterService.findPrefillSource`, `newsletterService.listForTemplate`, `newsletterService.snapshot`.
- New helper: `useDebouncedCallback` for the auto-save timer.
- `npm run build` is green (126 modules).

### Phase 4 — Side-by-side preview + roster management
- Live HTML preview pane next to the section editor
- People roster CRUD (Compliance Champion / Corner Office picks pull from here)
- Author profile screen (edits the `settings` row used in the Welcome letter)

### Phase 5 — Export pipeline
- PDF (priority): Puppeteer rendering the HTML preview route → store in Supabase Storage
- DOCX: `docx` library
- MD: simple template fill
- Stored in `exports` table; download buttons

### Phase 6 — Library + public share
- List view: drafts + published, search/filter, duplicate-as-next-issue
- Public route `/n/<share_token>` rendering printable HTML + Download PDF button
- Open Graph metadata for nice link unfurls

### Phase 7 — Polish
- Plain-language errors
- Onboarding tour
- Empty states with examples
- Confirmation dialogs on destructive actions

## 10. Out of scope (for now)

- AI generation of section content (Claude / OpenAI / etc.)
- Subscriber list & in-app email sending (Reneé distributes via her own email)
- Interactive web quiz with answer-checking
- Open/click analytics
- Multi-user collaboration on a single newsletter
- Scheduling auto-publish

## 11. Open items / decisions still pending

- [ ] Author profile fields needed in `settings` beyond name/role/photo — e.g. signature image, preferred sign-off line?
- [ ] Confirm exact brand color hex values once we move into Phase 2 styling
- [ ] Rich-text editor choice for prose slots (TipTap vs. Lexical vs. simple contenteditable). Will decide in Phase 3.

## 12. Reference files

- `D:\Downloads\compliance_newsletter_vol1.pdf` — visual style reference
- `D:\Downloads\The_Ledger_Line_Issue_01 (10).docx` — content structure reference
