import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterService } from '@/services/newsletter.service';
import { templateService } from '@/services/template.service';
import { peopleService } from '@/services/people.service';
import { useTemplates } from '@/hooks/useTemplates';
import { useDebouncedCallback } from '@/lib/useDebouncedCallback';
import { friendlyError } from '@/lib/friendlyError';
import { TemplatePickerCard } from '@/components/templates/TemplatePickerCard';
import { SlotEditorCard } from '@/components/editor/SlotEditorCard';
import { AIPromptModal } from '@/components/editor/AIPromptModal';
import { defaultContent } from '@/components/newsletter/sample-content';
import type { Newsletter, Person, Template } from '@/types/database.types';
import type { SectionContent } from '@/types/sections';

type SectionsMap = Record<string, SectionContent>;

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { templates, loading: templatesLoading } = useTemplates();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [people, setPeople] = useState<Person[]>([]);

  // Form fields (mirrored to newsletter)
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');
  const [sections, setSections] = useState<SectionsMap>({});

  // Pre-fill source for new issues
  const [pastIssues, setPastIssues] = useState<Newsletter[]>([]);
  const [prefillSourceId, setPrefillSourceId] = useState<string>(''); // '' = blank | 'auto' | <id>

  const [loading, setLoading] = useState(!isNew);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  // Load existing newsletter
  useEffect(() => {
    if (isNew || !id || !user) return;
    void (async () => {
      try {
        const n = await newsletterService.getById(id);
        if (!n) {
          setError('Newsletter not found.');
          return;
        }
        const [t, p] = await Promise.all([
          templateService.getById(n.template_id),
          peopleService.list(user.id),
        ]);
        setNewsletter(n);
        setTemplate(t);
        setPeople(p);
        setTemplateId(n.template_id);
        setTitle(n.title);
        setPeriodLabel(n.period_label);
        setSections((n.sections ?? {}) as SectionsMap);
      } catch (e) {
        setError(friendlyError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew, user]);

  // When picking a template on a new issue, fetch past issues for that template
  useEffect(() => {
    if (!isNew || !user || !templateId) {
      setPastIssues([]);
      setPrefillSourceId('');
      return;
    }
    void (async () => {
      const past = await newsletterService.listForTemplate(user.id, templateId);
      setPastIssues(past);
      const mostRecentPublished = past.find((p) => p.status === 'published');
      setPrefillSourceId(mostRecentPublished ? 'auto' : '');
    })();
  }, [isNew, user, templateId]);

  const reloadPeople = async () => {
    if (!user) return;
    setPeople(await peopleService.list(user.id));
  };

  // ---------------------------------------------------------------------------
  // Auto-save: debounce 1s after the last sections/title/period change.
  // ---------------------------------------------------------------------------
  const persistDebounced = useDebouncedCallback(async (patch: Partial<Newsletter>) => {
    if (isNew || !newsletter) return;
    setSaveState('saving');
    try {
      const updated = await newsletterService.update(newsletter.id, patch);
      setNewsletter(updated);
      setSaveState('saved');
      // Snapshot to versions on each save (best-effort).
      void newsletterService.snapshot(newsletter.id, (patch.sections ?? sections) as Record<string, unknown>);
    } catch (e) {
      setError(friendlyError(e));
      setSaveState('error');
    }
  }, 1000);

  const updateSection = (slotName: string, next: SectionContent) => {
    const nextMap = { ...sections, [slotName]: next };
    setSections(nextMap);
    void persistDebounced({ sections: nextMap });
  };

  const handleAIImport = (
    incoming: Record<string, SectionContent>,
    mode: 'merge' | 'replace',
  ) => {
    const next: SectionsMap = mode === 'replace' ? incoming : { ...sections, ...incoming };
    setSections(next);
    void persistDebounced({ sections: next });
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    void persistDebounced({ title: v });
  };
  const handlePeriodChange = (v: string) => {
    setPeriodLabel(v);
    void persistDebounced({ period_label: v });
  };

  // ---------------------------------------------------------------------------
  // Create flow
  // ---------------------------------------------------------------------------
  const handleCreate = async () => {
    if (!user || !templateId) {
      setError('Pick a template first.');
      return;
    }
    setError(null);
    setSaveState('saving');
    try {
      // Resolve pre-fill source
      let prefillSections: Record<string, unknown> = {};
      if (prefillSourceId === 'auto') {
        const src = await newsletterService.findPrefillSource(user.id, templateId);
        if (src) prefillSections = (src.sections ?? {}) as Record<string, unknown>;
      } else if (prefillSourceId) {
        const src = pastIssues.find((p) => p.id === prefillSourceId);
        if (src) prefillSections = (src.sections ?? {}) as Record<string, unknown>;
      }

      const created = await newsletterService.create({
        user_id: user.id,
        template_id: templateId,
        title,
        period_label: periodLabel,
        inputs: {},
      });
      // If we have prefill sections, push them in a follow-up update.
      if (Object.keys(prefillSections).length > 0) {
        await newsletterService.update(created.id, { sections: prefillSections });
      }
      navigate(`/newsletters/${created.id}`, { replace: true });
    } catch (e) {
      setError(friendlyError(e));
      setSaveState('error');
    }
  };

  // ---------------------------------------------------------------------------
  // Publish / Unpublish
  // ---------------------------------------------------------------------------
  const handlePublish = async () => {
    if (!newsletter) return;
    setError(null);
    setSaveState('saving');
    try {
      const updated = await newsletterService.publish(newsletter.id);
      setNewsletter(updated);
      setSaveState('saved');
    } catch (e) {
      setError(friendlyError(e));
      setSaveState('error');
    }
  };

  const handleUnpublish = async () => {
    if (!newsletter) return;
    if (!confirm('Move this issue back to draft? The share link stops working until you republish.'))
      return;
    setError(null);
    setSaveState('saving');
    try {
      const updated = await newsletterService.unpublish(newsletter.id);
      setNewsletter(updated);
      setSaveState('saved');
    } catch (e) {
      setError(friendlyError(e));
      setSaveState('error');
    }
  };

  // ---------------------------------------------------------------------------
  // Reset actions
  // ---------------------------------------------------------------------------
  const resetSlotToDefault = (slotName: string) => {
    if (!template) return;
    const slot = template.slot_spec.slots.find((s) => s.name === slotName);
    if (!slot) return;
    updateSection(slotName, defaultContent(slot.type, slot.hint));
  };

  const lastIssue = useMemo(() => {
    if (!newsletter) return null;
    // Most-recent published issue for this template, EXCLUDING the current issue.
    return pastIssues.find((p) => p.status === 'published' && p.id !== newsletter.id) ?? null;
  }, [pastIssues, newsletter]);

  const resetSlotToLastIssue = (slotName: string) => {
    if (!lastIssue) return;
    const sec = (lastIssue.sections as Record<string, unknown> | null)?.[slotName] as SectionContent | undefined;
    if (sec) updateSection(slotName, sec);
  };

  // Load past issues for the current (saved) newsletter so reset-to-last-issue works
  useEffect(() => {
    if (isNew || !user || !template || !newsletter) return;
    void (async () => {
      const past = await newsletterService.listForTemplate(user.id, template.id);
      setPastIssues(past);
    })();
  }, [isNew, user, template, newsletter]);

  if (loading || templatesLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={isNew ? 'max-w-6xl' : 'max-w-4xl'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl tracking-tight text-slate-900">
          {isNew ? 'New newsletter' : title || 'Untitled'}
        </h2>
        <div className="flex items-center gap-3">
          {!isNew && <SaveIndicator state={saveState} />}
          {!isNew && newsletter && template && (
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="border border-slate-300 text-slate-700 text-sm rounded-md px-4 py-2 hover:bg-slate-100"
              title="Generate a Claude-ready prompt for this issue, or paste back the JSON output to fill sections."
            >
              ✨ AI assist
            </button>
          )}
          {!isNew && newsletter && (
            <Link
              to={`/newsletters/${newsletter.id}/preview`}
              className="border border-slate-300 text-slate-700 text-sm rounded-md px-4 py-2 hover:bg-slate-100"
            >
              Preview
            </Link>
          )}
          {!isNew && newsletter && newsletter.status !== 'published' && (
            <button
              type="button"
              onClick={() => void handlePublish()}
              className="bg-emerald-700 text-white text-sm rounded-md px-4 py-2 hover:bg-emerald-800"
            >
              Publish
            </button>
          )}
          {!isNew && newsletter && newsletter.status === 'published' && (
            <button
              type="button"
              onClick={() => void handleUnpublish()}
              className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm rounded-md px-4 py-2 hover:bg-emerald-100"
            >
              Unpublish
            </button>
          )}
          {isNew && (
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!templateId}
              className="bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
            >
              Create
            </button>
          )}
        </div>
      </div>

      {aiOpen && newsletter && template && (
        <AIPromptModal
          template={template}
          newsletter={newsletter}
          onClose={() => setAiOpen(false)}
          onImport={handleAIImport}
        />
      )}

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {isNew ? renderNewFlow() : renderEditFlow()}
    </div>
  );

  // ---------------------------------------------------------------------------
  // New-issue flow: template picker + title/period + pre-fill picker
  // ---------------------------------------------------------------------------
  function renderNewFlow() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-1">Pick a template</h3>
          <p className="text-xs text-slate-500 mb-4">
            Each card shows the layout. Click to choose.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {templates.map((t) => (
              <TemplatePickerCard
                key={t.id}
                template={t}
                selected={t.id === templateId}
                onSelect={() => setTemplateId(t.id)}
              />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4 max-w-2xl">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Ledger Line — Q2 2026"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Period label</span>
            <input
              type="text"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              placeholder="e.g. Q2 2026 or May 2026"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>

          {templateId && pastIssues.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-700">Pre-fill content from</span>
              <select
                value={prefillSourceId}
                onChange={(e) => setPrefillSourceId(e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Start blank</option>
                <option value="auto">Most recent published issue (auto)</option>
                <optgroup label="Pick a specific past issue">
                  {pastIssues.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title || 'Untitled'} · {p.status} · {new Date(p.updated_at).toLocaleDateString()}
                    </option>
                  ))}
                </optgroup>
              </select>
              <span className="text-xs text-slate-500">
                The selected issue's content is copied as your starting point. You can still edit every section.
              </span>
            </label>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Edit flow: title/period + slot accordion
  // ---------------------------------------------------------------------------
  function renderEditFlow() {
    if (!newsletter || !template) return null;

    const slots = template.slot_spec.slots;

    return (
      <div className="flex flex-col gap-5">
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Template</span>
            <span className="text-slate-900 font-medium">
              {selectedTemplate?.name ?? '—'}
              {selectedTemplate && (
                <span className="ml-2 text-xs text-brand-teal font-semibold uppercase tracking-wider">
                  {selectedTemplate.cadence}
                </span>
              )}
            </span>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. The Ledger Line — Q2 2026"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Period label</span>
            <input
              type="text"
              value={periodLabel}
              onChange={(e) => handlePeriodChange(e.target.value)}
              placeholder="e.g. Q2 2026 or May 2026"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>

          <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 -mb-1 flex flex-col gap-1">
            <span>
              Status: <strong className="text-slate-700">{newsletter.status}</strong>
            </span>
          </div>
        </div>

        {newsletter.status === 'published' && newsletter.share_token && (
          <SharePanel token={newsletter.share_token} />
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700">Sections</h3>
          <span className="text-xs text-slate-500">
            {slots.length} {slots.length === 1 ? 'section' : 'sections'} · auto-saves as you type
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {slots.map((slot, i) => {
            const content =
              (sections[slot.name] as SectionContent | undefined) ??
              defaultContent(slot.type, slot.hint);
            const lastIssueValue = lastIssue
              ? ((lastIssue.sections as Record<string, unknown> | null)?.[slot.name] as
                  | SectionContent
                  | undefined)
              : undefined;
            return (
              <SlotEditorCard
                key={slot.name}
                slot={slot}
                index={i}
                content={content}
                onChange={(next) => updateSection(slot.name, next)}
                onResetToDefault={() => resetSlotToDefault(slot.name)}
                onResetToLastIssue={
                  lastIssueValue ? () => resetSlotToLastIssue(slot.name) : undefined
                }
                hasLastIssueValue={Boolean(lastIssueValue)}
                people={people}
                onPeopleChanged={() => void reloadPeople()}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

function SaveIndicator({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (state === 'idle') return null;
  const map = {
    saving: { text: 'Saving…', cls: 'text-slate-500' },
    saved: { text: 'Saved', cls: 'text-emerald-700' },
    error: { text: 'Save failed', cls: 'text-amber-700' },
  } as const;
  const { text, cls } = map[state];
  return <span className={`text-xs ${cls}`}>{text}</span>;
}

function SharePanel({ token }: { token: string }) {
  const url = `${window.location.origin}/n/${token}`;
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-900">This issue is published</h3>
          <p className="text-xs text-emerald-800 mt-0.5">
            Anyone with the link can read it — no sign-in required.
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-900 hover:underline whitespace-nowrap"
        >
          Open ↗
        </a>
      </div>
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 border border-emerald-200 bg-white rounded-md px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="text-sm bg-emerald-700 text-white rounded-md px-3 py-2 hover:bg-emerald-800"
        >
          {copied ? '✓ Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
