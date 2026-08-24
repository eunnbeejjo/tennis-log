/**
 * 기상청 공공데이터포털 - 지상(종관,ASOS) 일자료 조회서비스
 * https://www.data.go.kr/data/15059093/openapi.do
 *
 * 단기예보(미래 며칠치 예보) API가 아니라 "이미 지난 날짜의 관측값"을
 * 조회하는 API를 씁니다 - 경기 기록은 대부분 지난 날짜라서요.
 *
 * 사용 전 준비물:
 * 1) data.go.kr에서 위 서비스 활용신청 -> 인증키(KMA_API_KEY) 발급
 * 2) 내 동네와 가장 가까운 관측지점 번호(stnId) 확인
 *    - data.go.kr 상세페이지의 '지점코드' 목록 참고 (예: 서울 108, 수원 119 등)
 *    - 아래 STATION_ID를 실제 값으로 바꾸거나, 환경변수 WEATHER_STATION_ID로 관리
 */

const ASOS_URL =
  "https://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList";

const DEFAULT_STATION_ID = process.env.WEATHER_STATION_ID || "119"; // 기본값: 수원

export interface WeatherResult {
  temp: number | null;
  humidity: number | null;
  wind: number | null;
}

function toApiDate(date: string): string {
  return date.replaceAll("-", ""); // "2026-09-04" -> "20260904"
}

export async function fetchWeatherForDate(
  date: string,
  stationId: string = DEFAULT_STATION_ID
): Promise<WeatherResult> {
  const apiKey = process.env.KMA_API_KEY;
  if (!apiKey) {
    return { temp: null, humidity: null, wind: null };
  }

  const apiDate = toApiDate(date);
  const url = new URL(ASOS_URL);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("dataCd", "ASOS");
  url.searchParams.set("dateCd", "DAY");
  url.searchParams.set("startDt", apiDate);
  url.searchParams.set("endDt", apiDate);
  url.searchParams.set("stnIds", stationId);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return { temp: null, humidity: null, wind: null };

    const data = await res.json();
    const item = data?.response?.body?.items?.item?.[0];
    if (!item) return { temp: null, humidity: null, wind: null };

    return {
      temp: item.avgTa ? Number(item.avgTa) : null, // 평균기온
      humidity: item.avgRhm ? Number(item.avgRhm) : null, // 평균습도
      wind: item.avgWs ? Number(item.avgWs) : null, // 평균풍속
    };
  } catch {
    return { temp: null, humidity: null, wind: null };
  }
}
