import type { QuickHitsContent, QuickHit } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: QuickHitsContent;
  onChange: (next: QuickHitsContent) => void;
}

export function QuickHitsEditor({ content, onChange }: Props) {
  const set = <K extends keyof QuickHitsContent>(key: K, v: QuickHitsContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Heading (optional)"
        value={content.heading ?? ''}
        onChange={(v) => set('heading', v)}
        placeholder="In Case You Missed It"
      />
      <ListEditor<QuickHit>
        label="Items"
        items={content.items}
        onChange={(v) => set('items', v)}
        blank={() => ({ headline: '', body: '' })}
        addLabel="Add item"
        max={6}
        emptyHint="Renders as a 2×2 colored grid (teal / orange / gold / navy)."
        renderItem={(item, onItemChange) => (
          <div className="flex flex-col gap-2">
            <TextField
              label="Headline"
              value={item.headline}
              onChange={(v) => onItemChange({ ...item, headline: v })}
            />
            <TextArea
              label="Body"
              value={item.body}
              onChange={(v) => onItemChange({ ...item, body: v })}
              rows={3}
            />
          </div>
        )}
      />
    </div>
  );
}
