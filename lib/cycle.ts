import { CycleEntry, CyclePhase } from "./types";

const DEFAULT_CYCLE_LENGTH = 28;
const PERIOD_LENGTH = 5; // 월경기로 간주하는 일수 (대략치)
const OVULATION_WINDOW = [12, 16]; // 주기 12~16일차를 배란기로 간주 (대략치)

/**
 * 기록된 시작일들로 평균 주기 길이를 계산합니다.
 * 기록이 2개 미만이면 기본값(28일)을 사용합니다.
 */
export function getAverageCycleLength(entries: CycleEntry[]): number {
  if (entries.length < 2) return DEFAULT_CYCLE_LENGTH;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days =
      (new Date(sorted[i].start_date).getTime() -
        new Date(sorted[i - 1].start_date).getTime()) /
      (1000 * 60 * 60 * 24);
    if (days > 10 && days < 60) diffs.push(days); // 이상치 제거
  }

  if (diffs.length === 0) return DEFAULT_CYCLE_LENGTH;
  return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
}

/**
 * 특정 날짜가 주기 몇 일째인지, 어느 단계인지 계산합니다.
 * 기준이 되는 "가장 최근 시작일"을 찾아서 그로부터의 경과일로 판단합니다.
 */
export function getCyclePhase(
  targetDate: string,
  entries: CycleEntry[]
): { dayInCycle: number | null; phase: CyclePhase } {
  if (entries.length === 0) return { dayInCycle: null, phase: "알 수 없음" };

  const target = new Date(targetDate).getTime();
  const cycleLength = getAverageCycleLength(entries);

  // target 이전(또는 같은 날) 중 가장 최근 시작일 찾기
  const priorStarts = entries
    .map((e) => new Date(e.start_date).getTime())
    .filter((t) => t <= target)
    .sort((a, b) => b - a);

  if (priorStarts.length === 0) return { dayInCycle: null, phase: "알 수 없음" };

  const mostRecentStart = priorStarts[0];
  const dayInCycle =
    Math.floor((target - mostRecentStart) / (1000 * 60 * 60 * 24)) + 1;

  // 다음 예상 시작일을 넘었으면(오래된 데이터 기준) 신뢰도가 떨어짐을 감안
  let phase: CyclePhase;
  if (dayInCycle <= PERIOD_LENGTH) {
    phase = "월경기";
  } else if (dayInCycle >= OVULATION_WINDOW[0] && dayInCycle <= OVULATION_WINDOW[1]) {
    phase = "배란기";
  } else if (dayInCycle < OVULATION_WINDOW[0]) {
    phase = "난포기";
  } else if (dayInCycle <= cycleLength) {
    phase = "황체기";
  } else {
    phase = "알 수 없음"; // 예상 주기를 넘어감 - 다음 시작일 기록 필요
  }

  return { dayInCycle, phase };
}

export type SimpleCyclePhase = "생리 전" | "생리 중" | "생리 후" | "알 수 없음";

export const SIMPLE_PHASE_ORDER: SimpleCyclePhase[] = [
  "생리 전",
  "생리 중",
  "생리 후",
  "알 수 없음",
];

/**
 * 4단계(월경기/난포기/배란기/황체기)를 통계용으로 "생리 전/중/후" 3단계로 묶습니다.
 * 난포기·배란기(생리 직후~배란)는 "생리 후", 황체기(다음 생리 직전)는 "생리 전"으로 묶어요.
 */
export function simplifyPhase(phase: CyclePhase): SimpleCyclePhase {
  switch (phase) {
    case "월경기":
      return "생리 중";
    case "난포기":
    case "배란기":
      return "생리 후";
    case "황체기":
      return "생리 전";
    default:
      return "알 수 없음";
  }
}
