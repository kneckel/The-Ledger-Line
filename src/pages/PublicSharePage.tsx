import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { newsletterService } from '@/services/newsletter.service';
import { templateService } from '@/services/template.service';
import type { Newsletter, Template } from '@/types/database.types';
import { NewsletterRenderer } from '@/components/newsletter/Newsletter';
import { downloadMarkdown } from '@/lib/markdown-export';

// Public, unauthenticated route. RLS allows anon SELECT on rows where
// status = 'published' AND share_token IS NOT NULL.
export function PublicSharePage() {
  const { token } = useParams<{ token: string }>();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyFmt, setBusyFmt] = useState<'docx' | 'md' | null>(null);
  const [showPdfTip, setShowPdfTip] = useState(false);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const n = await newsletterService.getBySharedToken(token);
        if (!n) return;
        const t = await templateService.getById(n.template_id);
        setNewsletter(n);
        setTemplate(t);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Update the document title so social shares / browser tabs look right.
  useEffect(() => {
    if (newsletter) {
      document.title = `${newsletter.title || 'The Ledger Line'} · The Ledger Line`;
    }
    return () => {
      document.title = 'The Ledger Line';
    };
  }, [newsletter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!newsletter || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-md text-center">
          <h1 className="font-serif text-2xl text-slate-900 mb-2">Newsletter not found</h1>
          <p className="text-sm text-slate-600">
            This link may have been unpublished, expired, or copied incorrectly. Ask the sender for
            an updated link.
          </p>
        </div>
      </div>
    );
  }

  const args = { newsletter, template, settings: null, people: [] };

  const handlePdf = () => {
    setShowPdfTip(true);
    setTimeout(() => {
      window.print();
      setShowPdfTip(false);
    }, 600);
  };

  const handleDocx = async () => {
    setBusyFmt('docx');
    try {
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
      <div className="no-print max-w-[920px] mx-auto px-4 mb-4 flex justify-between items-center gap-4 flex-wrap">
        <div>
          <p className="font-serif text-xl text-slate-900 leading-none">The Ledger Line</p>
          <p className="text-xs text-slate-500 mt-1">
            Financial Compliance · Insight · Integrity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={handlePdf}
            className="text-sm bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-800"
          >
            ⬇ PDF
          </button>
          <button
            type="button"
            onClick={() => void handleDocx()}
            disabled={busyFmt !== null}
            className="text-sm border border-slate-300 text-slate-700 bg-white rounded-md px-3 py-1.5 hover:bg-slate-50 disabled:opacity-60"
          >
            {busyFmt === 'docx' ? 'Building…' : '⬇ Word (.docx)'}
          </button>
          <button
            type="button"
            onClick={handleMd}
            disabled={busyFmt !== null}
            className="text-sm border border-slate-300 text-slate-700 bg-white rounded-md px-3 py-1.5 hover:bg-slate-50 disabled:opacity-60"
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
              <strong>Save as PDF</strong>. Margins should be <strong>None</strong>. Background
              graphics <strong>on</strong>.
            </span>
          </div>
        </div>
      )}

      <NewsletterRenderer
        newsletter={newsletter}
        template={template}
        settings={null}
        people={[]}
      />

      <footer className="no-print max-w-[920px] mx-auto px-4 mt-6 text-center text-xs text-slate-500">
        Internal distribution only. Not legal advice.
      </footer>
    </div>
  );
}
