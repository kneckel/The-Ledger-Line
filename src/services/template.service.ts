import { supabase } from '@/lib/supabase';
import type { Template } from '@/types/database.types';

export const templateService = {
  async list(): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async getBySlug(slug: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
