// =============================================================================
// DOCX export — generates a Word document client-side using the `docx` lib.
// The visual fidelity is intentionally simpler than the web/PDF render: Word
// can't reproduce our colored grids and SVG illustrations, so we render the
// content as a clean editorial document with headings, body, and tables.
// =============================================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { Newsletter, Person, Settings, Template } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';
import { defaultContent } from '@/components/newsletter/sample-content';
import { filenameFor } from './markdown-export';

interface Args {
  newsletter: Newsletter;
  template: Template;
  settings: Settings | null;
  people: Person[];
}

// Brand-ish colours (DOCX accepts hex without #)
const C = {
  ink: '1B3A4B',
  inkSoft: '3F4A56',
  orange: 'E54E2C',
  gold: 'E9B341',
  teal: '1F786E',
  rule: 'E2D9C6',
};

export async function downloadDocx(args: Args): Promise<void> {
  const doc = buildDocument(args);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filenameFor(args.newsletter, 'docx'));
}

function buildDocument({ newsletter, template, settings, people }: Args): Document {
  const sections = (newsletter.sections ?? {}) as Record<string, SectionContent | undefined>;
  const slots = template.slot_spec.slots;
  const children: (Paragraph | Table)[] = [];

  // Cover-ish header
  const issueLine =
    newsletter.issue_number !== null
      ? `Issue ${String(newsletter.issue_number).padStart(2, '0')}`
      : 'Issue';
  const periodLine = newsletter.period_label || '';
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: 'THE LEDGER LINE',
          bold: true,
          color: C.orange,
          size: 18,
          characterSpacing: 80,
        }),
      ],
    }),
  );
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: newsletter.title || 'The Ledger Line',
          bold: true,
          color: C.ink,
          size: 56,
        }),
      ],
    }),
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `${issueLine}${periodLine ? ` · ${periodLine}` : ''}`,
          italics: true,
          color: C.inkSoft,
          size: 22,
        }),
      ],
    }),
  );
  children.push(hr());

  for (const slot of slots) {
    const c = sections[slot.name] ?? defaultContent(slot.type, slot.hint);
    children.push(...renderSlot(c, slot.type, settings, people));
    children.push(spacer());
  }

  // Answer-key page
  const quizSlots = slots
    .filter((s) => s.type === 'spot_the_red_flag')
    .map((s) => sections[s.name])
    .filter((c): c is SectionContent => Boolean(c)) as Extract<
    SectionContent,
    { _type: 'spot_the_red_flag' }
  >[];

  const haveAnswers = quizSlots.some((c) => c.answer_key.length > 0);
  if (haveAnswers) {
    children.push(hr());
    children.push(h2('Spot the Red Flag — Answer Key', C.orange));
    quizSlots.forEach((c, i) => {
      if (c.answer_key.length === 0) return;
      if (quizSlots.length > 1) children.push(h3(`Scenario ${i + 1}`));
      c.answer_key.forEach((a, j) =>
        children.push(numbered(`${j + 1}. ${a}`)),
      );
    });
  }

  return new Document({
    creator: settings?.author_name || 'The Ledger Line',
    title: newsletter.title || 'The Ledger Line',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: C.inkSoft },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
          },
        },
        children,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Slot → block conversion
