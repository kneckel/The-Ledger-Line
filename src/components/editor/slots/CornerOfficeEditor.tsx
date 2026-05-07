import type { CornerOfficeContent } from '@/types/sections';
import type { Person } from '@/types/database.types';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { PersonPicker } from '../primitives/PersonPicker';

interface Props {
  content: CornerOfficeContent;
  onChange: (next: CornerOfficeContent) => void;
  people: Person[];
  onPeopleChanged: () => void;
  minWords?: number;
  maxWords?: number;
}

export function CornerOfficeEditor({
  content,
  onChange,
  people,
  onPeopleChanged,
  minWords,
  maxWords,
}: Props) {
  const set = <K extends keyof CornerOfficeContent>(key: K, v: CornerOfficeContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <PersonPicker
        label="Featured guest"
        value={content.person_id ?? null}
        onChange={(id, person) =>
          onChange({
            ...content,
            person_id: id,
            author_name: person?.name ?? content.author_name,
            author_role: person?.role ?? content.author_role,
            author_photo_url: person?.photo_url ?? content.author_photo_url,
          })
        }
        people={people}
        onPeopleChanged={onPeopleChanged}
      />
      <TextField
        label="Article title"
        value={content.title}
        onChange={(v) => set('title', v)}
      />
      <TextField
        label="Standfirst"
        value={content.standfirst ?? ''}
        onChange={(v) => set('standfirst', v)}
        placeholder="A one-line standfirst that sets up the piece."
      />
      <TextArea
        label="Body"
        value={content.body}
        onChange={(v) => set('body', v)}
        rows={8}
        minWords={minWords}
        maxWords={maxWords}
      />
      <TextField
        label="Closing line"
        value={content.closing_line ?? ''}
        onChange={(v) => set('closing_line', v)}
        placeholder="One concrete takeaway, an invitation, or a thank-you."
      />
    </div>
  );
}
