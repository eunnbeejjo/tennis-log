import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchWeatherForDate } from "@/lib/weather";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    match_date,
    time_slot,
    opponent,
    score,
    result,
    court,
    condition_score,
    memo,
    string_setup_id,
  } = body;

  if (!match_date) {
    return NextResponse.json({ error: "날짜는 필수예요." }, { status: 400 });
  }

  // KMA_API_KEY는 서버에만 있는 비공개 키라, 날씨 조회는 반드시 서버(API 라우트)에서 진행
  const weather = await fetchWeatherForDate(match_date);

  const { data, error } = await supabase
    .from("matches")
    .insert({
      match_date,
      time_slot,
      opponent,
      score,
      result,
      court,
      condition_score,
      memo,
      string_setup_id: string_setup_id || null,
      weather_temp: weather.temp,
      weather_humidity: weather.humidity,
      weather_wind: weather.wind,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ match: data });
}
