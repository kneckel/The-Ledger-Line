import type { DatesToRememberContent } from '@/types/sections';

interface Props {
  content: DatesToRememberContent;
}

// Bullet-coded calendar table with category colors (matches PDF page 8).
const CATEGORY_COLOR: Record<string, string> = {
  audit: '#E54E2C',
  review: '#E54E2C',
  filing: '#E9B341',
  training: '#E9B341',
  policy: '#1F786E',
  default: '#1F786E',
};

function dotColor(category?: string): string {
  if (!category) return CATEGORY_COLOR.default;
  const k = category.toLowerCase();
  if (k.includes('audit') || k.includes('review')) return CATEGORY_COLOR.audit;
  if (k.includes('filing') || k.includes('training')) return CATEGORY_COLOR.filing;
  return CATEGORY_COLOR.default;
}

function categoryColor(category?: string): string {
  return dotColor(category);
}

export function DatesToRememberSlot({ content }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div className="nl-kicker nl-kicker-gold">Dates to Remember · What's on the Horizon</div>
      <h2 className="font-serif text-5xl leading-tight mt-4 mb-5 text-brand-ink">Mark Your Calendar</h2>

      {content.intro && (
        <p className="text-[15px] leading-[1.7] text-brand-ink-soft mb-4">{content.intro}</p>
      )}

      {content.rows.length === 0 ? (
        <p className="text-sm italic text-brand-ink-soft">No dates added yet.</p>
      ) : (
        <table className="nl-cal">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event / Deadline</th>
              <th>Category</th>
              <th>Jurisdiction</th>
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-brand-cream-3/60' : ''}>
                <td className="font-bold text-brand-ink whitespace-nowrap">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                    style={{ background: dotColor(row.category) }}
                  />
                  {row.date}
                </td>
                <td className="text-brand-ink-soft">{row.event}</td>
                <td className="font-semibold" style={{ color: categoryColor(row.category) }}>
                  {row.category || '—'}
                </td>
                <td className="italic text-brand-ink-soft">{row.jurisdiction || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
