-- VAULT SCHEMA (Google Drive Metadata Layer)

create table if not exists vault_assets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  drive_link text,    -- URL to the file in Google Drive
  thumbnail_url text, -- Optional: URL to a thumbnail
  type text check (type in ('image', 'video', 'document', 'folder')),
  tags text[], -- e.g. ['feet', 'beach', 'custom']
  price numeric default 0, -- For selling content
  folder_id text, -- Optional: For future grouping
  created_at timestamp with time zone default now()
);

-- SEED DATA
insert into vault_assets (title, type, drive_link, price, tags)
values 
('Beach Photoset Scans', 'folder', 'https://drive.google.com/drive/folders/xxxxx', 15.00, ARRAY['beach', 'summer']),
('Custom Video #402', 'video', 'https://drive.google.com/file/d/yyyyy', 50.00, ARRAY['custom', 'feet']),
('Contract Template', 'document', 'https://docs.google.com/document/d/zzzzz', 0, ARRAY['admin', 'contract']);
