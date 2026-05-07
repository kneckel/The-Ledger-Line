// =============================================================================
// Section content types — what each slot's data looks like inside
// `newsletters.sections`.
//
// `sections` is keyed by the slot's `name` (from the template's slot_spec).
// The matching `type` (also in slot_spec) selects which renderer to use.
// =============================================================================

import type { SlotType } from './database.types';

// ---------------------------------------------------------------------------
// Shared content fragments
// ---------------------------------------------------------------------------
export interface PullQuote {
  text: string;
  attribution?: string;
}

export interface StatCallout {
  value: string;       // "+22%", "$1.8M", "3.4×", "78%"
  label: string;       // "COMPLIANCE SPEND INCREASE — 18 MONTHS"
}

export interface CalendarRow {
  date: string;        // free text, e.g. "12 Jun" or "1 Jul 2026"
  event: string;
  category?: string;   // e.g. "Filing Deadline", "Training"
  jurisdiction?: string;
}

export interface AuditRadarItem {
  date: string;
  name: string;
  country?: string;
}

export interface QuickHit {
  headline: string;
  body: string;
}

export interface PolicyAction {
  text: string;
}

// Stored in newsletters.sections by slot name. Always includes `_type` so a
// renderer can dispatch even if the slot_spec is unavailable at render time.
export type SectionContent =
  | CoverContent
  | WelcomeLetterContent
  | FeatureArticleContent
  | CornerOfficeContent
  | PolicyRefresherContent
  | SpotTheRedFlagContent
  | ComplianceChampionContent
  | AuditRadarContent
  | AwardAnnouncementContent
  | DatesToRememberContent
  | QuickHitsContent
  | ClosingCtaContent;

interface BaseContent {
  _type: SlotType;
}

// ---------------------------------------------------------------------------
// Per-slot shapes
// ---------------------------------------------------------------------------
export interface CoverContent extends BaseContent {
  _type: 'cover';
  kicker?: string;          // "LATAM & CARIBBEAN REGION — INTRODUCTORY ISSUE"
  title: string;            // "The Ledger Line"
  subtitle?: string;        // "Financial Compliance · Insight · Integrity"
  // toc is auto-built from later slots at render time; not stored here.
}

export interface WelcomeLetterContent extends BaseContent {
  _type: 'welcome_letter';
  heading?: string;         // "From the Desk of the Regional Compliance Manager"
  body: string;             // rich-text HTML
  // Snapshot of the author at publish time so the public share route — which
  // can't read the owner's settings row — still shows the right byline.
  author_name?: string;
  author_role?: string;
  author_photo_url?: string | null;
}

export interface FeatureArticleContent extends BaseContent {
  _type: 'feature_article';
  kicker?: string;          // "FEATURE · AML & FINANCIAL COMPLIANCE"
  title: string;
  standfirst?: string;
  byline?: string;          // "Regional Compliance Desk"
  body: string;             // rich-text HTML
  pull_quotes?: PullQuote[];
  stat_callouts?: StatCallout[];
}

export interface CornerOfficeContent extends BaseContent {
  _type: 'corner_office';
  person_id?: string | null; // FK into people roster
  // Snapshot copies in case the roster row changes later:
  author_name?: string;
  author_role?: string;
  author_photo_url?: string | null;
  title: string;
  standfirst?: string;
  body: string;             // rich-text HTML
  closing_line?: string;
}

export interface PolicyRefresherContent extends BaseContent {
  _type: 'policy_refresher';
  title: string;
  owner?: string;           // "Director of Group Risk Management"
  what_it_says: string;     // rich-text HTML
  why_it_exists: string;    // rich-text HTML
  what_you_do: PolicyAction[];
}

export interface SpotTheRedFlagContent extends BaseContent {
  _type: 'spot_the_red_flag';
  scenario: string;         // rich-text HTML
  blanks: number;           // how many "Red flag #N: ___" lines to render
  answer_key: string[];     // each entry = one paragraph in the answer key page
  submission_note?: string; // "Submit your answers to compliance@... by 30 Jun"
}

export interface ComplianceChampionContent extends BaseContent {
  _type: 'compliance_champion';
  person_id?: string | null;
  // Snapshot copies in case the roster row changes:
  person_name?: string;
  person_role?: string;
  person_photo_url?: string | null;
  why_recognized: string;   // rich-text HTML
  quote?: string;
}

export interface AuditRadarContent extends BaseContent {
  _type: 'audit_radar';
  intro?: string;
  timeline: AuditRadarItem[];
}

export interface AwardAnnouncementContent extends BaseContent {
  _type: 'award_announcement';
  title: string;
  tagline?: string;          // "Annual recognition for the strongest audit performance"
  paths?: string[];          // "Lowest finding count", "Best overall report"
  prize?: string;
  deadline?: string;
}

export interface DatesToRememberContent extends BaseContent {
  _type: 'dates_to_remember';
  intro?: string;
  rows: CalendarRow[];
}

export interface QuickHitsContent extends BaseContent {
  _type: 'quick_hits';
  heading?: string;
  items: QuickHit[];
}

export interface ClosingCtaContent extends BaseContent {
  _type: 'closing_cta';
  message: string;
  contact?: string;          // "compliance-newsletter@example"
}

// ---------------------------------------------------------------------------
// Helper: discriminate by slot type
// ---------------------------------------------------------------------------
export type SectionContentByType = {
  cover: CoverContent;
  welcome_letter: WelcomeLetterContent;
  feature_article: FeatureArticleContent;
  corner_office: CornerOfficeContent;
  policy_refresher: PolicyRefresherContent;
  spot_the_red_flag: SpotTheRedFlagContent;
  compliance_champion: ComplianceChampionContent;
  audit_radar: AuditRadarContent;
  award_announcement: AwardAnnouncementContent;
  dates_to_remember: DatesToRememberContent;
  quick_hits: QuickHitsContent;
  closing_cta: ClosingCtaContent;
};
