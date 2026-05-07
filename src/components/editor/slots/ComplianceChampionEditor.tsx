import type { ComplianceChampionContent } from '@/types/sections';
import type { Person } from '@/types/database.types';
import { TextArea } from '../primitives/TextArea';
import { TextField } from '../primitives/TextField';
import { PersonPicker } from '../primitives/PersonPicker';

interface Props {
  content: ComplianceChampionContent;
  onChange: (next: ComplianceChampionContent) => void;
  people: Person[];
  onPeopleChanged: () => void;
}

export function ComplianceChampionEditor({
  content,
  onChange,
  people,
  onPeopleChanged,
}: Props) {
  const set = <K extends keyof ComplianceChampionContent>(
    key: K,
    v: ComplianceChampionContent[K],
  ) => onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <PersonPicker
        label="Champion"
        value={content.person_id ?? null}
        onChange={(id, person) =>
          onChange({
            ...content,
            person_id: id,
            person_name: person?.name ?? content.person_name,
            person_role: person?.role ?? content.person_role,
            person_photo_url: person?.photo_url ?? content.person_photo_url,
          })
        }
        people={people}
        onPeopleChanged={onPeopleChanged}
      />
      <TextArea
        label="Why they're being recognised"
        value={content.why_recognized}
        onChange={(v) => set('why_recognized', v)}
        rows={6}
      />
      <TextField
        label="Quote (optional)"
        value={content.quote ?? ''}
        onChange={(v) => set('quote', v)}
        placeholder="A one-line endorsement or note from a manager."
      />
    </div>
  );
}
