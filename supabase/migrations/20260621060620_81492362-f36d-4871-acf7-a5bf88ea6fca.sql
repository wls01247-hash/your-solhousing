
CREATE OR REPLACE FUNCTION public.normalize_station_name(s text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  select case
    when s is null then null
    else regexp_replace(
           regexp_replace(lower(translate(s, E' \t\u3000', '')), '駅+$', ''),
           '\s+', '', 'g'
         )
  end
$$;

CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
ALTER EXTENSION pgcrypto SET SCHEMA extensions;
