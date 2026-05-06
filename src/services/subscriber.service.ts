import { supabase } from '@/lib/supabase';
import type { Subscriber } from '@/types/database.types';

export const subscriberService = {
  async list(userId: string): Promise<Subscriber[]> {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async add(input: {
    user_id: string;
    email: string;
    name?: string | null;
    tags?: string[];
  }): Promise<Subscriber> {
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        user_id: input.user_id,
        email: input.email,
        name: input.name ?? null,
        tags: input.tags ?? [],
        status: 'active',
        unsubscribed_at: null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unsubscribe(id: string): Promise<void> {
    const { error } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (error) throw error;
  },
};
