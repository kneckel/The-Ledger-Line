// =============================================================================
// TemplatePickerCard — visual preview card used in the new-newsletter flow.
//
// Renders a scaled-down live preview of the template so the user sees what
// they're choosing. The mini-render uses the same NewsletterRenderer the
// editor preview uses, so it stays in sync automatically as slots evolve.
// =============================================================================

import type { Template } from '@/types/database.types';
import { NewsletterRenderer } from '@/components/newsletter/Newsletter';

interface Props {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}

const SCALE = 0.30;
const CARD_WIDTH = 260;
const CARD_HEIGHT = 380;

export function TemplatePickerCard({ template, selected, onSelect }: Props) {
  const fakeNewsletter = {
    id: 'preview',
    user_id: 'preview',
    template_id: template.id,
    title: template.name,
    issue_number: 1,
    period_label: 'Sample issue',
    status: 'draft' as const,
    share_token: null,
    inputs: {},
    sections: {},
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-lg overflow-hidden border-2 transition-all bg-white ${
        selected
          ? 'border-brand-orange shadow-newsletter ring-2 ring-brand-orange/30'
          : 'border-slate-200 hover:border-slate-400'
      }`}
      style={{ width: CARD_WIDTH }}
      aria-pressed={selected}
    >
      <div
        className="bg-slate-100 overflow-hidden relative"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div
          className="pointer-events-none origin-top-left"
          style={{
            transform: `scale(${SCALE})`,
            width: `${100 / SCALE}%`,
            height: `${100 / SCALE}%`,
          }}
        >
          <NewsletterRenderer
            newsletter={fakeNewsletter}
            template={template}
            settings={null}
            people={[]}
          />
        </div>
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-slate-900 text-sm leading-tight">{template.name}</p>
          <span className="text-[10px] tracking-wider uppercase text-brand-teal font-semibold whitespace-nowrap">
            {template.cadence}
          </span>
        </div>
        {template.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
        )}
      </div>
    </button>
  );
}
