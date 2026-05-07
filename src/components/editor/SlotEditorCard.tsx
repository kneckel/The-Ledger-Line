import { useState } from 'react';
import type { SlotSpec, Person } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';
import { defaultContent } from '@/components/newsletter/sample-content';

import { CoverEditor } from './slots/CoverEditor';
import { WelcomeLetterEditor } from './slots/WelcomeLetterEditor';
import { FeatureArticleEditor } from './slots/FeatureArticleEditor';
import { CornerOfficeEditor } from './slots/CornerOfficeEditor';
import { PolicyRefresherEditor } from './slots/PolicyRefresherEditor';
import { SpotTheRedFlagEditor } from './slots/SpotTheRedFlagEditor';
import { ComplianceChampionEditor } from './slots/ComplianceChampionEditor';
import { AuditRadarEditor } from './slots/AuditRadarEditor';
import { AwardAnnouncementEditor } from './slots/AwardAnnouncementEditor';
import { DatesToRememberEditor } from './slots/DatesToRememberEditor';
import { QuickHitsEditor } from './slots/QuickHitsEditor';
import { ClosingCtaEditor } from './slots/ClosingCtaEditor';

interface Props {
  slot: SlotSpec;
  content: SectionContent;
  onChange: (next: SectionContent) => void;
  onResetToDefault: () => void;
  onResetToLastIssue?: () => void;
  hasLastIssueValue?: boolean;
  people: Person[];
  onPeopleChanged: () => void;
  index: number;
}

export function SlotEditorCard({
  slot,
  content,
  onChange,
  onResetToDefault,
  onResetToLastIssue,
  hasLastIssueValue,
  people,
  onPeopleChanged,
  index,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <header
        className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {humanize(slot.type)}{' '}
              <span className="text-xs text-slate-400 font-normal">— {slot.name}</span>
            </h3>
            {slot.hint && <p className="text-xs text-slate-500 mt-0.5">{slot.hint}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasLastIssueValue && onResetToLastIssue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResetToLastIssue();
              }}
              className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
              title="Replace this section with the version from your last published issue"
            >
              Reset to last issue
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(
                  `Reset "${humanize(slot.type)}" to the template default? Your edits to this section will be lost.`,
                )
              ) {
                onResetToDefault();
              }
            }}
            className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
            title="Replace this section with empty placeholder content"
          >
            Reset
          </button>
          <span className="text-slate-400 text-xs ml-2">{open ? '▾' : '▸'}</span>
        </div>
      </header>

      {open && (
        <div className="px-5 py-5">
          <SlotEditor
            slot={slot}
            content={content}
            onChange={onChange}
            people={people}
            onPeopleChanged={onPeopleChanged}
          />
        </div>
      )}
    </section>
  );
}

interface SlotEditorProps {
  slot: SlotSpec;
  content: SectionContent;
  onChange: (next: SectionContent) => void;
  people: Person[];
  onPeopleChanged: () => void;
}

function SlotEditor({ slot, content, onChange, people, onPeopleChanged }: SlotEditorProps) {
  // Defensive: if content type doesn't match slot type, replace with the default.
  if (content._type !== slot.type) {
    onChange(defaultContent(slot.type, slot.hint));
    return null;
  }

  switch (slot.type) {
    case 'cover':
      return (
        <CoverEditor
          content={content as Extract<SectionContent, { _type: 'cover' }>}
          onChange={onChange}
        />
      );
    case 'welcome_letter':
      return (
        <WelcomeLetterEditor
          content={content as Extract<SectionContent, { _type: 'welcome_letter' }>}
          onChange={onChange}
          minWords={slot.min_words}
          maxWords={slot.max_words}
        />
      );
    case 'feature_article':
      return (
        <FeatureArticleEditor
          content={content as Extract<SectionContent, { _type: 'feature_article' }>}
          onChange={onChange}
          minWords={slot.min_words}
          maxWords={slot.max_words}
        />
      );
    case 'corner_office':
      return (
        <CornerOfficeEditor
          content={content as Extract<SectionContent, { _type: 'corner_office' }>}
          onChange={onChange}
          people={people}
          onPeopleChanged={onPeopleChanged}
          minWords={slot.min_words}
          maxWords={slot.max_words}
        />
      );
    case 'policy_refresher':
      return (
        <PolicyRefresherEditor
          content={content as Extract<SectionContent, { _type: 'policy_refresher' }>}
          onChange={onChange}
        />
      );
    case 'spot_the_red_flag':
      return (
        <SpotTheRedFlagEditor
          content={content as Extract<SectionContent, { _type: 'spot_the_red_flag' }>}
          onChange={onChange}
        />
      );
    case 'compliance_champion':
      return (
        <ComplianceChampionEditor
          content={content as Extract<SectionContent, { _type: 'compliance_champion' }>}
          onChange={onChange}
          people={people}
          onPeopleChanged={onPeopleChanged}
        />
      );
    case 'audit_radar':
      return (
        <AuditRadarEditor
          content={content as Extract<SectionContent, { _type: 'audit_radar' }>}
          onChange={onChange}
        />
      );
    case 'award_announcement':
      return (
        <AwardAnnouncementEditor
          content={content as Extract<SectionContent, { _type: 'award_announcement' }>}
          onChange={onChange}
        />
      );
    case 'dates_to_remember':
      return (
        <DatesToRememberEditor
          content={content as Extract<SectionContent, { _type: 'dates_to_remember' }>}
          onChange={onChange}
        />
      );
    case 'quick_hits':
      return (
        <QuickHitsEditor
          content={content as Extract<SectionContent, { _type: 'quick_hits' }>}
          onChange={onChange}
        />
      );
    case 'closing_cta':
      return (
        <ClosingCtaEditor
          content={content as Extract<SectionContent, { _type: 'closing_cta' }>}
          onChange={onChange}
        />
      );
  }
}

function humanize(slotType: string): string {
  return slotType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
