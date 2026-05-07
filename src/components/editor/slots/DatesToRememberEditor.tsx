import type { DatesToRememberContent, CalendarRow } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: DatesToRememberContent;
  onChange: (next: DatesToRememberContent) => void;
}

export function DatesToRememberEditor({ content, onChange }: Props) {
  const set = <K extends keyof DatesToRememberContent>(key: K, v: DatesToRememberContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Intro (optional)"
        value={content.intro ?? ''}
        onChange={(v) => set('intro', v)}
        rows={2}
      />
      <ListEditor<CalendarRow>
        label="Calendar rows"
        items={content.rows}
        onChange={(v) => set('rows', v)}
        blank={() => ({ date: '', event: '', category: '', jurisdiction: '' })}
        addLabel="Add date"
        emptyHint="Each row shows in the calendar table. Categories like 'Audit / Review' / 'Training' / 'Policy Review' are color-coded."
        renderItem={(row, onItemChange) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TextField
              label="Date"
              value={row.date}
              onChange={(v) => onItemChange({ ...row, date: v })}
              placeholder="8 June"
            />
            <TextField
              label="Event"
              value={row.event}
              onChange={(v) => onItemChange({ ...row, event: v })}
              placeholder="Audit Field Work begins"
            />
            <TextField
              label="Category"
              value={row.category ?? ''}
              onChange={(v) => onItemChange({ ...row, category: v })}
              placeholder="Audit / Review"
            />
            <TextField
              label="Jurisdiction"
              value={row.jurisdiction ?? ''}
              onChange={(v) => onItemChange({ ...row, jurisdiction: v })}
              placeholder="Trinidad & FCA"
            />
          </div>
        )}
      />
    </div>
  );
}
