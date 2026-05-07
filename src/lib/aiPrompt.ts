// =============================================================================
// AI prompt generator + import validator.
//
// `buildPrompt` produces a self-contained prompt the user can paste into
// claude.ai (or any LLM) to draft a whole issue. The model is asked to return
// a single JSON object keyed by slot name; `parseImport` validates the
// returned JSON and returns sections that can be merged into newsletters.sections.
// =============================================================================

import type { Newsletter, Template } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';

// ---------------------------------------------------------------------------
// Slot-type shape reference. Pasted at the bottom of every prompt so the
// model knows what fields each slot expects.
// ---------------------------------------------------------------------------
const SLOT_TYPE_REFERENCE = `
=== SLOT TYPE REFERENCE ===

cover:
  { "_type": "cover", "kicker"?: string, "title": string, "subtitle"?: string }

welcome_letter:
  { "_type": "welcome_letter", "heading"?: string, "body": string }

feature_article:
  {
    "_type": "feature_article",
    "kicker"?: string,
    "title": string,
    "standfirst"?: string,
    "byline"?: string,
    "body": string,
    "pull_quotes"?: [{ "text": string, "attribution"?: string }],
    "stat_callouts"?: [{ "value": string, "label": string }]
  }

corner_office:
  {
    "_type": "corner_office",
    "person_id": null,
    "author_name"?: string,
    "author_role"?: string,
    "title": string,
    "standfirst"?: string,
    "body": string,
    "closing_line"?: string
  }
  Note: leave "person_id" as null — the user will pick someone from their roster after import.

policy_refresher:
  {
    "_type": "policy_refresher",
    "title": string,
    "owner"?: string,
    "what_it_says": string,
    "why_it_exists": string,
    "what_you_do": [{ "text": string }]
  }

spot_the_red_flag:
  {
    "_type": "spot_the_red_flag",
    "scenario": string,
    "blanks": number,
    "answer_key": [string, ...],
    "submission_note"?: string
  }

compliance_champion:
  {
    "_type": "compliance_champion",
    "person_id": null,
    "person_name"?: string,
    "person_role"?: string,
    "why_recognized": string,
    "quote"?: string
  }
  Note: leave "person_id" as null — user will pick from roster after import.

audit_radar:
  {
    "_type": "audit_radar",
    "intro"?: string,
    "timeline": [{ "date": string, "name": string, "country"?: string }, ...]
  }

award_announcement:
  {
    "_type": "award_announcement",
    "title": string,
    "tagline"?: string,
    "paths"?: [string, ...],
    "prize"?: string,
    "deadline"?: string
  }

dates_to_remember:
  {
    "_type": "dates_to_remember",
    "intro"?: string,
    "rows": [{ "date": string, "event": string, "category"?: string, "jurisdiction"?: string }, ...]
  }

quick_hits:
  {
    "_type": "quick_hits",
    "heading"?: string,
    "items": [{ "headline": string, "body": string }, ...]
  }

closing_cta:
  {
    "_type": "closing_cta",
    "message": string,
    "contact"?: string
  }

=== END REFERENCE ===
`.trim();

interface BuildOpts {
  template: Template;
  newsletter?: Newsletter;
  context?: string; // user's free-text context block
}

export function buildPrompt({ template, newsletter, context }: BuildOpts): string {
  const slots = template.slot_spec.slots;
  const period = newsletter?.period_label || '[period — e.g. Q2 2026]';
  const issueTitle = newsletter?.title || '[issue title]';

  const sectionLines = slots
    .map((slot, i) => {
      const num = String(i + 1).padStart(2, '0');
      const lengthLine =
        slot.min_words || slot.max_words
          ? `\n    Length: ${slot.min_words ?? '?'}–${slot.max_words ?? '?'} words`
          : '';
      const hintLine = slot.hint ? `\n    Hint: ${slot.hint}` : '';
      return `${num}. "${slot.name}" — type: ${slot.type}${hintLine}${lengthLine}`;
    })
    .join('\n\n');

  return `You are helping me draft *The Ledger Line* — a financial-compliance newsletter for the LATAM & Caribbean region. The voice is approachable, "make compliance make sense", with friendly competition (quizzes, awards). Engaging, fun, professional, but never corporate-speak.

TEMPLATE: ${template.name} (${template.cadence})
ISSUE: ${issueTitle}
PERIOD: ${period}

=== CONTEXT ===
${context && context.trim().length > 0 ? context.trim() : '[Replace this block with your topic, key dates, policies, people to highlight, and any notes you want me to incorporate.]'}
=== END CONTEXT ===

INSTRUCTIONS:
- Output ONE JSON object — no explanation, no markdown fences before or after.
- Keys are the slot names listed below.
- Every value MUST include "_type" matching its slot type.
- Stay within length bounds where given.
- Use British English consistently. Match the warm, plain-English tone of the brand.
- For "spot_the_red_flag", produce a realistic scenario then 4–5 answer-key entries that line up with red flags in the scenario.
- For "stat_callouts", invent plausible stats only if the context contains the source data; otherwise return an empty array.
- For "corner_office" and "compliance_champion", set "person_id" to null (the user picks from their roster after import).
- Do NOT add any keys beyond the slot names below.

SECTIONS TO FILL (in render order):

${sectionLines}

${SLOT_TYPE_REFERENCE}

Now produce the JSON.`;
}

// ---------------------------------------------------------------------------
// Import validation. Accepts the raw text the user pasted, returns either
// validated sections (keyed by slot name) plus per-slot warnings, or an error.
// ---------------------------------------------------------------------------
export interface ImportResult {
  sections: Record<string, SectionContent>;
  imported: string[];
  skipped: { slot: string; reason: string }[];
}

export function parseImport(raw: string, template: Template): ImportResult {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Paste the JSON returned by the model.');

  // Tolerate a fenced ```json ... ``` block in case the model added one.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (e) {
    throw new Error(`Could not parse JSON: ${(e as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON must be an object keyed by slot name.');
  }

  const incoming = parsed as Record<string, unknown>;
  const slots = template.slot_spec.slots;
  const slotByName = new Map(slots.map((s) => [s.name, s]));

  const sections: Record<string, SectionContent> = {};
  const imported: string[] = [];
  const skipped: { slot: string; reason: string }[] = [];

  for (const [slotName, value] of Object.entries(incoming)) {
    const slot = slotByName.get(slotName);
    if (!slot) {
      skipped.push({ slot: slotName, reason: 'Not a slot in this template.' });
      continue;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      skipped.push({ slot: slotName, reason: 'Value is not an object.' });
      continue;
    }
    const content = value as Record<string, unknown>;
    // Coerce _type if missing or wrong.
    if (content._type !== slot.type) content._type = slot.type;
    sections[slotName] = content as unknown as SectionContent;
    imported.push(slotName);
  }

  if (imported.length === 0) {
    throw new Error('No matching slots found in the pasted JSON.');
  }

  return { sections, imported, skipped };
}
