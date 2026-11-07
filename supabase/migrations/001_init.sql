-- HACKANOVA 2026: public site data. No personal data is stored here.

create table public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;   -- no policies: nobody can read it through the API

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  unstop_url text check (unstop_url is null or unstop_url like 'https://unstop.com/%'),
  registered_count int check (registered_count is null or registered_count >= 0),
  registrations_closed boolean not null default false,
  schedule jsonb not null default '{}'::jsonb,     -- { "slot2": { "time": "13:00", "label": "…" }, … }
  winners_published boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);
alter table public.site_settings enable row level security;
create policy settings_read on public.site_settings for select using (true);
create policy settings_admin_update on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

create table public.announcements (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 280),
  level text not null default 'normal' check (level in ('normal', 'urgent')),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);
alter table public.announcements enable row level security;
create policy ann_read on public.announcements for select using (true);
create policy ann_admin_insert on public.announcements for insert with check (public.is_admin());
create policy ann_admin_delete on public.announcements for delete using (public.is_admin());

create table public.winners (
  place int primary key check (place between 1 and 3),
  team text not null,
  project text
);
alter table public.winners enable row level security;
create policy winners_read on public.winners for select
  using ((select winners_published from public.site_settings where id = 1) or public.is_admin());
create policy winners_admin_insert on public.winners for insert with check (public.is_admin());
create policy winners_admin_update on public.winners for update using (public.is_admin()) with check (public.is_admin());
create policy winners_admin_delete on public.winners for delete using (public.is_admin());

alter publication supabase_realtime add table public.announcements, public.site_settings, public.winners;
