import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscribers } from '@/hooks/useSubscribers';
import { subscriberService } from '@/services/subscriber.service';

export function SubscribersPage() {
  const { user } = useAuth();
  const { subscribers, loading, error, refresh } = useSubscribers();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await subscriberService.add({ user_id: user.id, email, name: name || null });
      setEmail('');
      setName('');
      await refresh();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="font-serif text-3xl tracking-tight text-slate-900">Subscribers</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your audience.</p>
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-col md:flex-row gap-3 bg-white border border-slate-200 rounded-lg p-4 mb-6"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      {formError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
          {formError}
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-amber-700">{error.message}</p>}

      {!loading && subscribers.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
          <p className="text-slate-700">No subscribers yet.</p>
        </div>
      )}

      {subscribers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{s.email}</td>
                  <td className="px-4 py-3 text-slate-600">{s.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.status}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(s.subscribed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
