import type { SpotTheRedFlagContent } from '@/types/sections';
import { RichBody } from './RichBody';

interface Props {
  content: SpotTheRedFlagContent;
  showAnswerKey?: boolean;
}

// Illustrated header (navy bg with flag) + dark scenario card (matches PDF page 5).
export function SpotTheRedFlagSlot({ content, showAnswerKey = false }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      {/* Illustrated banner */}
      <div
        className="relative px-10 py-10 grid grid-cols-[180px_1fr] items-center gap-6 overflow-hidden"
        style={{ background: 'var(--theme-hero)' }}
      >
        {/* Tiny dot decoration */}
        <span className="absolute top-3 right-6 w-1.5 h-1.5 rounded-full bg-white/30" aria-hidden />
        <span className="absolute bottom-6 left-44 w-1 h-1 rounded-full bg-white/30" aria-hidden />
        <span className="absolute top-12 left-2 w-1 h-1 rounded-full bg-white/30" aria-hidden />

        {/* Flag illustration */}
        <div className="relative flex items-end justify-center h-44">
          {/* Pole */}
          <div className="absolute w-1.5 h-44 bg-brand-gold-bright rounded-full left-1/2 -translate-x-1/2" />
          {/* Pole top knob */}
          <div className="absolute top-0 w-3 h-3 rounded-full bg-brand-gold-bright left-1/2 -translate-x-1/2" />
          {/* Flag */}
          <div
            className="absolute top-3 left-1/2 ml-1 w-24 h-14 flex items-center justify-center font-bold text-3xl text-white"
            style={{
              background: 'var(--theme-accent-1)',
              clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)',
            }}
          >
            !
          </div>
          {/* Ground shadow */}
          <div className="absolute bottom-0 w-12 h-1.5 rounded-full bg-black/30" />
        </div>

        <div>
          <p
            className="text-[11px] tracking-[0.22em] uppercase font-semibold"
            style={{ color: 'var(--theme-accent-2)' }}
          >
            Spot the
          </p>
          <h2 className="font-serif text-6xl text-white leading-none mt-1">RED FLAG</h2>
          <div
            className="my-4 h-[2px] w-32"
            style={{ background: 'var(--theme-accent-1)' }}
          />
          <p className="text-white/85 italic text-sm">Compliance puzzle</p>
          {content.submission_note && (
            <p className="text-white/85 italic text-sm">{content.submission_note}</p>
          )}
        </div>
      </div>

      {/* Intro line */}
      <p className="mt-7 text-[15px] leading-[1.7]">
        Read the scenario below. Your task: identify every compliance red flag you can spot.
        There are <span className="font-bold" style={{ color: 'var(--theme-accent-1)' }}>at least four</span>.
      </p>

      {/* Dark scenario card */}
      <div
        className="mt-6 px-8 py-7 text-white"
        style={{ background: 'var(--theme-hero)' }}
      >
        <div
          className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3"
          style={{ color: 'var(--theme-accent-2)' }}
        >
          The Scenario
        </div>
        <div className="text-[15px] leading-[1.7] text-white">
          <RichBody html={content.scenario} />
        </div>
        <p
          className="font-serif italic text-2xl mt-5 text-white"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          What's wrong with this picture?
        </p>
      </div>

      {/* Spotter's checklist */}
      <div className="mt-8">
        <div
          className="text-[11px] tracking-[0.22em] uppercase font-bold mb-4"
          style={{ color: 'var(--theme-accent-1)' }}
        >
          Your Spotter's Checklist
        </div>
        <ul className="space-y-3">
          {Array.from({ length: content.blanks }).map((_, i) => (
            <li key={i} className="flex items-baseline gap-3">
              <span className="font-bold text-brand-ink">Red flag #{i + 1}:</span>
              <span className="flex-1 border-b border-brand-ink/40 h-5" aria-hidden />
            </li>
          ))}
        </ul>
      </div>

      {showAnswerKey && content.answer_key.length > 0 && (
        <div className="mt-10 p-7 bg-brand-cream">
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-bold mb-4"
            style={{ color: 'var(--theme-accent-1)' }}
          >
            Spot the Red Flag · Answer Key
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-[15px] leading-[1.6] marker:text-brand-orange marker:font-bold">
            {content.answer_key.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
