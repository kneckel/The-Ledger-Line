import type { AwardAnnouncementContent } from '@/types/sections';

interface Props {
  content: AwardAnnouncementContent;
}

// Big gold card with trophy graphic + two paths-to-win + winner perks
// (matches PDF pages 7-8).
export function AwardAnnouncementSlot({ content }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      {/* Hero gold card */}
      <div
        className="grid grid-cols-[1fr_2fr] gap-8 px-8 py-10 items-center"
        style={{ background: 'var(--theme-accent-2)' }}
      >
        {/* Trophy SVG */}
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-44 h-44">
            <g fill="#1B3A4B">
              {/* Cup body */}
              <path d="M55 60 H145 V120 Q145 150 100 165 Q55 150 55 120 Z" />
              {/* Handles */}
              <path d="M45 70 Q25 80 25 100 Q25 120 45 130" stroke="#1B3A4B" strokeWidth="6" fill="none" />
              <path d="M155 70 Q175 80 175 100 Q175 120 155 130" stroke="#1B3A4B" strokeWidth="6" fill="none" />
              {/* Base */}
              <rect x="80" y="165" width="40" height="8" />
              <rect x="65" y="173" width="70" height="10" rx="2" />
            </g>
            {/* Star */}
            <path
              d="M100 80 L110 102 L132 102 L114 116 L120 138 L100 124 L80 138 L86 116 L68 102 L90 102 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <div>
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-bold"
            style={{ color: 'var(--theme-hero)' }}
          >
            Introducing
          </div>
          <h2
            className="font-serif text-6xl leading-[0.95] mt-2"
            style={{ color: 'var(--theme-hero)' }}
          >
            {content.title || '[Award name]'}
          </h2>
          <div
            className="my-5 h-1 w-2/3"
            style={{ background: 'var(--theme-hero)' }}
          />
          {content.tagline && (
            <p className="italic text-lg text-brand-ink-soft">{content.tagline}</p>
          )}
        </div>
      </div>

      {/* Two-column body: paths to win / winner gets */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div
          className="p-7 text-white"
          style={{ background: 'var(--theme-accent-3)' }}
        >
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-bold mb-3"
            style={{ color: 'var(--theme-accent-2)' }}
          >
            Two Paths to Win
          </div>
          {content.paths && content.paths.length > 0 ? (
            <ul className="space-y-3 text-sm leading-[1.6]">
              {content.paths.map((p, i) => (
                <li key={i}>
                  <span className="font-bold">
                    {firstPart(p)}
                  </span>
                  {restPart(p)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-white/80">[Add winning paths]</p>
          )}
        </div>

        <div className="p-7 bg-brand-cream">
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-bold mb-3"
            style={{ color: 'var(--theme-accent-1)' }}
          >
            What the Winner Gets
          </div>
          {content.prize ? (
            <ul className="space-y-2 text-sm leading-[1.6] text-brand-ink-soft">
              {content.prize.split(/\n|·/).map((p, i) => p.trim() && (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-orange">●</span>
                  <span>{p.trim()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-brand-ink-soft">[Add prize details]</p>
          )}
        </div>
      </div>

      {content.deadline && (
        <p className="mt-4 text-sm italic text-brand-ink-soft">
          Questions? Reach out to{' '}
          <span className="font-bold" style={{ color: 'var(--theme-accent-1)' }}>
            {content.deadline}
          </span>
        </p>
      )}
    </section>
  );
}

function firstPart(s: string): string {
  const dash = s.indexOf(' — ');
  return dash > -1 ? s.slice(0, dash) + ' ' : s.split(/\s+/, 2).join(' ') + ' ';
}
function restPart(s: string): string {
  const dash = s.indexOf(' — ');
  if (dash > -1) return '— ' + s.slice(dash + 3);
  const words = s.split(/\s+/);
  return words.length > 2 ? '— ' + words.slice(2).join(' ') : '';
}
