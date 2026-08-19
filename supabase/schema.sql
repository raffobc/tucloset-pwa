-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase
-- (Dashboard > SQL Editor > New query)

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- Tabla de prendas
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('top','bottom','dress','outerwear','shoes','accessory','other')),
  color text,
  season text not null default 'todo el año',
  image_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- Tabla de outfits
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Relación N:M entre outfits y prendas
create table if not exists outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  unique (outfit_id, item_id)
);

-- Índices
create index if not exists items_user_id_idx on items(user_id);
create index if not exists outfits_user_id_idx on outfits(user_id);
create index if not exists outfit_items_outfit_id_idx on outfit_items(outfit_id);

-- Row Level Security: cada usuario solo ve/edita lo suyo
alter table items enable row level security;
alter table outfits enable row level security;
alter table outfit_items enable row level security;

create policy "items: select own" on items for select using (auth.uid() = user_id);
create policy "items: insert own" on items for insert with check (auth.uid() = user_id);
create policy "items: update own" on items for update using (auth.uid() = user_id);
create policy "items: delete own" on items for delete using (auth.uid() = user_id);

create policy "outfits: select own" on outfits for select using (auth.uid() = user_id);
create policy "outfits: insert own" on outfits for insert with check (auth.uid() = user_id);
create policy "outfits: update own" on outfits for update using (auth.uid() = user_id);
create policy "outfits: delete own" on outfits for delete using (auth.uid() = user_id);

create policy "outfit_items: select own" on outfit_items for select using (
  exists (select 1 from outfits o where o.id = outfit_id and o.user_id = auth.uid())
);
create policy "outfit_items: insert own" on outfit_items for insert with check (
  exists (select 1 from outfits o where o.id = outfit_id and o.user_id = auth.uid())
);
create policy "outfit_items: delete own" on outfit_items for delete using (
  exists (select 1 from outfits o where o.id = outfit_id and o.user_id = auth.uid())
);

-- Storage bucket para fotos de prendas (público para poder mostrar las imágenes)
insert into storage.buckets (id, name, public)
values ('closet-photos', 'closet-photos', true)
on conflict (id) do nothing;

create policy "closet-photos: public read"
on storage.objects for select
using (bucket_id = 'closet-photos');

create policy "closet-photos: owner upload"
on storage.objects for insert
with check (bucket_id = 'closet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "closet-photos: owner delete"
on storage.objects for delete
using (bucket_id = 'closet-photos' and auth.uid()::text = (storage.foldername(name))[1]);
