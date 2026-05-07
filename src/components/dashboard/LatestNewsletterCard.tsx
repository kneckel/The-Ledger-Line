// =============================================================================
// LatestNewsletterCard — large, clickable preview thumbnail on the Dashboard.
// Renders the actual newsletter (with real sections) scaled down using the
// same NewsletterRenderer the editor preview uses, so it always reflects the
// current state of the issue.
// =============================================================================

import { Link } from 'react-router-dom';
import type { Newsletter, Person, Template } from '@/types/database.types';
import { NewsletterRenderer } from '@/components/newsletter/Newsletter';

interface Props {
  newsletter: Newsletter;
  template: Template;
  people: Person[];
}

const SCALE = 0.35;
const CARD_WIDTH = 320;
const CARD_HEIGHT = 440;

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-100 text-slate-500',
};

export function LatestNewsletterCard({ newsletter, template, people }: Props) {
  const updatedAgo = relativeTime(newsletter.updated_at);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col md:flex-row">
      {/* Preview thumbnail */}
      <Link
        to={`/newsletters/${newsletter.id}`}
        className="block bg-slate-100 relative shrink-0 group"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        aria-label="Open newsletter editor"
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
            newsletter={newsletter}
            template={template}
            settings={null}
            people={people}
          />
        </div>
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
      </Link>

      {/* Metadata + actions */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-slate-500 font-semibold">
              Latest newsletter
            </p>
            <h3 className="font-serif text-2xl text-slate-900 leading-tight mt-1">
              {newsletter.title || 'Untitled'}
            </h3>
            {newsletter.period_label && (
              <p className="text-sm text-slate-500 mt-1">{newsletter.period_label}</p>
            )}
          </div>
          <span
            className={`inline-block text-[10px] tracking-wider uppercase px-2 py-1 rounded font-semibold whitespace-nowrap ${
              STATUS_STYLES[newsletter.status] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {newsletter.status}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Template: <span className="text-slate-700">{template.name}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Updated {updatedAgo}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link
            to={`/newsletters/${newsletter.id}`}
            className="bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800"
          >
            {newsletter.status === 'draft' ? 'Continue editing' : 'Open'}
          </Link>
          <Link
            to={`/newsletters/${newsletter.id}/preview`}
            className="border border-slate-300 text-slate-700 text-sm rounded-md px-4 py-2 hover:bg-slate-100"
          >
            Preview
          </Link>
          {newsletter.status === 'published' && newsletter.share_token && (
            <a
              href={`/n/${newsletter.share_token}`}
              target="_blank"
              rel="noreferrer"
              className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm rounded-md px-4 py-2 hover:bg-emerald-100"
            >
              Public link ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}
