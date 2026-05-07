import type { SpotTheRedFlagContent } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: SpotTheRedFlagContent;
  onChange: (next: SpotTheRedFlagContent) => void;
}

export function SpotTheRedFlagEditor({ content, onChange }: Props) {
  const set = <K extends keyof SpotTheRedFlagContent>(key: K, v: SpotTheRedFlagContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Scenario"
        value={content.scenario}
        onChange={(v) => set('scenario', v)}
        rows={6}
        placeholder="A long-standing corporate client, quiet for the past eighteen months, suddenly requests…"
      />
      <label className="flex flex-col gap-1 text-sm max-w-xs">
        <span className="text-slate-700 font-medium">Number of blanks</span>
        <input
          type="number"
          min={1}
          max={10}
          value={content.blanks}
          onChange={(e) => set('blanks', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <span className="text-xs text-slate-500">How many "Red flag #N: ___" lines to print.</span>
      </label>
      <TextField
        label="Submission note"
        value={content.submission_note ?? ''}
        onChange={(v) => set('submission_note', v)}
        placeholder="Submit your answers to compliance@example by 30 Jun"
      />
      <ListEditor<string>
        label="Answer key"
        items={content.answer_key}
        onChange={(v) => set('answer_key', v)}
        blank={() => ''}
        addLabel="Add answer"
        emptyHint="Each entry is one numbered point on the answer-key page at the end."
        renderItem={(a, onItemChange) => (
          <TextArea
            label="Answer"
            value={a}
            onChange={(v) => onItemChange(v)}
            rows={2}
          />
        )}
      />
    </div>
  );
}
