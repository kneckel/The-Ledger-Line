import type { AwardAnnouncementContent } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: AwardAnnouncementContent;
  onChange: (next: AwardAnnouncementContent) => void;
}

export function AwardAnnouncementEditor({ content, onChange }: Props) {
  const set = <K extends keyof AwardAnnouncementContent>(key: K, v: AwardAnnouncementContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Award title"
        value={content.title}
        onChange={(v) => set('title', v)}
        placeholder="The 2026 Gold Standard Award"
      />
      <TextField
        label="Tagline"
        value={content.tagline ?? ''}
        onChange={(v) => set('tagline', v)}
        placeholder="Annual recognition for the strongest audit performance."
      />
      <ListEditor<string>
        label="Paths to win"
        items={content.paths ?? []}
        onChange={(v) => set('paths', v)}
        blank={() => ''}
        addLabel="Add path"
        emptyHint="One per criterion (e.g. Lowest finding count — fewest audit observations…)"
        renderItem={(p, onItemChange) => (
          <TextArea
            label="Path"
            value={p}
            onChange={onItemChange}
            rows={2}
          />
        )}
      />
      <TextArea
        label="What the winner gets"
        value={content.prize ?? ''}
        onChange={(v) => set('prize', v)}
        rows={4}
        hint="Bullets are split on newlines or '·' separators."
      />
      <TextField
        label="Deadline / contact"
        value={content.deadline ?? ''}
        onChange={(v) => set('deadline', v)}
        placeholder="Internal Audit lead"
      />
    </div>
  );
}
