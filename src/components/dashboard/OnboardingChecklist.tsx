import { Link } from 'react-router-dom';

interface Props {
  hasProfile: boolean;
  hasPeople: boolean;
  hasNewsletter: boolean;
}

export function OnboardingChecklist({ hasProfile, hasPeople, hasNewsletter }: Props) {
  // Don't render once everything's done — Reneé will only see this on first sign-in.
  if (hasProfile && hasNewsletter) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-serif text-xl text-slate-900">Welcome to The Ledger Line</h3>
        <span className="text-xs text-slate-500">Setup checklist</span>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Two-minute setup so your first issue looks right out of the gate.
      </p>

      <ol className="flex flex-col gap-3">
        <Item
          done={hasProfile}
          n={1}
          title="Set up your author profile"
          description="Your name, role, and photo appear on the welcome letter of every issue."
          to="/settings"
          cta="Open Settings"
        />
        <Item
          done={hasPeople}
          n={2}
          title="Add a person to your roster (optional)"
          description="Used in Compliance Champion and Corner Office spotlights — saves a re-upload each issue."
          to="/settings"
          cta={hasPeople ? 'Manage roster' : 'Add a person'}
          optional
        />
        <Item
          done={hasNewsletter}
          n={3}
          title="Create your first newsletter"
          description="Pick a template, fill in the sections, preview, then publish a shareable link."
          to="/newsletters/new"
          cta="New newsletter"
        />
      </ol>
    </div>
  );
}

function Item({
  done,
  n,
  title,
  description,
  to,
  cta,
  optional,
}: {
  done: boolean;
  n: number;
  title: string;
  description: string;
  to: string;
  cta: string;
  optional?: boolean;
}) {
  return (
    <li className="flex items-start gap-4">
      <span
        className={`flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
          done
            ? 'bg-emerald-600 text-white'
            : 'border-2 border-slate-300 text-slate-500'
        }`}
        aria-hidden
      >
        {done ? '✓' : n}
      </span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
          {title}
          {optional && !done && (
            <span className="ml-2 text-xs text-slate-400 font-normal italic">optional</span>
          )}
        </p>
        {!done && <p className="text-xs text-slate-600 mt-0.5">{description}</p>}
      </div>
      {!done && (
        <Link
          to={to}
          className="text-xs border border-slate-300 text-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-100 whitespace-nowrap"
        >
          {cta}
        </Link>
      )}
    </li>
  );
}
