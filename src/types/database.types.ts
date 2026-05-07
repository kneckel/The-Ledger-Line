// Hand-maintained database types matching supabase/migrations/0001_initial_schema.sql.
// To regenerate from the live Supabase project, run `npm run supabase:types`.
//
// Note: these are `type` aliases, not interfaces. Supabase's PostgREST client
// constrains tables to extend `Record<string, unknown>`, and TS interfaces with
// explicit keys do NOT structurally satisfy that constraint — type aliases do.

export type NewsletterStatus = 'draft' | 'published' | 'archived';
export type TemplateCadence = 'monthly' | 'quarterly' | 'special' | 'annual' | 'onboarding';
export type ExportFormat = 'pdf' | 'docx' | 'md';
export type AssetKind = 'logo' | 'image' | 'other';

export type SlotType =
  | 'cover'
  | 'welcome_letter'
  | 'feature_article'
  | 'corner_office'
  | 'policy_refresher'
  | 'spot_the_red_flag'
  | 'compliance_champion'
  | 'audit_radar'
  | 'award_announcement'
  | 'dates_to_remember'
  | 'quick_hits'
  | 'closing_cta';

// One slot inside a template's slot_spec.
export type SlotSpec = {
  name: string;
  type: SlotType;
  hint?: string;
  min_words?: number;
  max_words?: number;
};

export type Template = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cadence: TemplateCadence;
  slot_spec: { slots: SlotSpec[] };
  cover_style: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
};

export type Settings = {
  user_id: string;
  author_name: string;
  author_role: string;
  author_photo_url: string | null;
  brand: Record<string, unknown>;
  updated_at: string;
};

export type Person = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  photo_url: string | null;
  notes: string;
  created_at: string;
};

export type Asset = {
  id: string;
  user_id: string;
  kind: AssetKind;
  file_path: string;
  original_filename: string | null;
  mime_type: string | null;
  created_at: string;
};

export type Newsletter = {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  issue_number: number | null;
  period_label: string;
  status: NewsletterStatus;
  share_token: string | null;
  inputs: Record<string, unknown>;
  sections: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsletterVersion = {
  id: string;
  newsletter_id: string;
  sections: Record<string, unknown>;
  created_at: string;
};

export type ExportRow = {
  id: string;
  newsletter_id: string;
  format: ExportFormat;
  file_path: string;
  generated_at: string;
};

export type TemplateInsert = {
  slug: string;
  name: string;
  description?: string;
  cadence: TemplateCadence;
  slot_spec: { slots: SlotSpec[] };
  cover_style?: Record<string, unknown>;
  is_active?: boolean;
};

export type SettingsInsert = {
  user_id: string;
  author_name?: string;
  author_role?: string;
  author_photo_url?: string | null;
  brand?: Record<string, unknown>;
};

export type PersonInsert = {
  user_id: string;
  name: string;
  role?: string;
  photo_url?: string | null;
  notes?: string;
};

export type AssetInsert = {
  user_id: string;
  kind?: AssetKind;
  file_path: string;
  original_filename?: string | null;
  mime_type?: string | null;
};

export type NewsletterInsert = {
  user_id: string;
  template_id: string;
  title?: string;
  issue_number?: number | null;
  period_label?: string;
  status?: NewsletterStatus;
  share_token?: string | null;
  inputs?: Record<string, unknown>;
  sections?: Record<string, unknown>;
  published_at?: string | null;
};

export type NewsletterVersionInsert = {
  newsletter_id: string;
  sections: Record<string, unknown>;
};

export type ExportRowInsert = {
  newsletter_id: string;
  format: ExportFormat;
  file_path: string;
};

export type Database = {
  public: {
    Tables: {
      templates: {
        Row: Template;
        Insert: TemplateInsert;
        Update: Partial<TemplateInsert>;
        Relationships: [];
      };
      settings: {
        Row: Settings;
        Insert: SettingsInsert;
        Update: Partial<Omit<SettingsInsert, 'user_id'>>;
        Relationships: [];
      };
      people: {
        Row: Person;
        Insert: PersonInsert;
        Update: Partial<Omit<PersonInsert, 'user_id'>>;
        Relationships: [];
      };
      assets: {
        Row: Asset;
        Insert: AssetInsert;
        Update: Partial<Omit<AssetInsert, 'user_id'>>;
        Relationships: [];
      };
      newsletters: {
        Row: Newsletter;
        Insert: NewsletterInsert;
        Update: Partial<Omit<NewsletterInsert, 'user_id'>>;
        Relationships: [];
      };
      newsletter_versions: {
        Row: NewsletterVersion;
        Insert: NewsletterVersionInsert;
        Update: Partial<NewsletterVersionInsert>;
        Relationships: [];
      };
      exports: {
        Row: ExportRow;
        Insert: ExportRowInsert;
        Update: Partial<ExportRowInsert>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    CompositeTypes: Record<never, never>;
    Enums: {
      newsletter_status: NewsletterStatus;
      template_cadence: TemplateCadence;
      export_format: ExportFormat;
      asset_kind: AssetKind;
    };
  };
};
