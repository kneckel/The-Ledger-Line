// =============================================================================
// Newsletter renderer — the canonical render of an issue.
//
// Pure component: takes a newsletter row, its template, the people roster, and
// the author settings. Walks template.slot_spec.slots in order and dispatches
// to the right slot component based on each slot's type.
//
// Used by:
//   - the auth'd Preview page (Phase 2-4)
//   - the public share route (Phase 6)
//   - the PDF generator (Phase 5, via Puppeteer)
// =============================================================================

import type { Newsletter, Person, Settings, Template } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';
import { defaultContent } from './sample-content';

import { CoverSlot } from './slots/CoverSlot';
import { WelcomeLetterSlot } from './slots/WelcomeLetterSlot';
import { FeatureArticleSlot } from './slots/FeatureArticleSlot';
import { CornerOfficeSlot } from './slots/CornerOfficeSlot';
import { PolicyRefresherSlot } from './slots/PolicyRefresherSlot';
import { SpotTheRedFlagSlot } from './slots/SpotTheRedFlagSlot';
import { ComplianceChampionSlot } from './slots/ComplianceChampionSlot';
import { AuditRadarSlot } from './slots/AuditRadarSlot';
import { AwardAnnouncementSlot } from './slots/AwardAnnouncementSlot';
import { DatesToRememberSlot } from './slots/DatesToRememberSlot';
import { QuickHitsSlot } from './slots/QuickHitsSlot';
import { ClosingCtaSlot } from './slots/ClosingCtaSlot';
import { resolveTheme, themeToCssVars } from '@/lib/theme';

interface Props {
  newsletter: Newsletter;
  template: Template;
  settings: Settings | null;
  people: Person[];
}

export function NewsletterRenderer({ newsletter, template, settings, people }: Props) {
  const sections = (newsletter.sections ?? {}) as Record<string, SectionContent | undefined>;
  const slots = template.slot_spec.slots;
  const theme = resolveTheme(template);

  // Spot-the-Red-Flag slots get an answer key block at the very end of the doc.
  const redFlagSlots = slots
    .filter((s) => s.type === 'spot_the_red_flag')
    .map((s) => sections[s.name] ?? defaultContent('spot_the_red_flag', s.hint));

  return (
    <article
      className="newsletter-doc max-w-[860px] mx-auto bg-brand-paper shadow-newsletter"
      style={themeToCssVars(theme)}
    >
      {slots.map((slot) => {
        const content = sections[slot.name] ?? defaultContent(slot.type, slot.hint);

        switch (slot.type) {
          case 'cover':
            return (
              <CoverSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'cover' }}
                issue_number={newsletter.issue_number}
                period_label={newsletter.period_label}
              />
            );
          case 'welcome_letter':
            return (
              <WelcomeLetterSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'welcome_letter' }}
                settings={settings}
              />
            );
          case 'feature_article':
            return (
              <FeatureArticleSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'feature_article' }}
              />
            );
          case 'corner_office': {
            const c = content as ReturnType<typeof defaultContent> & { _type: 'corner_office' };
            const person = c.person_id ? people.find((p) => p.id === c.person_id) ?? null : null;
            return <CornerOfficeSlot key={slot.name} content={c} person={person} />;
          }
          case 'policy_refresher':
            return (
              <PolicyRefresherSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'policy_refresher' }}
              />
            );
          case 'spot_the_red_flag':
            return (
              <SpotTheRedFlagSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'spot_the_red_flag' }}
                showAnswerKey={false}
              />
            );
          case 'compliance_champion': {
            const c = content as ReturnType<typeof defaultContent> & { _type: 'compliance_champion' };
            const person = c.person_id ? people.find((p) => p.id === c.person_id) ?? null : null;
            return <ComplianceChampionSlot key={slot.name} content={c} person={person} />;
          }
          case 'audit_radar':
            return (
              <AuditRadarSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'audit_radar' }}
              />
            );
          case 'award_announcement':
            return (
              <AwardAnnouncementSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'award_announcement' }}
              />
            );
          case 'dates_to_remember':
            return (
              <DatesToRememberSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'dates_to_remember' }}
              />
            );
          case 'quick_hits':
            return (
              <QuickHitsSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'quick_hits' }}
              />
            );
          case 'closing_cta':
            return (
              <ClosingCtaSlot
                key={slot.name}
                content={content as ReturnType<typeof defaultContent> & { _type: 'closing_cta' }}
              />
            );
        }
      })}

      {/* Answer key page — printed at the end if any quiz slots exist. */}
      {redFlagSlots.length > 0 && (
        <section className="px-12 py-10 bg-brand-paper">
          <div className="px-7 py-7 bg-brand-cream">
            <div
              className="text-[11px] tracking-[0.22em] uppercase font-bold mb-4"
              style={{ color: 'var(--theme-accent-1)' }}
            >
              Spot the Red Flag · Answer Key
            </div>
            {redFlagSlots.map((c, i) => {
              const quiz = c as ReturnType<typeof defaultContent> & { _type: 'spot_the_red_flag' };
              if (quiz.answer_key.length === 0) return null;
              return (
                <ol
                  key={i}
                  className="list-decimal pl-5 space-y-2 text-[15px] leading-[1.6] marker:font-bold mb-4"
                  style={{ ['--tw-prose-counters' as string]: 'var(--theme-accent-1)' }}
                >
                  {quiz.answer_key.map((a, j) => (
                    <li key={j} style={{ color: 'var(--brand-ink)' }}>
                      {a}
                    </li>
                  ))}
                </ol>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer band — running brand mark */}
      <footer
        className="px-12 py-5 flex justify-between items-baseline text-[11px]"
        style={{ background: 'var(--theme-hero)' }}
      >
        <span
          className="font-serif text-base tracking-wider"
          style={{ color: 'var(--theme-accent-1)' }}
        >
          T h e &nbsp;L e d g e r &nbsp;L i n e
        </span>
        <span className="text-white/70 italic">
          {newsletter.issue_number !== null ? `Issue ${String(newsletter.issue_number).padStart(2, '0')}` : 'Issue'}
          {newsletter.period_label ? ` · ${newsletter.period_label}` : ''}
        </span>
      </footer>
    </article>
  );
}
