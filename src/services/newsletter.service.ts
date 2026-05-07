import { supabase } from '@/lib/supabase';
import type { Newsletter, NewsletterInsert, NewsletterStatus } from '@/types/database.types';

type NewsletterUpdate = Partial<Omit<NewsletterInsert, 'user_id'>>;

export const newsletterService = {
  async list(userId: string): Promise<Newsletter[]> {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Newsletter | null> {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(input: {
    user_id: string;
    template_id: string;
    title: string;
    period_label?: string;
    inputs?: Record<string, unknown>;
  }): Promise<Newsletter> {
    const { data, error } = await supabase
      .from('newsletters')
      .insert({
        user_id: input.user_id,
        template_id: input.template_id,
        title: input.title,
        period_label: input.period_label ?? '',
        status: 'draft' as NewsletterStatus,
        inputs: input.inputs ?? {},
        sections: {},
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: NewsletterUpdate): Promise<Newsletter> {
    const { data, error } = await supabase
      .from('newsletters')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('newsletters').delete().eq('id', id);
    if (error) throw error;
  },

  // Find the most-recent published issue of the same template for this user.
  // Used to pre-fill `sections` when starting a new issue.
  async findPrefillSource(userId: string, templateId: string): Promise<Newsletter | null> {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  // List this user's prior issues of a template — used by the "pick a specific
  // past issue" option on create.
  async listForTemplate(userId: string, templateId: string): Promise<Newsletter[]> {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async snapshot(newsletterId: string, sections: Record<string, unknown>): Promise<void> {
    const { error } = await supabase
      .from('newsletter_versions')
      .insert({ newsletter_id: newsletterId, sections });
    if (error) throw error;
  },

  // Publish: status -> 'published', mint a share_token if missing, set
  // published_at, and stamp the author snapshot into welcome_letter sections
  // (RLS hides settings from the public share route).
  // Idempotent — re-publishing keeps the same token so any links Reneé
  // already shared keep working.
  async publish(id: string): Promise<Newsletter> {
    const current = await newsletterService.getById(id);
    if (!current) throw new Error('Newsletter not found.');
    const token = current.share_token ?? crypto.randomUUID();

    // Pull settings + template so we can stamp the author into welcome letters.
    const [{ data: settings }, { data: template }] = await Promise.all([
      supabase.from('settings').select('*').eq('user_id', current.user_id).maybeSingle(),
      supabase.from('templates').select('slot_spec').eq('id', current.template_id).single(),
    ]);

    const sections = { ...((current.sections ?? {}) as Record<string, Record<string, unknown>>) };
    if (settings && template) {
      const slotSpec = template.slot_spec as { slots: { name: string; type: string }[] };
      for (const slot of slotSpec.slots) {
        if (slot.type === 'welcome_letter' && sections[slot.name]) {
          sections[slot.name] = {
            ...sections[slot.name],
            author_name: settings.author_name,
            author_role: settings.author_role,
            author_photo_url: settings.author_photo_url,
          };
        }
      }
    }

    const { data, error } = await supabase
      .from('newsletters')
      .update({
        status: 'published',
        share_token: token,
        published_at: new Date().toISOString(),
        sections,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unpublish(id: string): Promise<Newsletter> {
    const { data, error } = await supabase
      .from('newsletters')
      .update({ status: 'draft' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Duplicate: copy title/template/period/sections into a new draft.
  // Title gets a "Copy of …" prefix so the user can rename in place.
  async duplicate(id: string): Promise<Newsletter> {
    const src = await newsletterService.getById(id);
    if (!src) throw new Error('Newsletter not found.');
    const { data, error } = await supabase
      .from('newsletters')
      .insert({
        user_id: src.user_id,
        template_id: src.template_id,
        title: src.title ? `Copy of ${src.title}` : '',
        period_label: src.period_label,
        status: 'draft',
        inputs: (src.inputs ?? {}) as Record<string, unknown>,
        sections: (src.sections ?? {}) as Record<string, unknown>,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Anonymous fetch by share_token — used by the public share route.
  // RLS allows SELECT on published rows with a token, so this works without
  // a session.
  async getBySharedToken(token: string): Promise<Newsletter | null> {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('share_token', token)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
