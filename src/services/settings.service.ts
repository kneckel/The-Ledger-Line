import { supabase } from '@/lib/supabase';
import type { Settings } from '@/types/database.types';

export const settingsService = {
  async get(userId: string): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsert(input: {
    user_id: string;
    author_name?: string;
    author_role?: string;
    author_photo_url?: string | null;
    brand?: Record<string, unknown>;
  }): Promise<Settings> {
    const { data, error } = await supabase
      .from('settings')
      .upsert(input, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
