// Default placeholder content per slot type.
// Used by the renderer when `sections[slot_name]` is empty so the FD can see
// the newsletter structure before she's filled it in.

import type { SectionContent, SectionContentByType } from '@/types/sections';
import type { SlotType } from '@/types/database.types';

const PLACEHOLDER = '<em>Section content will appear here.</em>';

export function defaultContent(slotType: SlotType, hint?: string): SectionContent {
  const placeholderBody = hint ? `<em>${escape(hint)}</em>` : PLACEHOLDER;

  switch (slotType) {
    case 'cover':
      return {
        _type: 'cover',
        kicker: 'THE LEDGER LINE',
        title: 'The Ledger Line',
        subtitle: 'Financial Compliance · Insight · Integrity',
      } satisfies SectionContentByType['cover'];

    case 'welcome_letter':
      return {
        _type: 'welcome_letter',
        heading: 'Welcome to This Edition',
        body: placeholderBody,
      } satisfies SectionContentByType['welcome_letter'];

    case 'feature_article':
      return {
        _type: 'feature_article',
        kicker: 'FEATURE',
        title: 'Feature article title',
        standfirst: hint || 'A one-line standfirst that sets up the piece.',
        byline: 'Regional Compliance Desk',
        body: placeholderBody,
        pull_quotes: [],
        stat_callouts: [],
      } satisfies SectionContentByType['feature_article'];

    case 'corner_office':
      return {
        _type: 'corner_office',
        person_id: null,
        title: 'Article title',
        standfirst: hint || 'A one-line standfirst.',
        body: placeholderBody,
        closing_line: '',
      } satisfies SectionContentByType['corner_office'];

    case 'policy_refresher':
      return {
        _type: 'policy_refresher',
        title: 'Policy title',
        owner: '',
        what_it_says: placeholderBody,
        why_it_exists: placeholderBody,
        what_you_do: [],
      } satisfies SectionContentByType['policy_refresher'];

    case 'spot_the_red_flag':
      return {
        _type: 'spot_the_red_flag',
        scenario: placeholderBody,
        blanks: 4,
        answer_key: [],
      } satisfies SectionContentByType['spot_the_red_flag'];

    case 'compliance_champion':
      return {
        _type: 'compliance_champion',
        person_id: null,
        why_recognized: placeholderBody,
        quote: '',
      } satisfies SectionContentByType['compliance_champion'];

    case 'audit_radar':
      return {
        _type: 'audit_radar',
        intro: hint || 'The audit calendar — visual.',
        timeline: [],
      } satisfies SectionContentByType['audit_radar'];

    case 'award_announcement':
      return {
        _type: 'award_announcement',
        title: 'Award title',
        tagline: hint || 'Recognition tagline',
        paths: [],
        prize: '',
        deadline: '',
      } satisfies SectionContentByType['award_announcement'];

    case 'dates_to_remember':
      return {
        _type: 'dates_to_remember',
        intro: hint || '',
        rows: [],
      } satisfies SectionContentByType['dates_to_remember'];

    case 'quick_hits':
      return {
        _type: 'quick_hits',
        heading: '',
        items: [],
      } satisfies SectionContentByType['quick_hits'];

    case 'closing_cta':
      return {
        _type: 'closing_cta',
        message: 'Have a topic, question, or shout-out for a colleague? Write to us.',
        contact: '',
      } satisfies SectionContentByType['closing_cta'];
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
