import type { CornerOfficeContent } from '@/types/sections';
import type { Person } from '@/types/database.types';
import { RichBody } from './RichBody';

interface Props {
  content: CornerOfficeContent;
  person: Person | null;
}

// Solid gold/yellow photo column + body (matches the reference page 3).
export function CornerOfficeSlot({ content, person }: Props) {
  const name = person?.name || content.author_name || '(Name Here)';
  const role = person?.role || content.author_role || 'Regional Director';
  const photoUrl = person?.photo_url ?? content.author_photo_url ?? null;

  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div className="nl-kicker">From the Corner Office</div>
      <h2 className="font-serif text-5xl leading-tight mt-4 mb-2 text-brand-ink">{content.title}</h2>
      <p className="italic text-brand-ink-soft text-base mb-6">
        A rotating column featuring perspectives from Regional Directors and subject-matter experts.
      </p>

      <div className="grid grid-cols-[280px_1fr] gap-7 items-start">
        <div
          className="p-7 text-center"
          style={{ background: 'var(--theme-accent-2)' }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-32 h-32 mx-auto object-cover rounded-sm grayscale"
            />
          ) : (
            <div className="text-[11px] tracking-[0.24em] font-bold text-brand-ink py-12">
              [ PHOTO ]
            </div>
          )}
          <div
            className="my-5 mx-auto h-[3px] w-12"
            style={{ background: '#FFFFFF' }}
          />
          <p className="font-serif text-xl text-brand-ink leading-tight">{name}</p>
          <p className="text-[12px] italic text-brand-ink mt-1">{role}</p>
        </div>

        <div>
          <h3 className="font-serif text-3xl leading-tight mb-2">
            {content.standfirst ? (
              <span className="text-brand-ink">{content.standfirst}</span>
            ) : (
              <span className="italic text-brand-orange">[A one-line standfirst.]</span>
            )}
          </h3>
          <div className="text-brand-ink-soft text-[15px] leading-[1.7] mt-4">
            <RichBody html={content.body} />
          </div>
          {content.closing_line && (
            <p className="mt-6 italic font-serif text-brand-teal">— {content.closing_line}</p>
          )}
        </div>
      </div>
    </section>
  );
}
