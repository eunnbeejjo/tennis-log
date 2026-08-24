-- Supabase SQL Editor에서 이 파일 내용을 그대로 실행하세요.
-- (Supabase 대시보드 > SQL Editor > New query > 붙여넣기 > Run)

create table if not exists string_setups (
  id uuid primary key default gen_random_uuid(),
  racket_name text not null,
  string_type text not null,
  tension numeric,
  strung_date date,
  feel_note text,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  time_slot text, -- '오전' | '오후' | '저녁' 등 자유 텍스트
  opponent text,
  score text,
  result text, -- 'win' | 'loss'
  court text,
  condition_score int, -- 1~5
  memo text,
  string_setup_id uuid references string_setups(id) on delete set null,
  weather_temp numeric,
  weather_humidity numeric,
  weather_wind numeric,
  created_at timestamptz not null default now()
);

create table if not exists cycle_entries (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  created_at timestamptz not null default now()
);

-- 개인 전용 앱이라 RLS는 끄고 anon key로 바로 접근합니다.
-- (PIN 잠금은 애플리케이션 레벨에서 처리)
alter table string_setups disable row level security;
alter table matches disable row level security;
alter table cycle_entries disable row level security;
