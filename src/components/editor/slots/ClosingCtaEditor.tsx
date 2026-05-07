import type { ClosingCtaContent } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';

interface Props {
  content: ClosingCtaContent;
  onChange: (next: ClosingCtaContent) => void;
}

export function ClosingCtaEditor({ content, onChange }: Props) {
  const set = <K extends keyof ClosingCtaContent>(key: K, v: ClosingCtaContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Message"
        value={content.message}
        onChange={(v) => set('message', v)}
        rows={3}
        placeholder="Have a topic, question, or shout-out for a colleague?"
      />
      <TextField
        label="Contact (email or person)"
        value={content.contact ?? ''}
        onChange={(v) => set('contact', v)}
        placeholder="compliance-newsletter@example"
      />
    </div>
  );
}
