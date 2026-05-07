import { useState } from 'react';
import type { Person } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  label: string;
  value: string | null | undefined;
  onChange: (personId: string | null, person: Person | null) => void;
  people: Person[];
  onPeopleChanged: () => void;
}

export function PersonPicker({ label, value, onChange, people, onPeopleChanged }: Props) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selected = people.find((p) => p.id === value) ?? null;

  const handleAdd = async () => {
    if (!user || !newName.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        const path = `${user.id}/people/${Date.now()}-${photoFile.name.replace(/\s+/g, '-')}`;
        const { error: upErr } = await supabase.storage
          .from('assets')
          .upload(path, photoFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('assets').getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }
      const { data, error } = await supabase
        .from('people')
        .insert({
          user_id: user.id,
          name: newName.trim(),
          role: newRole.trim(),
          photo_url: photoUrl,
        })
        .select()
        .single();
      if (error) throw error;
      onChange(data.id, data);
      onPeopleChanged();
      setAdding(false);
      setNewName('');
      setNewRole('');
      setPhotoFile(null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-slate-700 font-medium">{label}</span>

      <div className="flex items-center gap-3">
        <select
          value={value ?? ''}
          onChange={(e) => {
            const id = e.target.value || null;
            const p = id ? people.find((pp) => pp.id === id) ?? null : null;
            onChange(id, p);
          }}
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">— None —</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.role ? ` · ${p.role}` : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="text-sm text-slate-700 underline whitespace-nowrap"
        >
          {adding ? 'Cancel' : '+ Add new'}
        </button>
      </div>

      {selected && selected.photo_url && (
        <div className="flex items-center gap-3 mt-1">
          <img
            src={selected.photo_url}
            alt={selected.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-slate-900">{selected.name}</p>
            <p className="text-xs text-slate-500">{selected.role || '—'}</p>
          </div>
        </div>
      )}

      {adding && (
        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-700">Name</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-700">Role</span>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Finance Manager · Trinidad"
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-700">Photo (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </label>
          {err && <p className="text-xs text-amber-700">{err}</p>}
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={saving || !newName.trim()}
            className="self-start bg-slate-900 text-white text-xs rounded-md px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add person'}
          </button>
        </div>
      )}
    </div>
  );
}
