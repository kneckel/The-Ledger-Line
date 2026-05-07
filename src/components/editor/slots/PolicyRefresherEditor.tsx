import type { PolicyRefresherContent, PolicyAction } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: PolicyRefresherContent;
  onChange: (next: PolicyRefresherContent) => void;
}

export function PolicyRefresherEditor({ content, onChange }: Props) {
  const set = <K extends keyof PolicyRefresherContent>(key: K, v: PolicyRefresherContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Policy title"
        value={content.title}
        onChange={(v) => set('title', v)}
        placeholder="Insurance: Mandatory Requirements for All Businesses"
      />
      <TextField
        label="Owner"
        value={content.owner ?? ''}
        onChange={(v) => set('owner', v)}
        placeholder="Director of Group Risk Management"
      />
      <TextArea
        label="What it says (col 1 — teal)"
        value={content.what_it_says}
        onChange={(v) => set('what_it_says', v)}
        rows={5}
      />
      <TextArea
        label="Why it exists (col 2 — coral)"
        value={content.why_it_exists}
        onChange={(v) => set('why_it_exists', v)}
        rows={5}
      />
      <ListEditor<PolicyAction>
        label="What you do (col 3 — gold)"
        items={content.what_you_do}
        onChange={(v) => set('what_you_do', v)}
        blank={() => ({ text: '' })}
        addLabel="Add action"
        emptyHint="A numbered list of concrete steps."
        renderItem={(a, onItemChange) => (
          <TextArea
            label={`Action`}
            value={a.text}
            onChange={(v) => onItemChange({ text: v })}
            rows={2}
          />
        )}
      />
    </div>
  );
}
