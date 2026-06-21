
CREATE OR REPLACE VIEW public.recommended_listings
WITH (security_invoker = true) AS
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

GRANT SELECT ON public.recommended_listings TO anon, authenticated;
