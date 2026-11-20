-- Grahalens — initial schema (PRD §9)
-- Whole-sign Lahiri charts live in `charts.payload`; Private entitlement
-- source of truth is RevenueCat CustomerInfo; `profiles.private_until` is a cache.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  theme text not null default 'dawn'
    check (theme in ('ink', 'dawn')),
  rc_app_user_id text,
  private_until timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.birth_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  birth_at timestamptz not null,
  lat double precision not null,
  lng double precision not null,
  tz text not null,
  time_unknown boolean not null default false,
  place_label text,
  created_at timestamptz not null default timezone('utc', now())
);

create index birth_profiles_user_id_idx on public.birth_profiles (user_id);

create table public.charts (
  id uuid primary key default gen_random_uuid(),
  birth_profile_id uuid not null references public.birth_profiles (id) on delete cascade,
  system text not null default 'lahiri_whole_sign',
  payload jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default timezone('utc', now())
);

create index charts_birth_profile_id_idx on public.charts (birth_profile_id);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  source text not null default 'lens',
  salience real not null default 0.5
    check (salience >= 0 and salience <= 1),
  created_at timestamptz not null default timezone('utc', now())
);

create index memories_user_id_idx on public.memories (user_id);

create table public.bonds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  their_birth_profile_id uuid not null references public.birth_profiles (id) on delete cascade,
  label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index bonds_user_id_idx on public.bonds (user_id);

create table public.synastry_cache (
  bond_id uuid primary key references public.bonds (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default timezone('utc', now())
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  mood text,
  weather_snapshot jsonb,
  dasha_key text,
  created_at timestamptz not null default timezone('utc', now())
);

create index journal_entries_user_id_idx on public.journal_entries (user_id);

create table public.soul_portraits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  signatures jsonb not null default '[]'::jsonb,
  prose text not null default '',
  model text,
  created_at timestamptz not null default timezone('utc', now())
);

create index soul_portraits_user_id_idx on public.soul_portraits (user_id);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Lens',
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index chat_threads_user_id_idx on public.chat_threads (user_id);

create trigger chat_threads_set_updated_at
before update on public.chat_threads
for each row execute function public.set_updated_at();

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  grounded boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index chat_messages_thread_id_idx on public.chat_messages (thread_id);

create table public.usage_counters (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  lens_count integer not null default 0 check (lens_count >= 0),
  primary key (user_id, day)
);

create table public.purchase_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null,
  store text not null
    check (store in ('app_store', 'play_store', 'mock', 'promotional', 'unknown')),
  status text not null
    check (status in ('started', 'purchased', 'restored', 'cancelled', 'failed', 'expired', 'refunded')),
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index purchase_events_user_id_idx on public.purchase_events (user_id);

-- Notification prefs: SCREENS X5 is local + push stub; store server copy for
-- signed-in sync when push is wired. Guest keeps prefs on-device only.
create table public.notification_prefs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  daily_sky boolean not null default true,
  lens_digest boolean not null default false,
  muhurta_alerts boolean not null default false,
  push_enabled boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger notification_prefs_set_updated_at
before update on public.notification_prefs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth → profile bootstrap
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Trigger-only: not callable via PostgREST RPC.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security — all user tables scoped to auth.uid()
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.charts enable row level security;
alter table public.memories enable row level security;
alter table public.bonds enable row level security;
alter table public.synastry_cache enable row level security;
alter table public.journal_entries enable row level security;
alter table public.soul_portraits enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.usage_counters enable row level security;
alter table public.purchase_events enable row level security;
alter table public.notification_prefs enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_delete_own" on public.profiles
  for delete using (id = auth.uid());

-- birth_profiles
create policy "birth_profiles_select_own" on public.birth_profiles
  for select using (user_id = auth.uid());
create policy "birth_profiles_insert_own" on public.birth_profiles
  for insert with check (user_id = auth.uid());
create policy "birth_profiles_update_own" on public.birth_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "birth_profiles_delete_own" on public.birth_profiles
  for delete using (user_id = auth.uid());

-- charts (via owning birth_profile)
create policy "charts_select_own" on public.charts
  for select using (
    exists (
      select 1 from public.birth_profiles bp
      where bp.id = charts.birth_profile_id and bp.user_id = auth.uid()
    )
  );
create policy "charts_insert_own" on public.charts
  for insert with check (
    exists (
      select 1 from public.birth_profiles bp
      where bp.id = birth_profile_id and bp.user_id = auth.uid()
    )
  );
