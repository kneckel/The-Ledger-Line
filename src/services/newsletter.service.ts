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
};
