-- Add helpful index for fast lookups by state/name
CREATE INDEX IF NOT EXISTS idx_county_fips_state_abbr_name
  ON public.county_fips_codes(state_abbr, county_name);

-- Backfill missing counties from existing census_tracts data
INSERT INTO public.county_fips_codes (state_code, county_code, county_name, state_abbr)
SELECT DISTINCT
  ct.state_code,
  ct.county_code,
  ct.county AS county_name,
  ct.state AS state_abbr
FROM public.census_tracts ct
LEFT JOIN public.county_fips_codes cfc
  ON cfc.state_code = ct.state_code AND cfc.county_code = ct.county_code
WHERE cfc.id IS NULL
  AND ct.state_code IS NOT NULL
  AND ct.county_code IS NOT NULL
  AND ct.state IS NOT NULL
  AND ct.county IS NOT NULL;