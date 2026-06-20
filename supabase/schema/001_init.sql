-- =====================================================================
-- 솔하우징 추천 시스템 — 초기 스키마
-- 실행 위치: 외부 Supabase 프로젝트 (SQL Editor 에 그대로 붙여넣기)
-- 주의: Lovable Cloud DB 가 아닌 별도 Supabase 프로젝트에서 실행하세요.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. 확장
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. listings — 솔하우징 매물
--    uid: 솔하우징 사이트의 매물 고유번호 (view.php?uid=NNN)
-- ---------------------------------------------------------------------
create table if not exists public.listings (
  uid                  integer primary key,
  title                text,
  address              text,
  station_name         text,            -- 일본어 역명 (예: 中野)
  station_line         text,            -- 일본어 노선명
  walk_minutes         integer,
  rent_yen             integer,         -- 월세 (엔)
  maintenance_fee_yen  integer,         -- 관리비 (엔)
  room_type            text,            -- 1R / 1K / 1DK ...
  size_sqm             numeric(6,2),    -- 전용면적 (㎡)
  year_built           integer,
  move_in              text,            -- 입주 가능 시기 (원문 그대로)
  image_url            text,
  property_url         text not null,   -- 상세 페이지 URL
  contract_status      text not null default 'available'
                       check (contract_status in ('available','contracted')),
  raw_status           text,            -- 사이트 원문 상태 텍스트 (디버깅용)
  thema                integer,         -- 솔하우징 thema 파라미터
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists listings_station_status_updated_idx
  on public.listings (station_name, contract_status, updated_at desc);

create index if not exists listings_status_updated_idx
  on public.listings (contract_status, updated_at desc);

-- updated_at 자동 갱신 트리거
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

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Data API 권한 (PostgREST)
grant select on public.listings to anon;            -- 공개 읽기
grant select on public.listings to authenticated;
grant all    on public.listings to service_role;    -- 크롤러/관리자

-- RLS — 공개 매물만 누구나 조회 가능
alter table public.listings enable row level security;

drop policy if exists "Anyone can view available listings" on public.listings;
create policy "Anyone can view available listings"
  on public.listings for select
  to anon, authenticated
  using (contract_status = 'available');

-- service_role 은 RLS 우회하므로 별도 policy 불필요


-- ---------------------------------------------------------------------
-- 2. life_area_types — 심리테스트 결과 유형
--    slug: MOVE / SAVE / LIFE / HOME / MOVE_LIFE / SAVE_HOME / MOVE_HOME / LIFE_HOME
-- ---------------------------------------------------------------------
create table if not exists public.life_area_types (
  slug         text primary key,
  name_ko      text not null,           -- 예: "환승 알레르기형"
  emoji        text,
  description  text,
  created_at   timestamptz not null default now()
);

grant select on public.life_area_types to anon, authenticated;
grant all    on public.life_area_types to service_role;

alter table public.life_area_types enable row level security;
drop policy if exists "Anyone can view life area types" on public.life_area_types;
create policy "Anyone can view life area types"
  on public.life_area_types for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 3. life_areas — 유형별 생활권 (예: MOVE → 나카노, 오기쿠보, 츠나시마)
-- ---------------------------------------------------------------------
create table if not exists public.life_areas (
  id            uuid primary key default gen_random_uuid(),
  type_slug     text not null references public.life_area_types(slug) on delete cascade,
  name_ko       text not null,         -- 한국어 생활권 이름 (예: "나카노")
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (type_slug, name_ko)
);

create index if not exists life_areas_type_idx on public.life_areas (type_slug, display_order);

grant select on public.life_areas to anon, authenticated;
grant all    on public.life_areas to service_role;

alter table public.life_areas enable row level security;
drop policy if exists "Anyone can view life areas" on public.life_areas;
create policy "Anyone can view life areas"
  on public.life_areas for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 4. type_station_mapping — 유형 → 일본어 역명 매핑
--    listings.station_name 과 직접 JOIN 가능하도록 station_name_ja 사용
-- ---------------------------------------------------------------------
create table if not exists public.type_station_mapping (
  id               uuid primary key default gen_random_uuid(),
  type_slug        text not null references public.life_area_types(slug) on delete cascade,
  life_area_id     uuid references public.life_areas(id) on delete set null,
  station_name_ja  text not null,      -- 솔하우징 데이터와 매칭되는 일본어 역명
  station_name_ko  text,               -- 한국어 표기 (선택)
  created_at       timestamptz not null default now(),
  unique (type_slug, station_name_ja)
);

create index if not exists tsm_type_idx    on public.type_station_mapping (type_slug);
create index if not exists tsm_station_idx on public.type_station_mapping (station_name_ja);

grant select on public.type_station_mapping to anon, authenticated;
grant all    on public.type_station_mapping to service_role;

alter table public.type_station_mapping enable row level security;
drop policy if exists "Anyone can view type station mapping" on public.type_station_mapping;
create policy "Anyone can view type station mapping"
  on public.type_station_mapping for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 5. 추천 조회용 뷰 (선택)
--    유형 slug 로 한 번에 모집중 매물을 최신순 조회
-- ---------------------------------------------------------------------
create or replace view public.recommended_listings as
select
  m.type_slug,
  l.*
from public.listings l
join public.type_station_mapping m
  on m.station_name_ja = l.station_name
where l.contract_status = 'available';

grant select on public.recommended_listings to anon, authenticated;

-- 사용 예시:
--   select * from public.recommended_listings
--   where type_slug = 'MOVE'
--   order by updated_at desc
--   limit 3;