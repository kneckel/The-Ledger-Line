import type { QuickHitsContent } from '@/types/sections';

interface Props {
  content: QuickHitsContent;
}

// 2x2 grid of solid-color cards (matches PDF page 8).
const CARD_VARIANTS = [
  { bg: 'var(--theme-accent-3)', text: '#FFFFFF', num: 'var(--theme-accent-2)' },  // teal
  { bg: 'var(--theme-accent-1)', text: '#FFFFFF', num: 'var(--theme-accent-2)' },  // orange
  { bg: 'var(--theme-accent-2)', text: '#1B3A4B', num: '#1B3A4B' },                // gold (dark text)
  { bg: 'var(--theme-hero)',     text: '#FFFFFF', num: 'var(--theme-accent-1)' },  // navy
];

export function QuickHitsSlot({ content }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div className="nl-kicker">Quick Hits · {content.heading || 'In Case You Missed It'}</div>

      {content.items.length === 0 ? (
        <p className="text-sm italic text-brand-ink-soft mt-4">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
          {content.items.map((item, i) => {
            const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
            return (
              <div
                key={i}
                className="px-7 py-6"
                style={{ background: variant.bg, color: variant.text }}
              >
                <div
                  className="font-serif text-3xl leading-none"
                  style={{ color: variant.num }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p className="font-semibold mt-3 text-base leading-snug">{item.headline}</p>
                <p
                  className="mt-2 text-sm leading-[1.6]"
                  style={{ color: variant.text === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : variant.text }}
                >
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
