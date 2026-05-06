-- Initial schema for newsletter app
-- Run this in the Supabase SQL editor, or use `supabase db push` if using the CLI.

-- Enums
create type public.newsletter_status as enum ('draft', 'scheduled', 'sent', 'archived');
create type public.subscriber_status as enum ('active', 'unsubscribed', 'bounced');

-- Newsletters
create table public.newsletters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  subject text not null default '',
  content text not null default '',
  status public.newsletter_status not null default 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index newsletters_user_id_idx on public.newsletters (user_id);
create index newsletters_status_idx on public.newsletters (status);

-- Subscribers
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  name text,
  status public.subscriber_status not null default 'active',
  tags text[] not null default '{}',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unique (user_id, email)
);

create index subscribers_user_id_idx on public.subscribers (user_id);
create index subscribers_status_idx on public.subscribers (status);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger newsletters_set_updated_at
before update on public.newsletters
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.newsletters enable row level security;
alter table public.subscribers enable row level security;

-- Newsletters: owners only
create policy "Newsletters are viewable by owner"
on public.newsletters for select
using (auth.uid() = user_id);

create policy "Newsletters are insertable by owner"
on public.newsletters for insert
with check (auth.uid() = user_id);

create policy "Newsletters are updatable by owner"
on public.newsletters for update
using (auth.uid() = user_id);

create policy "Newsletters are deletable by owner"
on public.newsletters for delete
using (auth.uid() = user_id);

-- Subscribers: owners only
create policy "Subscribers are viewable by owner"
on public.subscribers for select
using (auth.uid() = user_id);

create policy "Subscribers are insertable by owner"
on public.subscribers for insert
with check (auth.uid() = user_id);

create policy "Subscribers are updatable by owner"
on public.subscribers for update
using (auth.uid() = user_id);

create policy "Subscribers are deletable by owner"
on public.subscribers for delete
using (auth.uid() = user_id);
