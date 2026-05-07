import type { ComplianceChampionContent } from '@/types/sections';
import type { Person } from '@/types/database.types';
import { RichBody } from './RichBody';

interface Props {
  content: ComplianceChampionContent;
  person: Person | null;
}

// Solid orange photo column + cream body card (matches PDF page 6).
export function ComplianceChampionSlot({ content, person }: Props) {
  const name = person?.name || content.person_name || 'Name here';
  const role = person?.role || content.person_role || 'Role · Location';
  const photoUrl = person?.photo_url ?? content.person_photo_url ?? null;

  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div className="nl-kicker">Compliance Champion · This Edition's Spotlight</div>
      <h2 className="font-serif text-5xl leading-tight mt-4 mb-6 text-brand-ink">
        Recognising the People Who Get It Right
      </h2>

      <div className="grid grid-cols-[260px_1fr] gap-0">
        {/* Photo column — orange */}
        <div
          className="p-7 text-center text-white"
          style={{ background: 'var(--theme-accent-1)' }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-32 h-32 mx-auto object-cover rounded-sm"
            />
          ) : (
            <div className="text-[11px] tracking-[0.24em] font-bold py-12">[ PHOTO ]</div>
          )}
          <div
            className="my-5 mx-auto h-[3px] w-12"
            style={{ background: 'var(--theme-accent-2)' }}
          />
          <p className="font-serif text-2xl text-white leading-tight">{name}</p>
          <p className="text-[12px] italic text-white/90 mt-1">{role}</p>
          <p className="mt-3" style={{ color: 'var(--theme-accent-2)' }}>
            ★ ★ ★
          </p>
        </div>

        {/* Body — cream */}
        <div className="p-7 bg-brand-cream">
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-bold mb-3"
            style={{ color: 'var(--theme-accent-1)' }}
          >
            Why they're being recognised
          </div>
          <div className="text-brand-ink-soft text-[15px] leading-[1.7] italic font-serif">
            <RichBody html={content.why_recognized} />
          </div>
          {content.quote && (
            <blockquote className="nl-quote-cream mt-6">
              "{content.quote}"
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}
