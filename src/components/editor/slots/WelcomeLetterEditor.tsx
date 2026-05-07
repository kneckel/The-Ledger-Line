import type { WelcomeLetterContent } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';

interface Props {
  content: WelcomeLetterContent;
  onChange: (next: WelcomeLetterContent) => void;
  minWords?: number;
  maxWords?: number;
}

export function WelcomeLetterEditor({ content, onChange, minWords, maxWords }: Props) {
  const set = <K extends keyof WelcomeLetterContent>(key: K, v: WelcomeLetterContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Heading"
        value={content.heading ?? ''}
        onChange={(v) => set('heading', v)}
        placeholder="From the Desk of the Regional Compliance Manager"
      />
      <TextArea
        label="Body"
        value={content.body}
        onChange={(v) => set('body', v)}
        placeholder="Welcome to this edition of The Ledger Line…"
        rows={8}
        minWords={minWords}
        maxWords={maxWords}
        hint="Plain paragraphs. Leave a blank line between paragraphs."
      />
    </div>
  );
}
