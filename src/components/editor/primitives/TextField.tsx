interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}

export function TextField({ label, value, onChange, placeholder, hint }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700 font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
