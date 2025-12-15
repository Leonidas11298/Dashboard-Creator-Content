-- Add reference_url column
alter table content_posts add column if not exists reference_url text;

-- (Optional) If you haven't created the table yet, the full definition is updated below:
-- create table if not exists content_posts (
--   ...
--   reference_url text,
--   ...
-- );
