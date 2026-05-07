import type { CoverContent } from '@/types/sections';
import { TextField } from '../primitives/TextField';

interface Props {
  content: CoverContent;
  onChange: (next: CoverContent) => void;
}

export function CoverEditor({ content, onChange }: Props) {
  const set = <K extends keyof CoverContent>(key: K, v: CoverContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Kicker"
        value={content.kicker ?? ''}
        onChange={(v) => set('kicker', v)}
        placeholder="REGIONAL COMPLIANCE · LATAM & CARIBBEAN"
        hint="The small all-caps line above the title."
      />
      <TextField
        label="Title"
        value={content.title}
        onChange={(v) => set('title', v)}
        placeholder="The Ledger Line"
      />
      <TextField
        label="Subtitle"
        value={content.subtitle ?? ''}
        onChange={(v) => set('subtitle', v)}
        placeholder="Financial Compliance · Insight · Integrity"
      />
    </div>
  );
}
