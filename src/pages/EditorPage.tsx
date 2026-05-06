import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterService } from '@/services/newsletter.service';
import type { Newsletter } from '@/types/database.types';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id) return;
    void (async () => {
      try {
        const data = await newsletterService.getById(id);
        if (!data) {
          setError('Newsletter not found.');
          return;
        }
        setNewsletter(data);
        setTitle(data.title);
        setSubject(data.subject);
        setContent(data.content);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await newsletterService.create({
          user_id: user.id,
          title,
          subject,
          content,
        });
        navigate(`/newsletters/${created.id}`, { replace: true });
      } else if (newsletter) {
        const updated = await newsletterService.update(newsletter.id, {
          title,
          subject,
          content,
        });
        setNewsletter(updated);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl tracking-tight text-slate-900">
          {isNew ? 'New newsletter' : 'Edit newsletter'}
        </h2>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-lg p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Title (internal)</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Email subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Content (markdown or HTML)</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>
      </div>
    </div>
  );
}
