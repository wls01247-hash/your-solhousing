
CREATE TABLE public.listings (
  uid INTEGER PRIMARY KEY,
  title TEXT,
  address TEXT,
  station_name TEXT,
  station_line TEXT,
  walk_minutes INTEGER,
  rent_yen INTEGER,
  maintenance_fee_yen INTEGER,
  room_type TEXT,
  size_sqm NUMERIC(6,2),
  year_built INTEGER,
  move_in TEXT,
  image_url TEXT,
  property_url TEXT NOT NULL,
  contract_status TEXT NOT NULL DEFAULT 'available',
  raw_status TEXT,
  thema INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listings_station_status_idx ON public.listings (station_name, contract_status);
CREATE INDEX listings_updated_at_idx ON public.listings (updated_at DESC);

GRANT SELECT ON public.listings TO anon, authenticated;
GRANT ALL ON public.listings TO service_role;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available listings"
  ON public.listings
  FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER listings_set_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
