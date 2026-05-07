import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { friendlyError } from '@/lib/friendlyError';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const { session, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: authError } = await fn(email, password);
    setSubmitting(false);
    if (authError) {
      setError(friendlyError(authError));
      return;
    }
    if (mode === 'signup') {
      setError('Check your email — we just sent a link to confirm your account.');
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
        <h1 className="font-serif text-3xl tracking-tight text-slate-900">The Ledger Line</h1>
        <p className="text-xs text-slate-500 mt-0.5">Financial Compliance · Insight · Integrity</p>
        <p className="text-sm text-slate-700 mt-4">
          {mode === 'signin' ? 'Sign in to continue.' : 'Create an account.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>

          {error && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
          }}
          className="mt-4 text-xs text-slate-500 hover:text-slate-900 w-full text-center"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
