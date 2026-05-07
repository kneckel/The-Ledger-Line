import { Link, useNavigate } from 'react-router-dom';
import { useNewsletters } from '@/hooks/useNewsletters';

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-100 text-slate-500',
};

export function NewslettersPage() {
  const { newsletters, loading, error } = useNewsletters();
  const navigate = useNavigate();

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
              {newsletters.map((n) => (
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
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/newsletters/${n.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-700 hover:text-slate-900 hover:underline whitespace-nowrap"
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
    </div>
  );
}
