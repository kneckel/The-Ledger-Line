import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsletters } from '@/hooks/useNewsletters';
import { templateService } from '@/services/template.service';
import { peopleService } from '@/services/people.service';
import { settingsService } from '@/services/settings.service';
import { LatestNewsletterCard } from '@/components/dashboard/LatestNewsletterCard';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import type { Person, Settings, Template } from '@/types/database.types';

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
  const [settings, setSettings] = useState<Settings | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load people + settings independently of the latest-newsletter preview so
  // the onboarding checklist can render even before the user has any issues.
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [s, p] = await Promise.all([
        settingsService.get(user.id),
        peopleService.list(user.id),
      ]);
      setSettings(s);
      setPeople(p);
    })();
  }, [user]);

  useEffect(() => {
    if (!latest) {
      setTemplate(null);
      return;
    }
    setPreviewLoading(true);
    void (async () => {
      try {
        const t = await templateService.getById(latest.template_id);
        setTemplate(t);
      } finally {
        setPreviewLoading(false);
      }
    })();
  }, [latest]);

  const hasProfile = Boolean(settings?.author_name && settings.author_name.trim());
  const hasPeople = people.length > 0;
  const hasNewsletter = newsletters.length > 0;

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

      {!loading && (
        <OnboardingChecklist
          hasProfile={hasProfile}
          hasPeople={hasPeople}
          hasNewsletter={hasNewsletter}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Drafts" value={loading ? '…' : draftCount} />
        <StatCard label="Published" value={loading ? '…' : publishedCount} />
        <StatCard label="Archived" value={loading ? '…' : archivedCount} />
      </div>

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
