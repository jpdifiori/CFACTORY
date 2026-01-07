-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Project_Master
create table public.project_master (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  app_name text not null,
  niche_vertical text not null,
  description text, -- New: Product Description
  target_audience text not null,
  brand_voice text not null check (brand_voice in ('Professional', 'Funny', 'Urgent', 'Educational', 'Minimalist')),
  usp text, -- Differential Clave
  problem_solved text, -- Qué problema resuelve
  keywords text[] default '{}',
  logo_url text
);

-- 2. Content_Strategy
create table public.content_strategy (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  project_id uuid references public.project_master(id) on delete cascade not null,
  pillar_topic text not null,
  pain_point text not null,
  buying_stage text not null check (buying_stage in ('Awareness', 'Consideration', 'Decision'))
);

-- 3. Campaigns
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  project_id uuid references public.project_master(id) on delete cascade not null,
  name text not null,
  objective text not null check (objective in ('Educativo', 'Venta Directa', 'Autoridad_Miedo')),
  pillars text[] default '{}',
  cta text not null,
  visual_style text not null check (visual_style in ('Fotografia_Realista', 'Ilustracion_3D', 'Minimalista', 'Cinematic_8k')),
  color_palette text,
  mood text,
  custom_copy_instructions text,
  custom_visual_instructions text
);

-- 4. Content_Queue
create table public.content_queue (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  project_id uuid references public.project_master(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete set null, -- Optional link to campaign
  
  content_type text not null check (content_type in ('Post', 'Reel_Script', 'Blog_SEO', 'Push_Notification')),
  status text not null default 'Draft' check (status in ('Draft', 'AI_Generated', 'Approved', 'Published', 'Review_Required')),
  
  -- AI Outputs
  gemini_output jsonb, -- { headline, body_copy, hashtags, etc. }
  image_ai_prompt text,
  image_final_url text, -- Storage link
  
  scheduled_at timestamptz,
  confidence_score float -- For quality filter
);

-- Enable Row Level Security (RLS)
alter table public.project_master enable row level security;
alter table public.content_strategy enable row level security;
alter table public.campaigns enable row level security;
alter table public.content_queue enable row level security;

-- Policies (Open for now for ease of development, lock down later)
create policy "Allow all operations for anon" on public.project_master for all using (true) with check (true);
create policy "Allow all operations for anon" on public.content_strategy for all using (true) with check (true);
create policy "Allow all operations for anon" on public.campaigns for all using (true) with check (true);
create policy "Allow all operations for anon" on public.content_queue for all using (true) with check (true);

-- Storage bucket setup (Instructional)
-- insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);
