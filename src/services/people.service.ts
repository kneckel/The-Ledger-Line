import { supabase } from '@/lib/supabase';
import type { Person } from '@/types/database.types';

export const peopleService = {
  async list(userId: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },
};
