ALTER TABLE public.authors
  ADD COLUMN IF NOT EXISTS is_columnist boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.authors SET is_columnist = true WHERE bio IS NOT NULL AND length(btrim(bio)) > 0;

CREATE UNIQUE INDEX IF NOT EXISTS authors_slug_key ON public.authors (slug);