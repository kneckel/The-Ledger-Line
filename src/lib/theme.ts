// =============================================================================
// Per-template theming.
//
// Each template can supply a `theme` object inside its `cover_style` JSONB.
// We resolve it (with defaults) and apply it as CSS variables on the root
// `.newsletter-doc` element so every slot picks up the colors automatically.
// =============================================================================

import type { Template } from '@/types/database.types';

export interface NewsletterTheme {
  hero: string;       // Cover hero background, table headers
  accent1: string;    // Primary accent — orange in the default
  accent2: string;    // Secondary accent — gold
  accent3: string;    // Tertiary accent — teal
}

export const DEFAULT_THEME: NewsletterTheme = {
  hero: '#1B3A4B',
  accent1: '#E54E2C',
  accent2: '#E9B341',
  accent3: '#1F786E',
};

// Per-template theme variations so the 12 templates feel distinct.
const THEME_BY_SLUG: Record<string, Partial<NewsletterTheme>> = {
  'quarterly-edition': {},                                                                  // default
  'monthly-edition':            { accent1: '#E54E2C', accent3: '#16344A' },                 // orange-forward
  'year-in-review':             { hero: '#16344A', accent1: '#C8A24F', accent2: '#E9B341' },// gold-heavy
  'regulatory-alert':           { hero: '#7A2A1A', accent1: '#E54E2C', accent2: '#E9B341' },// urgent red-tinted
  'directors-quarterly-letter': { hero: '#16344A', accent1: '#E9B341' },                    // navy/gold
  'country-spotlight':          { hero: '#1A5C56', accent3: '#E9B341' },                    // teal-forward
  'audit-readiness':            { hero: '#16344A', accent1: '#E54E2C' },                    // navy/orange
  'policy-pack':                {},                                                          // default
  'welcome-onboarding':         { hero: '#1F786E', accent1: '#E54E2C' },                    // teal hero
  'risk-and-red-flags':         { hero: '#1B3A4B', accent1: '#C8341A' },                    // deeper red
  'year-end-awards':            { hero: '#16344A', accent1: '#E9B341', accent2: '#F4C460' },// gold dominant
  'exec-board-briefing':        { hero: '#16344A', accent1: '#5F7E8C', accent3: '#E9B341' },// minimalist
};

export function resolveTheme(template: Template): NewsletterTheme {
  const fromCoverStyle =
    (template.cover_style as { theme?: Partial<NewsletterTheme> } | undefined)?.theme ?? {};
  const fromSlug = THEME_BY_SLUG[template.slug] ?? {};
  return {
    ...DEFAULT_THEME,
    ...fromSlug,
    ...fromCoverStyle, // DB override wins
  };
}

export function themeToCssVars(theme: NewsletterTheme): React.CSSProperties {
  return {
    ['--theme-hero' as string]: theme.hero,
    ['--theme-accent-1' as string]: theme.accent1,
    ['--theme-accent-2' as string]: theme.accent2,
    ['--theme-accent-3' as string]: theme.accent3,
  };
}
