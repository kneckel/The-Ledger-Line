import { supabase } from '@/lib/supabase';
import type { Newsletter } from '@/types/database.types';

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
    title: string;
    subject: string;
    content: string;
  }): Promise<Newsletter> {
    const { data, error } = await supabase
      .from('newsletters')
      .insert({
        ...input,
        status: 'draft',
        scheduled_for: null,
        sent_at: null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: Partial<Newsletter>): Promise<Newsletter> {
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
};
