import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterService } from '@/services/newsletter.service';
import { templateService } from '@/services/template.service';
import { settingsService } from '@/services/settings.service';
import { peopleService } from '@/services/people.service';
import type { Newsletter, Person, Settings, Template } from '@/types/database.types';
import { NewsletterRenderer } from '@/components/newsletter/Newsletter';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    void (async () => {
      try {
        const n = await newsletterService.getById(id);
        if (!n) {
          setError('Newsletter not found.');
          return;
        }
        const [t, s, p] = await Promise.all([
          templateService.getById(n.template_id),
          settingsService.get(user.id),
          peopleService.list(user.id),
        ]);
        if (!t) {
          setError('Template not found.');
          return;
        }
        setNewsletter(n);
        setTemplate(t);
        setSettings(s);
        setPeople(p);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  if (loading) return <p className="text-sm text-slate-500 p-8">Loading…</p>;
  if (error) return <p className="text-sm text-amber-700 p-8">{error}</p>;
  if (!newsletter || !template) return null;

  return (
    <div className="min-h-screen bg-slate-200 py-10">
      <div className="max-w-[920px] mx-auto px-4 mb-4 flex justify-between items-center">
        <Link to={`/newsletters/${newsletter.id}`} className="text-sm text-slate-700 hover:underline">
          ← Back to editor
        </Link>
        <span className="text-xs text-slate-500">
          Preview · {template.name} · {newsletter.status}
        </span>
      </div>
      <NewsletterRenderer
        newsletter={newsletter}
        template={template}
        settings={settings}
        people={people}
      />
    </div>
  );
}
