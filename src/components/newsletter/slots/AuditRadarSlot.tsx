import type { AuditRadarContent } from '@/types/sections';

interface Props {
  content: AuditRadarContent;
}

// Horizontal timeline of phase cards + alt-row table below (matches PDF page 7).
export function AuditRadarSlot({ content }: Props) {
  const items = content.timeline.length > 0
    ? content.timeline
    : [
        { date: 'Q1', name: 'Reconciliation rollout' },
        { date: 'Q2 · NOW', name: 'Stock Policy / Customer Contracts' },
        { date: 'Q3', name: 'HSE · Service Authenticity' },
        { date: 'Q4', name: 'Year-end close · award read-out' },
      ];

  // Phase cards alternate slate / orange / teal / navy (highlight the "now" phase).
  const phases = items.slice(0, 4);

  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div className="nl-kicker">2026 Audit Timeline · Prep Your Window</div>
      <h2 className="font-serif text-5xl leading-tight mt-4 mb-6 text-brand-ink">
        On the Audit Radar
      </h2>

      {/* Horizontal phase cards */}
      <div className="grid grid-cols-4 gap-3">
        {phases.map((p, i) => (
          <PhaseCard key={i} item={p} variant={phaseVariants[i] ?? phaseVariants[0]} />
        ))}
      </div>

      {/* Connector line */}
      <div className="relative h-0 mt-2 mb-7">
        <div className="absolute inset-0 border-t-2 border-dotted border-slate-300" />
        <div className="absolute inset-0 grid grid-cols-4">
          {phases.map((_, i) => (
            <div key={i} className="flex justify-center -mt-1.5">
              <span
                className="block w-3 h-3 rounded-full bg-white border-2"
                style={{ borderColor: 'var(--theme-accent-1)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {content.timeline.length > 0 && (
        <table className="nl-cal mt-2">
          <thead>
            <tr>
              <th>Country</th>
              <th>Audit Window</th>
              <th>Focus Area</th>
            </tr>
          </thead>
          <tbody>
            {content.timeline.map((item, i) => (
              <tr
                key={i}
                style={{
                  background:
                    i % 3 === 0 ? '#FBE9D8' : i % 3 === 1 ? '#F2CFC2' : '#D9E5E3',
                }}
              >
                <td className="italic text-brand-ink-soft">{item.country || 'Unknown'}</td>
                <td className="font-semibold" style={{ color: 'var(--theme-hero)' }}>
                  {item.date}
                </td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {content.intro && (
        <p className="text-sm italic text-brand-ink-soft mt-4">{content.intro}</p>
      )}
    </section>
  );
}

const phaseVariants = [
  { bg: '#E2D9C6', text: '#1B3A4B', sub: '#3F4A56' },               // Q1 closed
  { bg: 'var(--theme-accent-1)', text: '#FFFFFF', sub: '#FFFFFF' },  // Now
  { bg: 'var(--theme-accent-3)', text: '#FFFFFF', sub: '#FFFFFF' },
  { bg: 'var(--theme-hero)', text: '#FFFFFF', sub: '#FFFFFF' },
];

interface PhaseProps {
  item: { date: string; name: string };
  variant: { bg: string; text: string; sub: string };
}

function PhaseCard({ item, variant }: PhaseProps) {
  return (
    <div
      className="px-3 py-3 text-center"
      style={{ background: variant.bg, color: variant.text }}
    >
      <div className="font-bold text-sm">{item.date}</div>
      <div className="text-[11px] mt-1 leading-tight" style={{ color: variant.sub }}>
        {item.name}
      </div>
    </div>
  );
}
