export interface StringSetup {
  id: string;
  racket_name: string;
  main_string_type: string | null; // 세로(메인)
  cross_string_type: string | null; // 가로(크로스), 하이브리드 시에만
  main_tension: number | null;
  cross_tension: number | null;
  strung_date: string | null; // YYYY-MM-DD
  feel_note: string | null;
  created_at: string;
  // 구버전 호환용 (마이그레이션 전 기록에 남아있을 수 있음)
  string_type?: string | null;
  tension?: number | null;
}

export interface SetScore {
  my: number | null;
  opponent: number | null;
}

export interface Match {
  id: string;
  match_date: string; // YYYY-MM-DD
  time_slot: string | null;
  opponents: string[] | null; // 최대 5명
  sets: SetScore[] | null;
  result: "win" | "draw" | "loss" | null;
  court: string | null;
  condition_score: number | null; // 1~5
  memo: string | null;
  string_setup_id: string | null;
  weather_temp: number | null;
  weather_humidity: number | null;
  weather_wind: number | null;
  created_at: string;
  // 구버전 호환용 (마이그레이션 전 기록에 남아있을 수 있음)
  opponent?: string | null;
  score?: string | null;
}

export interface CycleEntry {
  id: string;
  start_date: string; // YYYY-MM-DD
  created_at: string;
}

export type CyclePhase = "월경기" | "난포기" | "배란기" | "황체기" | "알 수 없음";
