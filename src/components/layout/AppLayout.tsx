import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/newsletters', label: 'Newsletters' },
  { to: '/subscribers', label: 'Subscribers' },
];

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen grid grid-cols-[16rem_1fr]">
      <aside className="border-r border-slate-200 bg-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="font-serif text-2xl tracking-tight text-slate-900">Newsletter</h1>
          <p className="text-xs text-slate-500 mt-1">Draft. Send. Repeat.</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-xs text-slate-500 truncate" title={user?.email ?? ''}>
            {user?.email}
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-2 text-xs text-slate-600 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
