import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNewsletters } from '@/hooks/useNewsletters';
import { newsletterService } from '@/services/newsletter.service';
import type { NewsletterStatus } from '@/types/database.types';

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-100 text-slate-500',
};

type StatusFilter = 'all' | NewsletterStatus;

export function NewslettersPage() {
  const { newsletters, loading, error, refresh } = useNewsletters();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return newsletters.filter((n) => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [n.title, n.period_label].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [newsletters, search, statusFilter]);

  const handleDuplicate = async (id: string) => {
    setBusyId(id);
    try {
      const dup = await newsletterService.duplicate(id);
      await refresh();
      navigate(`/newsletters/${dup.id}`);
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: newsletters.length, draft: 0, published: 0, archived: 0 };
    for (const n of newsletters) c[n.status] = (c[n.status] ?? 0) + 1;
    return c;
  }, [newsletters]);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl tracking-tight text-slate-900">Newsletters</h2>
          <p className="text-sm text-slate-500 mt-1">Drafts, published issues, and archive.</p>
        </div>
        <Link
          to="/newsletters/new"
          className="bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800"
        >
          New newsletter
        </Link>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-amber-700">{error.message}</p>}

      {!loading && newsletters.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
          <p className="text-slate-700">No newsletters yet.</p>
          <Link to="/newsletters/new" className="text-sm text-slate-900 underline mt-2 inline-block">
            Create your first one
          </Link>
        </div>
      )}

      {newsletters.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or period…"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 flex-1 max-w-md"
            />
            <div className="flex gap-1">
              {(['all', 'draft', 'published', 'archived'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-md ${
                    statusFilter === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {humanizeStatus(s)} <span className="opacity-70">({counts[s] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
              <p className="text-slate-600 text-sm">No newsletters match this filter.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium w-px" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((n) => (
                    <tr
                      key={n.id}
                      onClick={() => navigate(`/newsletters/${n.id}`)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className="text-slate-900 font-medium">{n.title || 'Untitled'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{n.period_label || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded ${
                            statusStyles[n.status] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(n.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={busyId === n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDuplicate(n.id);
                          }}
                          className="text-xs text-slate-700 hover:text-slate-900 hover:underline disabled:opacity-50"
                          title="Create a new draft starting from this issue's content"
                        >
                          {busyId === n.id ? 'Duplicating…' : 'Duplicate'}
                        </button>
                        <span className="mx-2 text-slate-300">·</span>
                        <Link
                          to={`/newsletters/${n.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-700 hover:text-slate-900 hover:underline"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function humanizeStatus(s: StatusFilter): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
