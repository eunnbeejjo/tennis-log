# 테니스 로그 🎾

경기 기록, 스트링 세팅, 생리주기, 날씨를 한 곳에 기록하는 개인용 PWA입니다.
아이폰 Safari에서 "홈 화면에 추가"로 설치해서 앱처럼 씁니다 (앱스토어 미출시).

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 "환경변수 준비" 참고)
npm run dev
```

http://localhost:3000 에서 확인 (모바일 화면 폭으로 보는 걸 추천 — 크롬
개발자도구에서 기기 툴바 켜고 iPhone 선택하면 실제 느낌과 비슷해요).

## 환경변수 준비

### 1. Supabase (DB)

1. https://supabase.com 무료 가입 → New Project 생성
2. 생성 후 왼쪽 메뉴 **SQL Editor** → New query → 이 레포의
   `supabase/schema.sql` 내용을 그대로 붙여넣고 Run
   (`matches`, `string_setups`, `cycle_entries` 테이블이 만들어져요)
3. 왼쪽 메뉴 **Project Settings > API**에서 아래 두 값을 확인해 `.env.local`에 채우기
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. 기상청 API (날씨 자동 연동)

1. https://www.data.go.kr 회원가입
2. "지상(종관,ASOS) 일자료 조회서비스" 검색 → 활용신청 (승인은 보통 빠르게 남)
3. 마이페이지에서 발급된 **인증키(Encoding 또는 Decoding 키)**를
   `KMA_API_KEY`에 채우기
4. 내 동네와 가까운 관측지점 번호를 찾아서 `.env.local`의
   `WEATHER_STATION_ID`에 채우기 (해당 서비스 상세페이지에 지점코드 표
   있음, 예: 서울 108, 수원 119, 인천 112 등)
   - 안 채우면 기본값(수원, 119)으로 동작해요

### 3. PIN 잠금

터미널에서 원하는 4자리 PIN으로 해시를 생성:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('1234').digest('hex'))"
```

나온 문자열을 `.env.local`의 `APP_PIN_HASH`에 채우기.
`SESSION_SECRET`은 아무 긴 임의의 문자열이면 됩니다 (예: 아래 명령으로 생성):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **참고**: 이 PIN 잠금은 "링크를 우연히 아는 제3자"를 막는 최소한의
> 장치이지, 강력한 보안 체계는 아니에요. 본인만 쓰는 개인용 앱이라는
> 전제로 설계했습니다.

## GitHub + Vercel 배포

```bash
git init
git add .
git commit -m "init: 테니스 로그 프로젝트"

gh repo create tennis-log --public --source=. --push
# 또는 GitHub에서 레포 생성 후
# git remote add origin <레포 URL>
# git branch -M main
# git push -u origin main
```

이후 [vercel.com](https://vercel.com) → **Add New Project** → 방금 만든
GitHub 레포 Import → **Environment Variables**에 `.env.local`에 채운 값
전부 그대로 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`KMA_API_KEY`, `WEATHER_STATION_ID`, `APP_PIN_HASH`, `SESSION_SECRET`) →
Deploy.

배포되면 `https://프로젝트명.vercel.app` 주소가 발급됩니다. 별도 도메인
구매는 필요 없어요.

## 아이폰에 앱처럼 설치하기

1. 위에서 발급받은 Vercel 주소로 아이폰 **Safari**에서 접속 (크롬 등
   다른 브라우저는 "홈 화면에 추가" 기능이 없거나 다르게 동작해요)
2. 하단 공유 버튼(⬆️) 탭 → **"홈 화면에 추가"** 선택
3. 홈 화면에 아이콘이 생기고, 탭하면 주소창 없는 전체화면 앱처럼 실행됩니다

## 프로젝트 구조

```
app/
  pin/                 PIN 입력 화면
  api/pin/             PIN 검증 + 세션 쿠키 발급
  api/matches/         경기 등록 (날씨 자동 조회 포함, 서버에서만 처리)
  page.tsx             홈 (요약)
  matches/             경기 목록 · 등록
  string-setups/       스트링 세팅 목록 · 등록
  cycle/                생리주기 시작일 기록
  dashboard/           분석 (승률/컨디션 통계, 차트)
lib/
  supabase.ts          Supabase 클라이언트
  cycle.ts             생리주기 단계 계산 로직
  weather.ts           기상청 ASOS 일자료 연동
  auth.ts / auth-edge.ts   PIN 세션 서명·검증 (Node/Edge 각각)
  types.ts             공통 타입
middleware.ts          PIN 잠금 - 로그인 안 하면 /pin으로 리다이렉트
supabase/schema.sql    DB 테이블 생성 SQL
public/manifest.json   PWA 매니페스트
public/icons/          앱 아이콘 (임시 아이콘 - 원하면 교체하세요)
```

## 알려진 한계 / 다음에 다듬으면 좋은 것

- 생리주기 단계 계산은 **평균 28일 기준의 대략적인 추정치**예요. 기록이
  쌓이면 평균 주기 길이는 자동 보정되지만, 배란일 등 정확한 생리학적
  판정은 아니라는 점 참고해주세요.
- 날씨는 관측지점 1곳(`WEATHER_STATION_ID`) 고정이라, 실제 테니스장
  위치와 다소 오차가 있을 수 있어요.
- 오프라인 지원은 1차 범위에 없어요 (인터넷 연결 필요).
- 아이콘은 임시로 생성한 간단한 그래픽이에요. `public/icons/` 안의
  파일을 원하는 이미지로 교체하면 됩니다 (192x192, 512x512,
  180x180 세 개).
