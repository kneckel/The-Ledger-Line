import type { FeatureArticleContent, PullQuote, StatCallout } from '@/types/sections';
import { TextField } from '../primitives/TextField';
import { TextArea } from '../primitives/TextArea';
import { ListEditor } from '../primitives/ListEditor';

interface Props {
  content: FeatureArticleContent;
  onChange: (next: FeatureArticleContent) => void;
  minWords?: number;
  maxWords?: number;
}

export function FeatureArticleEditor({ content, onChange, minWords, maxWords }: Props) {
  const set = <K extends keyof FeatureArticleContent>(key: K, v: FeatureArticleContent[K]) =>
    onChange({ ...content, [key]: v });

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Kicker"
        value={content.kicker ?? ''}
        onChange={(v) => set('kicker', v)}
        placeholder="FEATURE · ISSUE 01"
      />
      <TextField
        label="Title"
        value={content.title}
        onChange={(v) => set('title', v)}
        placeholder="Why Compliance is the Backbone of Business Continuity"
      />
      <TextField
        label="Byline"
        value={content.byline ?? ''}
        onChange={(v) => set('byline', v)}
        placeholder="Regional Compliance Desk"
      />
      <TextArea
        label="Body"
        value={content.body}
        onChange={(v) => set('body', v)}
        rows={10}
        minWords={minWords}
        maxWords={maxWords}
        hint="Plain paragraphs. Leave a blank line between paragraphs."
      />

      <ListEditor<PullQuote>
        label="Pull quotes"
        items={content.pull_quotes ?? []}
        onChange={(v) => set('pull_quotes', v)}
        blank={() => ({ text: '', attribution: '' })}
        addLabel="Add pull quote"
        max={2}
        emptyHint="No pull quotes yet. Add up to two."
        renderItem={(q, onItemChange) => (
          <div className="flex flex-col gap-2">
            <TextArea
              label="Quote"
              value={q.text}
              onChange={(v) => onItemChange({ ...q, text: v })}
              rows={2}
            />
            <TextField
              label="Attribution"
              value={q.attribution ?? ''}
              onChange={(v) => onItemChange({ ...q, attribution: v })}
              placeholder="— Source · Date"
            />
          </div>
        )}
      />

      <ListEditor<StatCallout>
        label="Stat callouts"
        items={content.stat_callouts ?? []}
        onChange={(v) => set('stat_callouts', v)}
        blank={() => ({ value: '', label: '' })}
        addLabel="Add stat"
        max={3}
        emptyHint="No stats yet. The reference template uses three (teal / orange / gold)."
        renderItem={(s, onItemChange) => (
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Value"
              value={s.value}
              onChange={(v) => onItemChange({ ...s, value: v })}
              placeholder="40%"
            />
            <TextField
              label="Label"
              value={s.label}
              onChange={(v) => onItemChange({ ...s, label: v })}
              placeholder="DECLINE — DROP IN ACTIVE CORRESPONDENT BANKS"
            />
          </div>
        )}
      />
    </div>
  );
}
