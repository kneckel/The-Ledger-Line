import type { WelcomeLetterContent } from '@/types/sections';
import type { Settings } from '@/types/database.types';
import { RichBody } from './RichBody';

interface Props {
  content: WelcomeLetterContent;
  settings: Settings | null;
}

// The welcome card visually flows out of the cover hero — peach card with
// a teal sidebar (matches the reference PDF page 1).
export function WelcomeLetterSlot({ content, settings }: Props) {
  const author = settings?.author_name || '(Name here)';
  const role = settings?.author_role || 'Regional Compliance Manager';

  return (
    <section className="px-12 pt-10 pb-12 bg-brand-paper">
      <div className="grid grid-cols-[280px_1fr] gap-0 shadow-newsletter rounded-sm overflow-hidden">
        {/* Sidebar */}
        <aside
          className="p-7 text-white"
          style={{ background: 'var(--theme-hero)' }}
        >
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-4"
            style={{ color: 'var(--theme-accent-2)' }}
          >
            Welcome
          </div>
          <h2 className="font-serif text-3xl leading-tight text-white">
            {content.heading || 'From the Desk of the Regional Compliance Manager'}
          </h2>
          <div
            className="my-5 h-[3px] w-12"
            style={{ background: 'var(--theme-accent-2)' }}
          />
          <p className="italic text-sm">— {author}</p>
          <p className="text-sm text-white/80">{role}</p>
        </aside>

        {/* Body */}
        <div className="p-7 bg-brand-cream-3">
          <div className="text-brand-ink-soft text-[15px] leading-[1.7]">
            <RichBody html={content.body} />
          </div>
        </div>
      </div>
    </section>
  );
}