// ---------------------------------------------------------------------------
function renderSlot(
  content: SectionContent,
  type: SectionContent['_type'],
  settings: Settings | null,
  people: Person[],
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  switch (type) {
    case 'cover': {
      // Cover content already rendered as the doc title. Skip.
      const c = content as Extract<SectionContent, { _type: 'cover' }>;
      if (c.kicker) out.push(small(c.kicker, C.orange));
      break;
    }
    case 'welcome_letter': {
      const c = content as Extract<SectionContent, { _type: 'welcome_letter' }>;
      out.push(kicker('FROM THE REGIONAL COMPLIANCE MANAGER'));
      out.push(h2(c.heading || 'Welcome'));
      out.push(...bodyParagraphs(c.body));
      if (settings?.author_name) {
        out.push(
          new Paragraph({
            spacing: { before: 120 },
            children: [
              new TextRun({
                text: `— ${settings.author_name}${
                  settings.author_role ? `, ${settings.author_role}` : ''
                }`,
                italics: true,
                color: C.teal,
              }),
            ],
          }),
        );
      }
      break;
    }
    case 'feature_article': {
      const c = content as Extract<SectionContent, { _type: 'feature_article' }>;
      if (c.kicker) out.push(kicker(c.kicker));
      out.push(h2(c.title));
      if (c.standfirst) out.push(p(c.standfirst, { italics: true, color: C.ink }));
      if (c.byline)
        out.push(p(`— ${c.byline}`, { italics: true, color: C.teal, size: 18 }));
      out.push(...bodyParagraphs(c.body));
      c.pull_quotes?.forEach((q) => out.push(blockquote(q.text, q.attribution)));
      if (c.stat_callouts && c.stat_callouts.length > 0) {
        out.push(spacer());
        out.push(buildTable(
          [['Value', 'Label']],
          c.stat_callouts.map((s) => [s.value, s.label]),
        ));
      }
      break;
    }
    case 'corner_office': {
      const c = content as Extract<SectionContent, { _type: 'corner_office' }>;
      const person = c.person_id ? people.find((p) => p.id === c.person_id) ?? null : null;
      const name = person?.name ?? c.author_name ?? '—';
      const role = person?.role ?? c.author_role ?? '';
      out.push(kicker('FROM THE CORNER OFFICE'));
      out.push(h2(c.title));
      if (c.standfirst) out.push(p(c.standfirst, { italics: true, color: C.ink }));
      out.push(p(`${name}${role ? ` · ${role}` : ''}`, { bold: true }));
      out.push(...bodyParagraphs(c.body));
      if (c.closing_line)
        out.push(p(`— ${c.closing_line}`, { italics: true, color: C.teal }));
      break;
    }
    case 'policy_refresher': {
      const c = content as Extract<SectionContent, { _type: 'policy_refresher' }>;
      out.push(kicker('POLICY REFRESHER · PLAIN ENGLISH. THREE QUESTIONS.'));
      out.push(h2(c.title));
      if (c.owner) out.push(p(`Owner: ${c.owner}`, { italics: true, color: C.inkSoft }));
      out.push(h3('What it says', C.teal));
      out.push(...bodyParagraphs(c.what_it_says));
      out.push(h3('Why it exists', C.orange));
      out.push(...bodyParagraphs(c.why_it_exists));
      out.push(h3('What you do', C.gold));
      c.what_you_do.forEach((a, i) => out.push(numbered(`${i + 1}. ${a.text}`)));
      break;
    }
    case 'spot_the_red_flag': {
      const c = content as Extract<SectionContent, { _type: 'spot_the_red_flag' }>;
      out.push(kicker('SPOT THE RED FLAG'));
      out.push(h2('Compliance puzzle'));
      out.push(h3('The scenario'));
      out.push(...bodyParagraphs(c.scenario));
      out.push(h3("Your spotter's checklist"));
      for (let i = 0; i < c.blanks; i++) {
        out.push(p(`Red flag #${i + 1}: __________________________________________`));
      }
      if (c.submission_note)
        out.push(p(c.submission_note, { italics: true, color: C.inkSoft }));
      break;
    }
    case 'compliance_champion': {
      const c = content as Extract<SectionContent, { _type: 'compliance_champion' }>;
      const person = c.person_id ? people.find((p) => p.id === c.person_id) ?? null : null;
      const name = person?.name ?? c.person_name ?? 'Champion';
      const role = person?.role ?? c.person_role ?? '';
      out.push(kicker("COMPLIANCE CHAMPION · THIS EDITION'S SPOTLIGHT"));
      out.push(h2('Recognising the People Who Get It Right'));
      out.push(p(`${name}${role ? ` · ${role}` : ''}`, { bold: true, color: C.orange }));
      out.push(h3("Why they're being recognised"));
      out.push(...bodyParagraphs(c.why_recognized));
      if (c.quote) out.push(blockquote(c.quote));
      break;
    }
    case 'audit_radar': {
      const c = content as Extract<SectionContent, { _type: 'audit_radar' }>;
      out.push(kicker('ARE YOU AUDIT READY?'));
      out.push(h2('On the Audit Radar'));
      if (c.intro) out.push(p(c.intro));
      if (c.timeline.length > 0) {
        out.push(buildTable(
          [['Date', 'Audit', 'Country']],
          c.timeline.map((t) => [t.date, t.name, t.country ?? '—']),
        ));
      }
      break;
    }
    case 'award_announcement': {
      const c = content as Extract<SectionContent, { _type: 'award_announcement' }>;
      out.push(kicker('INTRODUCING'));
      out.push(h2(c.title, C.gold));
      if (c.tagline) out.push(p(c.tagline, { italics: true }));
      if (c.paths && c.paths.length > 0) {
        out.push(h3('Two paths to win'));
        c.paths.forEach((pp) => out.push(bullet(pp)));
      }
      if (c.prize) {
        out.push(h3('What the winner gets'));
        c.prize
          .split(/\n|·/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => out.push(bullet(s)));
      }
      if (c.deadline) out.push(p(`Contact: ${c.deadline}`, { italics: true }));
      break;
    }
    case 'dates_to_remember': {
      const c = content as Extract<SectionContent, { _type: 'dates_to_remember' }>;
      out.push(kicker("DATES TO REMEMBER · WHAT'S ON THE HORIZON"));
      out.push(h2('Mark Your Calendar'));
      if (c.intro) out.push(p(c.intro));
      if (c.rows.length > 0) {
        out.push(buildTable(
          [['Date', 'Event / Deadline', 'Category', 'Jurisdiction']],
          c.rows.map((r) => [r.date, r.event, r.category ?? '—', r.jurisdiction ?? '—']),
        ));
      }
      break;
    }
    case 'quick_hits': {
      const c = content as Extract<SectionContent, { _type: 'quick_hits' }>;
      out.push(kicker('QUICK HITS'));
      out.push(h2(c.heading || 'In Case You Missed It'));
      c.items.forEach((item, i) => {
        out.push(p(`${String(i + 1).padStart(2, '0')}. ${item.headline}`, { bold: true }));
        out.push(p(item.body));
      });
      break;
    }
    case 'closing_cta': {
      const c = content as Extract<SectionContent, { _type: 'closing_cta' }>;
      out.push(hr());
      out.push(p(c.message, { italics: true, color: C.ink, size: 26 }));
      if (c.contact)
        out.push(p(c.contact, { bold: true, color: C.gold, size: 22 }));
      break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Block helpers
// ---------------------------------------------------------------------------
function p(
  text: string,
  opts: {
    bold?: boolean;
    italics?: boolean;
    color?: string;
    size?: number;
  } = {},
): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        italics: opts.italics,
        color: opts.color ?? C.inkSoft,
        size: opts.size ?? 22,
      }),
    ],
  });
}

