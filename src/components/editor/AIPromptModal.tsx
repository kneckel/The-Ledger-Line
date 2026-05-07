import { useMemo, useState } from 'react';
import type { Newsletter, Template } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';
import { buildPrompt, parseImport } from '@/lib/aiPrompt';

interface Props {
  template: Template;
  newsletter: Newsletter;
  onClose: () => void;
  onImport: (sections: Record<string, SectionContent>, mode: 'merge' | 'replace') => void;
}

export function AIPromptModal({ template, newsletter, onClose, onImport }: Props) {
  const [tab, setTab] = useState<'prompt' | 'import'>('prompt');
  const [context, setContext] = useState('');
  const [paste, setPaste] = useState('');
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<{ imported: string[]; skipped: { slot: string; reason: string }[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildPrompt({ template, newsletter, context }),
    [template, newsletter, context],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select-all the textarea
    }
  };

  const handleImport = () => {
    setError(null);
    setReport(null);
    try {
      const result = parseImport(paste, template);
      onImport(result.sections, mode);
      setReport({ imported: result.imported, skipped: result.skipped });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-slate-900">AI assist</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Use Claude (or any AI chatbot) to draft this issue's content.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* How it works — 4-step explainer, always visible */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
            How this works
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-700">
            <Step n={1}>
              <strong>Add context</strong> — describe what this issue is about (topic, dates, people).
            </Step>
            <Step n={2}>
              <strong>Copy the prompt</strong> and paste it into{' '}
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noreferrer"
                className="underline text-slate-900"
              >
                claude.ai
              </a>
              .
            </Step>
            <Step n={3}>
              <strong>Claude returns JSON.</strong> Copy everything between the first <code className="bg-slate-200 px-1 rounded">{'{'}</code>{' '}
              and last <code className="bg-slate-200 px-1 rounded">{'}'}</code>.
            </Step>
            <Step n={4}>
              <strong>Paste it back</strong> in tab 2 and click Import. Sections fill in; you can still edit each one.
            </Step>
          </ol>
        </div>

        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-6 -mb-px">
            <TabButton active={tab === 'prompt'} onClick={() => setTab('prompt')}>
              1. Get prompt
            </TabButton>
            <TabButton active={tab === 'import'} onClick={() => setTab('import')}>
              2. Import JSON
            </TabButton>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {tab === 'prompt' ? (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-700 font-medium">
                  Step 1 · Your context for this issue
                </span>
                <span className="text-xs text-slate-500 mb-1">
                  A few lines is enough. Topic, key dates, policies to refresh, who to spotlight.
                  More detail = better draft.
                </span>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={`e.g.
- Q2 focus: UBO registries in Jamaica & Trinidad
- Highlight Reneé's note on FATF mutual evaluation
- Spotlight: Ana Hernández (Compliance Lead, Colombia)
- Key dates: 24 Jun UBO Phase 1, 1 Jul VASP Travel Rule
- Policy refresher: Insurance — confidentiality of policy wordings`}
                  rows={6}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-mono"
                />
              </label>

              <div>
                <p className="text-sm text-slate-700 font-medium mb-1">
                  Step 2 · Copy the prompt below into Claude
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  Click the button to copy, then open{' '}
                  <a
                    href="https://claude.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    claude.ai
                  </a>{' '}
                  in a new tab and paste it as your message. Claude will write the issue and reply
                  with a JSON object.
                </p>
                <div className="border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-medium text-slate-700">Generated prompt</span>
                    <div className="flex gap-2">
                      <a
                        href="https://claude.ai"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs border border-slate-300 text-slate-700 rounded px-3 py-1 hover:bg-slate-100"
                      >
                        Open claude.ai ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleCopy()}
                        className="text-xs bg-slate-900 text-white rounded px-3 py-1 hover:bg-slate-800"
                      >
                        {copied ? '✓ Copied' : 'Copy to clipboard'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={prompt}
                    readOnly
                    rows={14}
                    className="block w-full px-3 py-2 text-xs font-mono text-slate-700 bg-white focus:outline-none resize-y"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('import')}
                  className="text-sm bg-slate-900 text-white rounded-md px-4 py-2 hover:bg-slate-800"
                >
                  Got Claude's reply? Continue to Import →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-slate-700 font-medium mb-1">
                  Step 3 · Paste Claude's JSON reply
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  Copy everything Claude returned (including the curly braces) and paste it in the
                  box below.
                </p>
              </div>

              <fieldset className="flex flex-col gap-2 text-sm border border-slate-200 rounded-md p-3 bg-slate-50">
                <legend className="px-2 text-xs font-medium text-slate-700">
                  How should the import behave?
                </legend>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="import-mode"
                    value="merge"
                    checked={mode === 'merge'}
                    onChange={() => setMode('merge')}
                    className="mt-1"
                  />
                  <span>
                    <strong>Merge</strong> — only replaces sections present in the JSON. Anything
                    you've already edited that Claude didn't return stays untouched.{' '}
                    <span className="text-slate-500">(Recommended.)</span>
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="import-mode"
                    value="replace"
                    checked={mode === 'replace'}
                    onChange={() => setMode('replace')}
                    className="mt-1"
                  />
                  <span>
                    <strong>Replace all</strong> — wipes the current sections and uses Claude's
                    output as the entire issue.
                  </span>
                </label>
              </fieldset>

              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder={`Paste the JSON Claude returned, e.g.\n{\n  "cover": { "_type": "cover", "title": "The Ledger Line", ... },\n  "welcome_letter": { "_type": "welcome_letter", "body": "..." },\n  ...\n}`}
                rows={14}
                className="border border-slate-300 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              {error && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <strong>Couldn't import: </strong>
                  {error}
                </p>
              )}

              {report && (
                <div className="flex flex-col gap-2 text-sm">
                  <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                    ✓ Imported {report.imported.length}{' '}
                    {report.imported.length === 1 ? 'section' : 'sections'}:{' '}
                    <span className="font-mono text-xs">{report.imported.join(', ')}</span>
                    . You can now edit each section below or click Preview.
                  </p>
                  {report.skipped.length > 0 && (
                    <div className="text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <p className="font-medium">Skipped:</p>
                      <ul className="text-xs mt-1 space-y-0.5">
                        {report.skipped.map((s) => (
                          <li key={s.slot}>
                            <span className="font-mono">{s.slot}</span> — {s.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('prompt')}
                  className="text-sm border border-slate-300 text-slate-700 rounded-md px-4 py-2 hover:bg-slate-50"
                >
                  ← Back to prompt
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm border border-slate-300 text-slate-700 rounded-md px-4 py-2 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!paste.trim()}
                    className="text-sm bg-slate-900 text-white rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 items-start">
      <span className="flex-none w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="leading-snug">{children}</span>
    </li>
  );
}
