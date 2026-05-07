// =============================================================================
// Markdown export — pure function from a Newsletter + Template (+ roster) to
// a Markdown string. Triggers a client-side download.
// =============================================================================

import type { Newsletter, Person, Settings, Template } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';
import { defaultContent } from '@/components/newsletter/sample-content';

interface Args {
  newsletter: Newsletter;
  template: Template;
  settings: Settings | null;
  people: Person[];
}

export function buildMarkdown({ newsletter, template, settings, people }: Args): string {
  const sections = (newsletter.sections ?? {}) as Record<string, SectionContent | undefined>;
  const slots = template.slot_spec.slots;
  const out: string[] = [];

  // Frontmatter-ish header
  const issueLine = newsletter.issue_number !== null
    ? `Issue ${String(newsletter.issue_number).padStart(2, '0')}`
    : 'Issue';
  const periodLine = newsletter.period_label || '';
  out.push(`# ${newsletter.title || 'The Ledger Line'}`);
  out.push(`*${issueLine}${periodLine ? ` · ${periodLine}` : ''}*\n`);

  for (const slot of slots) {
    const c = sections[slot.name] ?? defaultContent(slot.type, slot.hint);
    out.push(renderSlot(c, slot.type, settings, people));
  }

  // Answer-key page (mirrors what the renderer does)
  const quizSlots = slots
    .filter((s) => s.type === 'spot_the_red_flag')
    .map((s) => sections[s.name])
    .filter((c): c is SectionContent => Boolean(c));

  const answerEntries = quizSlots
    .map((c) => c as Extract<SectionContent, { _type: 'spot_the_red_flag' }>)
    .filter((c) => c.answer_key.length > 0);

  if (answerEntries.length > 0) {
    out.push('---\n');
    out.push('## Spot the Red Flag — Answer Key\n');
    answerEntries.forEach((entry, i) => {
      if (answerEntries.length > 1) out.push(`### Scenario ${i + 1}`);
      entry.answer_key.forEach((a, j) => {
        out.push(`${j + 1}. ${a}`);
      });
      out.push('');
    });
  }

  return out.join('\n').trim() + '\n';
}

