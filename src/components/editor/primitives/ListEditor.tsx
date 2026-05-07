// Generic list editor: add / remove / reorder items.
// Each item is rendered by a child render-prop so callers can wire up their
// own field shapes.

interface Props<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, onItemChange: (next: T) => void) => React.ReactNode;
  blank: () => T;
  addLabel?: string;
  emptyHint?: string;
  max?: number;
}

export function ListEditor<T>({
  label,
  items,
  onChange,
  renderItem,
  blank,
  addLabel = 'Add item',
  emptyHint,
  max,
}: Props<T>) {
  const update = (idx: number, next: T) => {
    const out = [...items];
    out[idx] = next;
    onChange(out);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const out = [...items];
    [out[idx], out[next]] = [out[next], out[idx]];
    onChange(out);
  };
  const add = () => onChange([...items, blank()]);

  const atMax = typeof max === 'number' && items.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-slate-700 font-medium">{label}</span>

      {items.length === 0 && emptyHint && (
        <p className="text-xs text-slate-500 italic">{emptyHint}</p>
      )}

      {items.map((item, idx) => (
        <div
          key={idx}
          className="border border-slate-200 rounded-md p-3 bg-slate-50 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">#{idx + 1}</span>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up">
                ↑
              </IconBtn>
              <IconBtn
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                title="Move down"
              >
                ↓
              </IconBtn>
              <IconBtn onClick={() => remove(idx)} title="Remove" danger>
                ×
              </IconBtn>
            </div>
          </div>
          {renderItem(item, (next) => update(idx, next))}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={atMax}
        className="self-start text-sm border border-dashed border-slate-300 text-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + {addLabel}
        {atMax ? ` (max ${max})` : ''}
      </button>
    </div>
  );
}

function IconBtn({
  onClick,
  disabled,
  children,
  title,
  danger,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`w-6 h-6 text-sm rounded ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-600 hover:bg-slate-200'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
