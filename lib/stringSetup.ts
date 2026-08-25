import { StringSetup } from "./types";

type StringTypeFields = Pick<
  StringSetup,
  "string_type" | "main_string_type" | "cross_string_type"
>;

/** 하이브리드면 "메인 / 크로스", 단일 스트링이면 하나만 표시. */
export function formatStringTypes(s: StringTypeFields): string {
  const main = s.main_string_type || s.string_type || null;
  if (!main) return "미기록";
  if (s.cross_string_type && s.cross_string_type !== main) {
    return `${main} / ${s.cross_string_type}`;
  }
  return main;
}

type TensionFields = Pick<
  StringSetup,
  "tension" | "main_tension" | "cross_tension"
>;

/** 가로/세로 텐션이 같으면 하나만, 다르면 "세로 x / 가로 y" 형태로 표시. */
export function formatTension(s: TensionFields): string {
  const main = s.main_tension ?? s.tension ?? null;
  const cross = s.cross_tension ?? null;
  if (main == null && cross == null) return "-";
  if (cross == null || cross === main) {
    return `${main ?? cross}lbs`;
  }
  return `세로 ${main ?? "-"} / 가로 ${cross}lbs`;
}
