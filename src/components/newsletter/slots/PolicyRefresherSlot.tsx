import type { PolicyRefresherContent } from '@/types/sections';
import { RichBody } from './RichBody';

interface Props {
  content: PolicyRefresherContent;
}

// Three distinctly colored columns: teal / coral / cream (matches the PDF page 4).
export function PolicyRefresherSlot({ content }: Props) {
  return (
    <section className="px-12 py-10 bg-brand-paper">
      <div className="nl-kicker">Policy Refresher · Plain English. Three Questions.</div>
      <h2 className="font-serif text-5xl leading-[1.05] mt-4 mb-2 text-brand-ink">{content.title}</h2>
      {content.owner && (
        <p className="text-sm italic text-brand-ink-soft">Owner: {content.owner}</p>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Column
          number="01"
          label="What it says"
          headerBg="var(--theme-accent-3)"
          headerText="#FFFFFF"
          bodyBg="#D9E5E3"
        >
          <RichBody html={content.what_it_says} />
        </Column>
        <Column
          number="02"
          label="Why it exists"
          headerBg="var(--theme-accent-1)"
          headerText="#FFFFFF"
          bodyBg="#F2CFC2"
        >
          <RichBody html={content.why_it_exists} />
        </Column>
        <Column
          number="03"
          label="What you do"
          headerBg="var(--theme-accent-2)"
          headerText="#1B3A4B"
          bodyBg="#F4E5C9"
        >
          {content.what_you_do.length > 0 ? (
            <ol className="list-decimal pl-5 space-y-2 text-[14px] leading-[1.6]">
              {content.what_you_do.map((a, i) => (
                <li key={i}>{a.text}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm italic text-brand-ink-soft">No actions listed.</p>
          )}
        </Column>
      </div>
    </section>
  );
}

interface ColProps {
  number: string;
  label: string;
  headerBg: string;
  headerText: string;
  bodyBg: string;
  children: React.ReactNode;
}

function Column({ number, label, headerBg, headerText, bodyBg, children }: ColProps) {
  return (
    <div>
      <div className="px-5 pt-4 pb-3" style={{ background: headerBg, color: headerText }}>
        <div className="font-serif text-3xl leading-none">{number}</div>
        <div className="text-[11px] tracking-[0.18em] uppercase font-bold mt-1">{label}</div>
      </div>
      <div className="px-5 py-5 text-[14px] leading-[1.6] text-brand-ink-soft" style={{ background: bodyBg }}>
        {children}
      </div>
    </div>
  );
}
