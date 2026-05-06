// Placeholder types — regenerate from your Supabase schema with:
//   npm run supabase:types
//
// Until then this gives you basic typing so the app compiles.

export type NewsletterStatus = 'draft' | 'scheduled' | 'sent' | 'archived';

export interface Newsletter {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  content: string; // markdown or HTML — your call
  status: NewsletterStatus;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed' | 'bounced';
  tags: string[];
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      newsletters: {
        Row: Newsletter;
        Insert: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Newsletter, 'id' | 'user_id' | 'created_at'>>;
      };
      subscribers: {
        Row: Subscriber;
        Insert: Omit<Subscriber, 'id' | 'subscribed_at'>;
        Update: Partial<Omit<Subscriber, 'id' | 'user_id' | 'subscribed_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      newsletter_status: NewsletterStatus;
      subscriber_status: 'active' | 'unsubscribed' | 'bounced';
    };
  };
}