function renderSlot(
  content: SectionContent,
  type: SectionContent['_type'],
  settings: Settings | null,
  people: Person[],
): string {
  const lines: string[] = [];
  switch (type) {
    case 'cover': {
      const c = content as Extract<SectionContent, { _type: 'cover' }>;
      if (c.kicker) lines.push(`> ${c.kicker}\n`);
      lines.push(`# ${c.title}\n`);
      if (c.subtitle) lines.push(`*${c.subtitle}*\n`);
      break;
    }
    case 'welcome_letter': {
      const c = content as Extract<SectionContent, { _type: 'welcome_letter' }>;
      lines.push(`## ${c.heading || 'Welcome'}\n`);
      lines.push(stripHtml(c.body) + '\n');
      if (settings?.author_name) {
        lines.push(`— *${settings.author_name}${settings.author_role ? `, ${settings.author_role}` : ''}*\n`);
      }
      break;
    }
    case 'feature_article': {
      const c = content as Extract<SectionContent, { _type: 'feature_article' }>;
      if (c.kicker) lines.push(`> ${c.kicker}\n`);
      lines.push(`## ${c.title}\n`);
      if (c.standfirst) lines.push(`*${c.standfirst}*\n`);
      if (c.byline) lines.push(`*— ${c.byline}*\n`);
      lines.push(stripHtml(c.body) + '\n');
      c.pull_quotes?.forEach((q) => {
        lines.push(`> "${q.text}"`);
        if (q.attribution) lines.push(`> — *${q.attribution}*`);
        lines.push('');
      });
      if (c.stat_callouts && c.stat_callouts.length > 0) {
        lines.push('| Value | Label |');
        lines.push('| --- | --- |');
        c.stat_callouts.forEach((s) => lines.push(`| **${s.value}** | ${s.label} |`));
        lines.push('');
      }
      break;
    }
    case 'corner_office': {
      const c = content as Extract<SectionContent, { _type: 'corner_office' }>;
      const person = c.person_id ? people.find((p) => p.id === c.person_id) ?? null : null;
      const name = person?.name ?? c.author_name ?? '—';
      const role = person?.role ?? c.author_role ?? '';
      lines.push(`## From the Corner Office — ${c.title}\n`);
      if (c.standfirst) lines.push(`*${c.standfirst}*\n`);
      lines.push(`**${name}**${role ? ` · *${role}*` : ''}\n`);
      lines.push(stripHtml(c.body) + '\n');
      if (c.closing_line) lines.push(`*— ${c.closing_line}*\n`);
      break;
    }
    case 'policy_refresher': {
      const c = content as Extract<SectionContent, { _type: 'policy_refresher' }>;
      lines.push(`## Policy Refresher: ${c.title}\n`);
      if (c.owner) lines.push(`*Owner: ${c.owner}*\n`);
      lines.push(`### What it says`);
      lines.push(stripHtml(c.what_it_says) + '\n');
      lines.push(`### Why it exists`);
      lines.push(stripHtml(c.why_it_exists) + '\n');
      lines.push(`### What you do`);
      c.what_you_do.forEach((a, i) => lines.push(`${i + 1}. ${a.text}`));
      lines.push('');
      break;
    }
    case 'spot_the_red_flag': {
      const c = content as Extract<SectionContent, { _type: 'spot_the_red_flag' }>;
      lines.push(`## Spot the Red Flag\n`);
      lines.push(`### The scenario`);
      lines.push(stripHtml(c.scenario) + '\n');
      lines.push(`### Your spotter's checklist`);
      for (let i = 0; i < c.blanks; i++) {
        lines.push(`- [ ] Red flag #${i + 1}: __________________`);
      }
      lines.push('');
      if (c.submission_note) lines.push(`*${c.submission_note}*\n`);
      break;
    }
    case 'compliance_champion': {
      const c = content as Extract<SectionContent, { _type: 'compliance_champion' }>;
      const person = c.person_id ? people.find((p) => p.id === c.person_id) ?? null : null;
      const name = person?.name ?? c.person_name ?? 'Champion';
      const role = person?.role ?? c.person_role ?? '';
      lines.push(`## Compliance Champion: ${name}\n`);
      if (role) lines.push(`*${role}*\n`);
      lines.push(stripHtml(c.why_recognized) + '\n');
      if (c.quote) lines.push(`> "${c.quote}"\n`);
      break;
    }
    case 'audit_radar': {
      const c = content as Extract<SectionContent, { _type: 'audit_radar' }>;
      lines.push(`## On the Audit Radar\n`);
      if (c.intro) lines.push(`${c.intro}\n`);
      if (c.timeline.length > 0) {
        lines.push('| Date | Audit | Country |');
        lines.push('| --- | --- | --- |');
        c.timeline.forEach((t) =>
          lines.push(`| **${t.date}** | ${t.name} | ${t.country ?? '—'} |`),
        );
        lines.push('');
      }
      break;
    }
    case 'award_announcement': {
      const c = content as Extract<SectionContent, { _type: 'award_announcement' }>;
      lines.push(`## ${c.title}\n`);
      if (c.tagline) lines.push(`*${c.tagline}*\n`);
      if (c.paths && c.paths.length > 0) {
        lines.push('**Two paths to win**');
        c.paths.forEach((p) => lines.push(`- ${p}`));
        lines.push('');
      }
      if (c.prize) {
        lines.push('**What the winner gets**');
        c.prize
          .split(/\n|·/)
          .map((p) => p.trim())
          .filter(Boolean)
          .forEach((p) => lines.push(`- ${p}`));
        lines.push('');
      }
      if (c.deadline) lines.push(`*Contact: ${c.deadline}*\n`);
      break;
    }
    case 'dates_to_remember': {
      const c = content as Extract<SectionContent, { _type: 'dates_to_remember' }>;
      lines.push(`## Dates to Remember\n`);
      if (c.intro) lines.push(`${c.intro}\n`);
      if (c.rows.length > 0) {
        lines.push('| Date | Event | Category | Jurisdiction |');
        lines.push('| --- | --- | --- | --- |');
        c.rows.forEach((r) =>
          lines.push(
            `| **${r.date}** | ${r.event} | ${r.category ?? '—'} | ${r.jurisdiction ?? '—'} |`,
          ),
        );
        lines.push('');
      }
      break;
    }
    case 'quick_hits': {
      const c = content as Extract<SectionContent, { _type: 'quick_hits' }>;
      lines.push(`## ${c.heading || 'Quick Hits — In Case You Missed It'}\n`);
      c.items.forEach((item, i) => {
        lines.push(`**${String(i + 1).padStart(2, '0')}. ${item.headline}**`);
        lines.push(item.body);
        lines.push('');
      });
      break;
    }
    case 'closing_cta': {
      const c = content as Extract<SectionContent, { _type: 'closing_cta' }>;
      lines.push(`---\n`);
      lines.push(`*${c.message}*\n`);
      if (c.contact) lines.push(`**${c.contact}**\n`);
      break;
    }
  }
  return lines.join('\n');
}

function stripHtml(html: string): string {
  if (!html) return '';
  // Quick HTML→text. The body is mostly plain or light HTML; this is good
  // enough for an MD export. Tags get dropped, line breaks preserved.
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<em>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<strong>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// Trigger a download. Pure browser API — no server involved.
// ---------------------------------------------------------------------------
export function downloadMarkdown(args: Args): void {
  const md = buildMarkdown(args);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filenameFor(args.newsletter, 'md');
  a.click();
  URL.revokeObjectURL(url);
}

export function filenameFor(newsletter: Newsletter, ext: string): string {
  const slug = (newsletter.title || 'newsletter')
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const period = (newsletter.period_label || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return [slug || 'newsletter', period].filter(Boolean).join('-') + '.' + ext;
}