function bodyParagraphs(html: string): Paragraph[] {
  const text = stripHtml(html);
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((para) => p(para));
}

function h2(text: string, color = C.ink): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color, size: 36 })],
  });
}

function h3(text: string, color = C.orange): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color,
        size: 18,
        characterSpacing: 60,
      }),
    ],
  });
}

function kicker(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: C.orange,
        size: 18,
        characterSpacing: 80,
      }),
    ],
  });
}

function small(text: string, color = C.inkSoft): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, color, size: 18, characterSpacing: 60 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, color: C.inkSoft, size: 22 })],
  });
}

function numbered(text: string): Paragraph {
  // We just bake the number into the text rather than fight Word's numbering
  // styles — keeps the doc portable.
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, color: C.inkSoft, size: 22 })],
  });
}

function blockquote(text: string, attribution?: string): Paragraph {
  const runs = [
    new TextRun({ text: `"${text}"`, italics: true, color: C.ink, size: 26 }),
  ];
  if (attribution) {
    runs.push(new TextRun({ text: ` — ${attribution}`, italics: true, color: C.teal, size: 20 }));
  }
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    indent: { left: 600 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: C.gold, space: 12 },
    },
    children: runs,
  });
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

function hr(): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: C.rule },
    },
    children: [],
  });
}

// Simple table with a header row.
function buildTable(headers: string[][], rows: string[][]): Table {
  const cell = (text: string, opts: { header?: boolean; alt?: boolean } = {}) =>
    new TableCell({
      shading: opts.header
        ? { type: ShadingType.SOLID, color: C.ink, fill: C.ink }
        : opts.alt
        ? { type: ShadingType.SOLID, color: 'FBE9D8', fill: 'FBE9D8' }
        : undefined,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: opts.header,
              color: opts.header ? 'FFFFFF' : C.inkSoft,
              size: opts.header ? 18 : 22,
              characterSpacing: opts.header ? 60 : undefined,
            }),
          ],
        }),
      ],
    });

  const headerRows = headers.map(
    (row) =>
      new TableRow({
        children: row.map((c) => cell(c.toUpperCase(), { header: true })),
        tableHeader: true,
      }),
  );

  const bodyRows = rows.map(
    (row, i) =>
      new TableRow({
        children: row.map((c) => cell(c, { alt: i % 2 === 1 })),
      }),
  );

  return new Table({
    rows: [...headerRows, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
