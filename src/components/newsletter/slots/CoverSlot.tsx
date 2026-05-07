import type { CoverContent } from '@/types/sections';

interface Props {
  content: CoverContent;
  issue_number: number | null;
  period_label: string;
}

export function CoverSlot({ content, issue_number, period_label }: Props) {
  return (
    <header
      className="relative overflow-hidden text-white px-12 pt-12 pb-16"
      style={{ background: 'var(--theme-hero)' }}
    >
      {/* Concentric-ring "sun" graphic, top right */}
      <div
        className="absolute right-12 top-12 w-32 h-32 rounded-full opacity-90"
        style={{ border: '8px solid var(--theme-accent-3)' }}
      >
        <div
          className="absolute inset-3 rounded-full"
          style={{ border: '6px solid rgba(255,255,255,0.06)' }}
        />
        <div
          className="absolute inset-7 rounded-full"
          style={{ background: 'var(--theme-accent-2)' }}
        />
      </div>

      {/* Top kicker */}
      {content.kicker && (
        <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase font-semibold text-white/85">
          <span
            className="block w-7 h-[6px]"
            style={{ background: 'var(--theme-accent-1)' }}
          />
          {content.kicker}
        </div>
      )}

      <h1 className="font-serif text-7xl mt-5 leading-none text-white">
        {content.title}
      </h1>

      {content.subtitle && (
        <p
          className="mt-4 italic text-lg"
          style={{ fontFamily: 'Playfair Display, serif', color: '#CBD5E1' }}
        >
          {content.subtitle}
        </p>
      )}

      {/* Issue pill */}
      <div className="mt-7 inline-flex">
        <span
          className="text-[11px] tracking-[0.18em] uppercase font-bold text-white px-4 py-2"
          style={{ background: 'var(--theme-accent-1)' }}
        >
          {issue_number !== null ? `Issue ${String(issue_number).padStart(2, '0')}` : 'Issue 01'}
          {period_label ? ` · ${period_label.toUpperCase()}` : ''}
        </span>
      </div>

      {/* Decorative wave at the bottom of the hero */}
      <svg
        className="absolute -bottom-1 left-0 right-0 w-full text-white/10"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        aria-hidden
        style={{ height: 40 }}
      >
        <path
          d="M0,30 Q300,55 600,30 T1200,30 L1200,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </header>
  );
}
