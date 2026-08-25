-- Supabase SQL Editor에서 이 파일 내용을 그대로 실행하세요.
-- (Supabase 대시보드 > SQL Editor > New query > 붙여넣기 > Run)

create table if not exists string_setups (
  id uuid primary key default gen_random_uuid(),
  racket_name text not null,
  main_string_type text, -- 세로(메인) 스트링. 하이브리드가 아니면 이것만 채우면 됨
  cross_string_type text, -- 가로(크로스) 스트링 (하이브리드 세팅 시에만)
  main_tension numeric, -- 세로(메인) 텐션
  cross_tension numeric, -- 가로(크로스) 텐션. 가로/세로 동일하면 main_tension과 같은 값을 저장
  strung_date date,
  feel_note text,
  created_at timestamptz not null default now()
);

-- 이미 string_setups 테이블을 만든 적이 있다면(예전 string_type/tension 컬럼 버전), 아래를 추가로 실행하세요.
-- alter table string_setups add column if not exists main_string_type text;
-- alter table string_setups add column if not exists cross_string_type text;
-- alter table string_setups add column if not exists main_tension numeric;
-- alter table string_setups add column if not exists cross_tension numeric;
-- update string_setups set main_string_type = string_type, main_tension = tension, cross_tension = tension
--   where main_string_type is null;

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  time_slot text, -- '오전' | '오후' | '저녁' 등 자유 텍스트
  opponents text[], -- 상대방 이름 목록 (최대 5명, 앱에서 제한)
  sets jsonb, -- 세트별 게임 스코어: [{"my": 6, "opponent": 4}, ...] (게임 수는 선택 입력이라 null 가능)
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

-- 이미 matches 테이블을 만든 적이 있다면(예전 opponent/score 컬럼 버전), 아래 두 줄만 추가로 실행하세요.
-- alter table matches add column if not exists opponents text[];
-- alter table matches add column if not exists sets jsonb;

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
