interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  minWords?: number;
  maxWords?: number;
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 6,
  minWords,
  maxWords,
}: Props) {
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const overMax = maxWords && wordCount > maxWords;
  const underMin = minWords && wordCount > 0 && wordCount < minWords;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700 font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
      />
      <div className="flex justify-between items-baseline gap-3">
        {hint && <span className="text-xs text-slate-500 flex-1">{hint}</span>}
        {(minWords || maxWords) && (
          <span
            className={`text-xs whitespace-nowrap ${
              overMax || underMin ? 'text-amber-700 font-medium' : 'text-slate-400'
            }`}
          >
            {wordCount} words
            {minWords && maxWords ? ` · target ${minWords}–${maxWords}` : ''}
          </span>
        )}
      </div>
    </label>
  );
}
