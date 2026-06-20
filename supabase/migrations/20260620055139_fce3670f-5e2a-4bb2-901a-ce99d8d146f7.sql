create extension if not exists "pgcrypto";

create or replace function public.normalize_station_name(s text)
returns text
language sql
immutable
as $$
  select case
    when s is null then null
    else regexp_replace(
           regexp_replace(lower(translate(s, E' \t\u3000', '')), '駅+$', ''),
           '\s+', '', 'g'
         )
  end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.listings (
  uid                  integer primary key,
  title                text,
  address              text,
  station_name         text,
  station_line         text,
  walk_minutes         integer,
  rent_yen             integer,
  maintenance_fee_yen  integer,
  room_type            text,
  size_sqm             numeric(6,2),
  year_built           integer,
  move_in              text,
  image_url            text,
  property_url         text not null,
  contract_status      text not null default 'available'
                       check (contract_status in ('available','contracted')),
  raw_status           text,
  thema                integer,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table if exists public.listings
  add column if not exists station_name_normalized text generated always as
    (public.normalize_station_name(station_name)) stored;

create index if not exists listings_station_status_updated_idx
  on public.listings (station_name, contract_status, updated_at desc);
create index if not exists listings_status_updated_idx
  on public.listings (contract_status, updated_at desc);
create index if not exists listings_station_norm_idx
  on public.listings (station_name_normalized, contract_status, updated_at desc);

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

grant select on public.listings to anon, authenticated;
grant all    on public.listings to service_role;

alter table public.listings enable row level security;
drop policy if exists "Anyone can view available listings" on public.listings;
create policy "Anyone can view available listings"
  on public.listings for select
  to anon, authenticated
  using (contract_status = 'available');

create table if not exists public.life_area_types (
  slug          text primary key,
  name_ko       text not null,
  emoji         text,
  description   text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

grant select on public.life_area_types to anon, authenticated;
grant all    on public.life_area_types to service_role;

alter table public.life_area_types enable row level security;
drop policy if exists "Anyone can view life area types" on public.life_area_types;
create policy "Anyone can view life area types"
  on public.life_area_types for select
  to anon, authenticated using (true);

create table if not exists public.life_areas (
  id             uuid primary key default gen_random_uuid(),
  type_slug      text not null references public.life_area_types(slug) on delete cascade,
  name_ko        text not null,
  name_ja        text,
  description    text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (type_slug, name_ko)
);

create index if not exists life_areas_type_idx on public.life_areas (type_slug, display_order);

drop trigger if exists trg_life_areas_updated_at on public.life_areas;
create trigger trg_life_areas_updated_at
  before update on public.life_areas
  for each row execute function public.set_updated_at();

grant select on public.life_areas to anon, authenticated;
grant all    on public.life_areas to service_role;

alter table public.life_areas enable row level security;
drop policy if exists "Anyone can view life areas" on public.life_areas;
create policy "Anyone can view life areas"
  on public.life_areas for select
  to anon, authenticated using (true);

create table if not exists public.life_area_stations (
  id               uuid primary key default gen_random_uuid(),
  life_area_id     uuid not null references public.life_areas(id) on delete cascade,
  station_name_ja  text not null,
  station_name_ko  text,
  display_order    integer not null default 0,
  created_at       timestamptz not null default now(),
  unique (life_area_id, station_name_ja)
);

alter table if exists public.life_area_stations
  add column if not exists station_name_normalized text generated always as
    (public.normalize_station_name(station_name_ja)) stored;

create index if not exists las_area_idx    on public.life_area_stations (life_area_id);
create index if not exists las_station_idx on public.life_area_stations (station_name_ja);
create index if not exists las_station_norm_idx
  on public.life_area_stations (station_name_normalized);

grant select on public.life_area_stations to anon, authenticated;
grant all    on public.life_area_stations to service_role;

alter table public.life_area_stations enable row level security;
drop policy if exists "Anyone can view life area stations" on public.life_area_stations;
create policy "Anyone can view life area stations"
  on public.life_area_stations for select
  to anon, authenticated using (true);

create or replace view public.recommended_listings as
select
  la.type_slug,
  la.id           as life_area_id,
  la.name_ko      as life_area_name,
  s.station_name_ja,
  s.station_name_ko,
  l.*
from public.listings l
join public.life_area_stations s
  on s.station_name_normalized = l.station_name_normalized
join public.life_areas la        on la.id = s.life_area_id
where l.contract_status = 'available';

grant select on public.recommended_listings to anon, authenticated;