import type { ClosingCtaContent } from '@/types/sections';

interface Props {
  content: ClosingCtaContent;
}

// Dark navy band with italic message + gold contact email (matches PDF page 9).
export function ClosingCtaSlot({ content }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div
        className="px-12 py-10 text-center"
        style={{ background: 'var(--theme-hero)' }}
      >
        <p
          className="font-serif italic text-2xl leading-snug text-white"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {content.message}
        </p>
        {content.contact && (
          <p className="mt-3 text-white/90 text-base">
            Write to us at{' '}
            <span
              className="font-bold"
              style={{ color: 'var(--theme-accent-2)' }}
            >
              {content.contact}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
