import type { FeatureArticleContent } from '@/types/sections';
import { RichBody } from './RichBody';

interface Props {
  content: FeatureArticleContent;
}

// Each stat card uses one of three theme colors so the trio reads as a unit
// (matches the PDF: teal / orange / gold).
const STAT_BG = ['var(--theme-accent-3)', 'var(--theme-accent-1)', 'var(--theme-accent-2)'];
const STAT_TEXT = ['#FFFFFF', '#FFFFFF', '#1B3A4B'];
const STAT_TOP_RULE = ['#E9B341', '#1B3A4B', '#1B3A4B'];

export function FeatureArticleSlot({ content }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      {content.kicker && <div className="nl-kicker">{content.kicker}</div>}

      <h2 className="font-serif text-5xl leading-[1.05] mt-4 mb-3 text-brand-ink">{content.title}</h2>

      {content.byline && <p className="text-sm text-brand-teal font-semibold mt-3">{content.byline}</p>}

      <div className="mt-6 text-brand-ink-soft">
        <RichBody html={content.body} />
      </div>

      {/* Pull quote — dark band, gold italic */}
      {content.pull_quotes?.map((q, i) => (
        <blockquote
          key={i}
          className="my-8 text-center px-12 py-8"
          style={{ background: 'var(--theme-hero)' }}
        >
          <p
            className="font-serif italic text-2xl leading-snug text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            "{splitFirstHalf(q.text)}
            <span style={{ color: 'var(--theme-accent-2)' }}>{splitSecondHalf(q.text)}</span>
            "
          </p>
          {q.attribution && (
            <p
              className="mt-4 text-[10px] tracking-[0.18em] uppercase font-semibold"
              style={{ color: 'var(--theme-accent-2)' }}
            >
              — {q.attribution}
            </p>
          )}
        </blockquote>
      ))}

      {/* Stat callouts */}
      {content.stat_callouts && content.stat_callouts.length > 0 && (
        <div className="mt-8">
          <div className="nl-kicker mb-3">Regional Snapshot · The Stakes</div>
          <div className={`grid gap-3 ${gridForCount(content.stat_callouts.length)}`}>
            {content.stat_callouts.map((s, i) => (
              <div
                key={i}
                className="nl-stat-card"
                style={{
                  background: STAT_BG[i % 3],
                  color: STAT_TEXT[i % 3],
                }}
              >
                <div className="nl-stat-label-top">{topLabel(s.label)}</div>
                <div className="nl-stat-value">{s.value}</div>
                <div
                  className="nl-stat-rule"
                  style={{ background: STAT_TOP_RULE[i % 3] }}
                />
                <div className="nl-stat-label-bottom">{bottomLabel(s.label)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Split a stat label into top word (small caps line) + body (multi-line) so it
// matches the PDF layout. If there's no separator we just put it all in body.
function topLabel(label: string): string {
  const idx = label.indexOf(' — ');
  if (idx > -1) return label.slice(0, idx);
  return label.split(/\s+/, 1)[0];
}
function bottomLabel(label: string): string {
  const idx = label.indexOf(' — ');
  if (idx > -1) return label.slice(idx + 3);
  return label;
}

function gridForCount(n: number): string {
  if (n === 1) return 'grid-cols-1';
  if (n === 2) return 'grid-cols-2';
  return 'grid-cols-3';
}

// Split a quote's text in half so the second half can be highlighted in gold
// (matches the dramatic two-tone pull quote in the reference).
function splitFirstHalf(s: string): string {
  const semi = s.indexOf(';');
  if (semi > -1) return s.slice(0, semi + 1) + ' ';
  const mid = Math.floor(s.length / 2);
  const space = s.indexOf(' ', mid);
  return space === -1 ? s : s.slice(0, space + 1);
}
function splitSecondHalf(s: string): string {
  const semi = s.indexOf(';');
  if (semi > -1) return s.slice(semi + 2);
  const mid = Math.floor(s.length / 2);
  const space = s.indexOf(' ', mid);
  return space === -1 ? '' : s.slice(space + 1);
}
