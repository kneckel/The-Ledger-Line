import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsletters } from '@/hooks/useNewsletters';
import { templateService } from '@/services/template.service';
import { peopleService } from '@/services/people.service';
import { LatestNewsletterCard } from '@/components/dashboard/LatestNewsletterCard';
import type { Person, Template } from '@/types/database.types';

export function DashboardPage() {
  const { user } = useAuth();
  const { newsletters, loading } = useNewsletters();

  const draftCount = newsletters.filter((n) => n.status === 'draft').length;
  const publishedCount = newsletters.filter((n) => n.status === 'published').length;
  const archivedCount = newsletters.filter((n) => n.status === 'archived').length;

  // useNewsletters orders by updated_at DESC, so [0] is the latest.
  const latest = useMemo(() => newsletters[0] ?? null, [newsletters]);

  const [template, setTemplate] = useState<Template | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!latest || !user) {
      setTemplate(null);
      return;
    }
    setPreviewLoading(true);
    void (async () => {
      try {
        const [t, p] = await Promise.all([
          templateService.getById(latest.template_id),
          peopleService.list(user.id),
        ]);
        setTemplate(t);
        setPeople(p);
      } finally {
        setPreviewLoading(false);
      }
    })();
  }, [latest, user]);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">An overview of your newsletter activity.</p>
        </div>
        <Link
          to="/newsletters/new"
          className="bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800"
        >
          New newsletter
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Drafts" value={loading ? '…' : draftCount} />
        <StatCard label="Published" value={loading ? '…' : publishedCount} />
        <StatCard label="Archived" value={loading ? '…' : archivedCount} />
      </div>

      {!loading && newsletters.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
          <p className="text-slate-700 font-medium">No newsletters yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Pick a template and start your first issue.
          </p>
          <Link
            to="/newsletters/new"
            className="inline-block mt-4 bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800"
          >
            Create your first newsletter
          </Link>
        </div>
      )}

      {latest && (
        <div>
          {template ? (
            <LatestNewsletterCard newsletter={latest} template={template} people={people} />
          ) : previewLoading ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-sm text-slate-500">
              Loading latest preview…
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-4xl text-slate-900">{value}</p>
    </div>
  );
}
