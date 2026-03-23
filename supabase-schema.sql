-- ============================================================
-- KayAcademy — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. ENROLLMENTS
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 2. PROGRESS
create table if not exists public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  lesson_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, course_id, lesson_id)
);

-- 3. ACTIVITY (for inactivity tracking & reminders)
create table if not exists public.activity (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  last_active_at timestamptz default now()
);

-- 4. CERTIFICATES
create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  issued_at timestamptz default now(),
  certificate_code text unique,
  unique(user_id, course_id)
);

-- ============================================================
-- ROW LEVEL SECURITY — users can only access their own data
-- ============================================================

alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.activity enable row level security;
alter table public.certificates enable row level security;

-- ENROLLMENTS policies
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "Users can insert own enrollments"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

-- PROGRESS policies
create policy "Users can read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can upsert own progress"
  on public.progress for update
  using (auth.uid() = user_id);

-- ACTIVITY policies
create policy "Users can read own activity"
  on public.activity for select
  using (auth.uid() = user_id);

create policy "Users can upsert own activity"
  on public.activity for insert
  with check (auth.uid() = user_id);

create policy "Users can update own activity"
  on public.activity for update
  using (auth.uid() = user_id);

-- CERTIFICATES policies
create policy "Users can read own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "Users can insert own certificates"
  on public.certificates for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Done! All 4 tables created with RLS enabled.
-- ============================================================
