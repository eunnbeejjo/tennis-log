import { BadgeVariant } from "@eunnbeejjo/ui";
import { Match, SetScore } from "./types";

export function resultLabel(result: Match["result"]): string {
  if (result === "win") return "승";
  if (result === "draw") return "무";
  return "패";
}

export function resultBadgeVariant(result: Match["result"]): BadgeVariant {
  if (result === "win") return "success";
  if (result === "draw") return "warning";
  return "default";
}

export function formatOpponents(
  opponents?: string[] | null,
  legacyOpponent?: string | null
): string {
  if (opponents && opponents.length > 0) return opponents.join(", ");
  return legacyOpponent || "미기록";
}

/** 세트별 스코어를 "6-4, 3-6, 6-2" 형태로 합침. 기록된 세트가 없으면 구버전 score 텍스트로 대체. */
export function formatSets(
  sets?: SetScore[] | null,
  legacyScore?: string | null
): string {
  const withScore = (sets || []).filter(
    (s) => s.my != null || s.opponent != null
  );
  if (withScore.length > 0) {
    return withScore.map((s) => `${s.my ?? "-"}-${s.opponent ?? "-"}`).join(", ");
  }
  return legacyScore || "";
}
