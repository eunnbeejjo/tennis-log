export interface StringSetup {
  id: string;
  racket_name: string;
  string_type: string;
  tension: number | null;
  strung_date: string | null; // YYYY-MM-DD
  feel_note: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  match_date: string; // YYYY-MM-DD
  time_slot: string | null;
  opponent: string | null;
  score: string | null;
  result: "win" | "loss" | null;
  court: string | null;
  condition_score: number | null; // 1~5
  memo: string | null;
  string_setup_id: string | null;
  weather_temp: number | null;
  weather_humidity: number | null;
  weather_wind: number | null;
  created_at: string;
}

export interface CycleEntry {
  id: string;
  start_date: string; // YYYY-MM-DD
  created_at: string;
}

export type CyclePhase = "월경기" | "난포기" | "배란기" | "황체기" | "알 수 없음";