create policy "charts_update_own" on public.charts
  for update using (
    exists (
      select 1 from public.birth_profiles bp
      where bp.id = charts.birth_profile_id and bp.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.birth_profiles bp
      where bp.id = birth_profile_id and bp.user_id = auth.uid()
    )
  );
create policy "charts_delete_own" on public.charts
  for delete using (
    exists (
      select 1 from public.birth_profiles bp
      where bp.id = charts.birth_profile_id and bp.user_id = auth.uid()
    )
  );

-- memories
create policy "memories_select_own" on public.memories
  for select using (user_id = auth.uid());
create policy "memories_insert_own" on public.memories
  for insert with check (user_id = auth.uid());
create policy "memories_update_own" on public.memories
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "memories_delete_own" on public.memories
  for delete using (user_id = auth.uid());

-- bonds
create policy "bonds_select_own" on public.bonds
  for select using (user_id = auth.uid());
create policy "bonds_insert_own" on public.bonds
  for insert with check (user_id = auth.uid());
create policy "bonds_update_own" on public.bonds
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bonds_delete_own" on public.bonds
  for delete using (user_id = auth.uid());

-- synastry_cache (via owning bond)
create policy "synastry_cache_select_own" on public.synastry_cache
  for select using (
    exists (
      select 1 from public.bonds b
      where b.id = synastry_cache.bond_id and b.user_id = auth.uid()
    )
  );
create policy "synastry_cache_insert_own" on public.synastry_cache
  for insert with check (
    exists (
      select 1 from public.bonds b
      where b.id = bond_id and b.user_id = auth.uid()
    )
  );
create policy "synastry_cache_update_own" on public.synastry_cache
  for update using (
    exists (
      select 1 from public.bonds b
      where b.id = synastry_cache.bond_id and b.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.bonds b
      where b.id = bond_id and b.user_id = auth.uid()
    )
  );
create policy "synastry_cache_delete_own" on public.synastry_cache
  for delete using (
    exists (
      select 1 from public.bonds b
      where b.id = synastry_cache.bond_id and b.user_id = auth.uid()
    )
  );

-- journal_entries
create policy "journal_entries_select_own" on public.journal_entries
  for select using (user_id = auth.uid());
create policy "journal_entries_insert_own" on public.journal_entries
  for insert with check (user_id = auth.uid());
create policy "journal_entries_update_own" on public.journal_entries
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "journal_entries_delete_own" on public.journal_entries
  for delete using (user_id = auth.uid());

-- soul_portraits
create policy "soul_portraits_select_own" on public.soul_portraits
  for select using (user_id = auth.uid());
create policy "soul_portraits_insert_own" on public.soul_portraits
  for insert with check (user_id = auth.uid());
create policy "soul_portraits_update_own" on public.soul_portraits
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "soul_portraits_delete_own" on public.soul_portraits
  for delete using (user_id = auth.uid());

-- chat_threads
create policy "chat_threads_select_own" on public.chat_threads
  for select using (user_id = auth.uid());
create policy "chat_threads_insert_own" on public.chat_threads
  for insert with check (user_id = auth.uid());
create policy "chat_threads_update_own" on public.chat_threads
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "chat_threads_delete_own" on public.chat_threads
  for delete using (user_id = auth.uid());

-- chat_messages (via owning thread)
create policy "chat_messages_select_own" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );
create policy "chat_messages_insert_own" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );
create policy "chat_messages_update_own" on public.chat_messages
  for update using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );
create policy "chat_messages_delete_own" on public.chat_messages
  for delete using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );

-- usage_counters
create policy "usage_counters_select_own" on public.usage_counters
  for select using (user_id = auth.uid());
create policy "usage_counters_insert_own" on public.usage_counters
  for insert with check (user_id = auth.uid());
create policy "usage_counters_update_own" on public.usage_counters
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "usage_counters_delete_own" on public.usage_counters
  for delete using (user_id = auth.uid());

-- purchase_events
create policy "purchase_events_select_own" on public.purchase_events
  for select using (user_id = auth.uid());
create policy "purchase_events_insert_own" on public.purchase_events
  for insert with check (user_id = auth.uid());
create policy "purchase_events_update_own" on public.purchase_events
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "purchase_events_delete_own" on public.purchase_events
  for delete using (user_id = auth.uid());

-- notification_prefs
create policy "notification_prefs_select_own" on public.notification_prefs
  for select using (user_id = auth.uid());
create policy "notification_prefs_insert_own" on public.notification_prefs
  for insert with check (user_id = auth.uid());
create policy "notification_prefs_update_own" on public.notification_prefs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notification_prefs_delete_own" on public.notification_prefs
  for delete using (user_id = auth.uid());
