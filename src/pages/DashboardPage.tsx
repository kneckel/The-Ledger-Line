import { Link } from 'react-router-dom';
import { useNewsletters } from '@/hooks/useNewsletters';

export function DashboardPage() {
  const { newsletters, loading } = useNewsletters();

  const draftCount = newsletters.filter((n) => n.status === 'draft').length;
  const publishedCount = newsletters.filter((n) => n.status === 'published').length;
  const archivedCount = newsletters.filter((n) => n.status === 'archived').length;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Drafts" value={loading ? '…' : draftCount} />
        <StatCard label="Published" value={loading ? '…' : publishedCount} />
        <StatCard label="Archived" value={loading ? '…' : archivedCount} />
      </div>
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
