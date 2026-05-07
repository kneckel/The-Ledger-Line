import type { AuditRadarContent, AuditRadarItem } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: AuditRadarContent;
  onChange: (next: AuditRadarContent) => void;
}

export function AuditRadarEditor({ content, onChange }: Props) {
  const set = <K extends keyof AuditRadarContent>(key: K, v: AuditRadarContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Intro (optional)"
        value={content.intro ?? ''}
        onChange={(v) => set('intro', v)}
        rows={2}
      />
      <ListEditor<AuditRadarItem>
        label="Audit timeline"
        items={content.timeline}
        onChange={(v) => set('timeline', v)}
        blank={() => ({ date: '', name: '', country: '' })}
        addLabel="Add audit"
        emptyHint="Each entry shows up as a row in the audit table + (if among the first four) a phase card on the timeline."
        renderItem={(item, onItemChange) => (
          <div className="grid grid-cols-3 gap-2">
            <TextField
              label="Date / Window"
              value={item.date}
              onChange={(v) => onItemChange({ ...item, date: v })}
              placeholder="Q2 2026"
            />
            <TextField
              label="Audit name"
              value={item.name}
              onChange={(v) => onItemChange({ ...item, name: v })}
              placeholder="Stock Policy"
            />
            <TextField
              label="Country"
              value={item.country ?? ''}
              onChange={(v) => onItemChange({ ...item, country: v })}
              placeholder="Trinidad"
            />
          </div>
        )}
      />
    </div>
  );
}
