import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/services/settings.service';
import { peopleService } from '@/services/people.service';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/friendlyError';
import type { Person } from '@/types/database.types';

export function SettingsPage() {
  const { user } = useAuth();

  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const [s, p] = await Promise.all([
          settingsService.get(user.id),
          peopleService.list(user.id),
        ]);
        setAuthorName(s?.author_name ?? '');
        setAuthorRole(s?.author_role ?? '');
        setPhotoUrl(s?.author_photo_url ?? null);
        setPeople(p);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const reloadPeople = async () => {
    if (!user) return;
    setPeople(await peopleService.list(user.id));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setMsg(null);
    try {
      let nextPhotoUrl = photoUrl;
      if (photoFile) {
        const path = `${user.id}/profile/${Date.now()}-${photoFile.name.replace(/\s+/g, '-')}`;
        const { error: upErr } = await supabase.storage
          .from('assets')
          .upload(path, photoFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('assets').getPublicUrl(path);
        nextPhotoUrl = pub.publicUrl;
      }
      const updated = await settingsService.upsert({
        user_id: user.id,
        author_name: authorName,
        author_role: authorRole,
        author_photo_url: nextPhotoUrl,
      });
      setPhotoUrl(updated.author_photo_url);
      setPhotoFile(null);
      setMsg({ kind: 'ok', text: 'Profile saved.' });
    } catch (e) {
      setMsg({ kind: 'err', text: friendlyError(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPerson = async () => {
    if (!user || !newName.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      let pUrl: string | null = null;
      if (newPhoto) {
        const path = `${user.id}/people/${Date.now()}-${newPhoto.name.replace(/\s+/g, '-')}`;
        const { error: upErr } = await supabase.storage
          .from('assets')
          .upload(path, newPhoto, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('assets').getPublicUrl(path);
        pUrl = pub.publicUrl;
      }
      const { error } = await supabase.from('people').insert({
        user_id: user.id,
        name: newName.trim(),
        role: newRole.trim(),
        photo_url: pUrl,
      });
      if (error) throw error;
      setNewName('');
      setNewRole('');
      setNewPhoto(null);
      await reloadPeople();
      setMsg({ kind: 'ok', text: 'Person added.' });
    } catch (e) {
      setMsg({ kind: 'err', text: friendlyError(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePerson = async (id: string) => {
    if (!confirm('Remove this person from your roster? Newsletters that referenced them will keep their snapshot data.'))
      return;
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) {
      setMsg({ kind: 'err', text: error.message });
      return;
    }
    await reloadPeople();
  };

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="max-w-3xl flex flex-col gap-10">
      <div>
        <h2 className="font-serif text-3xl tracking-tight text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Author profile (used in the welcome letter) and people roster (Compliance Champion / Corner Office).
        </p>
      </div>

      {msg && (
        <p
          className={`text-sm rounded-md px-3 py-2 ${
            msg.kind === 'ok'
              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
              : 'text-amber-800 bg-amber-50 border border-amber-200'
          }`}
        >
          {msg.text}
        </p>
      )}

      <section className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-900">Author profile</h3>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Name</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Role</span>
          <input
            type="text"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Regional Head of Compliance and Reporting"
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>

        <div className="flex items-center gap-4">
          {photoUrl && (
            <img src={photoUrl} alt={authorName} className="w-16 h-16 rounded-full object-cover" />
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => void handleSaveProfile()}
          disabled={saving}
          className="self-start bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-900">People roster</h3>
        <p className="text-xs text-slate-500 -mt-2">
          Used in Compliance Champion / Corner Office picks. You can also add people inline from those slot editors.
        </p>

        {people.length === 0 ? (
          <p className="text-sm italic text-slate-500">No people yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 -mx-6 px-6">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.role || '—'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeletePerson(p.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <p className="text-xs text-slate-500 font-medium">Add a person</p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Role · Location"
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <button
            type="button"
            onClick={() => void handleAddPerson()}
            disabled={saving || !newName.trim()}
            className="self-start bg-slate-900 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add person'}
          </button>
        </div>
      </section>
    </div>
  );
}
