import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterService } from '@/services/newsletter.service';
import { templateService } from '@/services/template.service';
import { settingsService } from '@/services/settings.service';
import { peopleService } from '@/services/people.service';
import type { Newsletter, Person, Settings, Template } from '@/types/database.types';
import { NewsletterRenderer } from '@/components/newsletter/Newsletter';
import { downloadMarkdown } from '@/lib/markdown-export';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyFmt, setBusyFmt] = useState<'pdf' | 'docx' | 'md' | null>(null);
  const [showPdfTip, setShowPdfTip] = useState(false);

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

  const args = { newsletter, template, settings, people };

  const handlePdf = () => {
    setShowPdfTip(true);
    // Open the print dialog after the tip has rendered. Browsers normally
    // open it synchronously so the timeout is just a small UX delay so the
    // tip is visible.
    setTimeout(() => {
      window.print();
      setShowPdfTip(false);
    }, 600);
  };

  const handleDocx = async () => {
    setBusyFmt('docx');
    try {
      // Lazy-load docx — keeps the main bundle small.
      const { downloadDocx } = await import('@/lib/docx-export');
      await downloadDocx(args);
    } finally {
      setBusyFmt(null);
    }
  };

  const handleMd = () => {
    setBusyFmt('md');
    try {
      downloadMarkdown(args);
    } finally {
      setBusyFmt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 py-10">
      <div className="no-print max-w-[920px] mx-auto px-4 mb-4 flex justify-between items-center gap-4">
        <Link
          to={`/newsletters/${newsletter.id}`}
          className="text-sm text-slate-700 hover:underline"
        >
          ← Back to editor
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-xs text-slate-500 mr-2">
            {template.name} · {newsletter.status}
          </span>
          <button
            type="button"
            onClick={handlePdf}
            className="text-sm bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-800"
            title="Open the browser's print dialog. Choose 'Save as PDF' as the destination."
          >
            ⬇ PDF
          </button>
          <button
            type="button"
            onClick={() => void handleDocx()}
            disabled={busyFmt !== null}
            className="text-sm border border-slate-300 text-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-100 disabled:opacity-60"
          >
            {busyFmt === 'docx' ? 'Building…' : '⬇ Word (.docx)'}
          </button>
          <button
            type="button"
            onClick={handleMd}
            disabled={busyFmt !== null}
            className="text-sm border border-slate-300 text-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-100 disabled:opacity-60"
          >
            ⬇ Markdown
          </button>
        </div>
      </div>

      {showPdfTip && (
        <div className="no-print max-w-[920px] mx-auto px-4 mb-4">
          <div className="bg-slate-900 text-white text-sm rounded-md px-4 py-3 flex items-center gap-3">
            <span className="text-base">💡</span>
            <span>
              When the print dialog opens, set <strong>Destination</strong> to{' '}
              <strong>Save as PDF</strong>. Margins should be <strong>None</strong>.
              Background graphics <strong>on</strong>.
            </span>
          </div>
        </div>
      )}

      <NewsletterRenderer
        newsletter={newsletter}
        template={template}
        settings={settings}
        people={people}
      />
    </div>
  );
}
