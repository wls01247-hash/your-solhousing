현재 퀴즈는 4성향(MOVE/SAVE/HOME/LIFE)으로 결과를 내고, 추천은 신주쿠 접근성을 전제한 `life_areas` 매핑에 의존합니다. 이걸 "생활 중심지 + 종합 평가" 모델로 바꿉니다.

## 1. 질문 구조 변경

`src/lib/quiz-data.ts` 재설계:

- **Q1 (신규, 최상단)**: 생활 중심지 선택 — A 신주쿠/나카노, B 시부야/에비스, C 도쿄/긴자, D 이케부쿠로/다카다노바바, E 모르겠음.
  - 값: `hub: "SHINJUKU" | "SHIBUYA" | "TOKYO" | "IKEBUKURO" | "UNSURE"`
- **Q2~**: 기존 15문항을 다듬어 다음 축으로 재태깅 (4지선다 유지, 카테고리는 가중치 입력으로 사용):
  - `BUDGET` (월세 민감도)
  - `COMMUTE` (통근시간/환승 민감도)
  - `SIZE` (희망 평수)
  - `VIBE` (동네 분위기)
  - `CONVENIENCE` (생활 편의성)
  - `SAFETY` (치안)
- 추가로 예산 슬라이더 1문항(월세 상한), 희망 구조 1문항(1R/1K/1DK/1LDK+), 희망 평수 1문항(~20/20-25/25-30/30+ ㎡)을 마지막에 둠 — 매물 필터링용 raw 값.

## 2. 추천 지역 계산

`src/lib/recommendation.ts` 신설.

- 후보 지역 카탈로그를 코드 상수로 정의 (테이블 추가 없이 빠르게 시작). 각 지역에 다음 메타데이터:
  ```ts
  { slug, name_ko, name_ja,
    hub_access: { SHINJUKU:{minutes, transfers}, SHIBUYA:{...}, TOKYO:{...}, IKEBUKURO:{...} },
    avg_rent_yen, vibe_score, convenience_score, safety_score, value_score,
    beginner_friendly: boolean, description, features:string[] }
  ```
  초기 후보 ~20개 (나카노, 오기쿠보, 키치조지, 시모키타자와, 산겐자야, 에비스, 메구로, 카메아리, 와라비, 아카바네, 이타바시, 와코시, 카와사키, 츠나시마, 키타센주, 오이즈미가쿠엔, 카사이, 후나바시, 아카츠카, 닛포리 등).
- 점수 함수: 정규화된 가중합. hub=UNSURE면 hub_access 가중치 0, 대신 beginner_friendly + value_score + safety_score 가중치 상향.
- 같은 카테고리 점수라도 hub가 다르면 hub_access 항목이 바뀌어 결과가 달라짐.
- 1·2·3등 반환 (1등 강조).

## 3. 결과 페이지 개편

`src/routes/result.$slug.tsx` 를 `src/routes/result.tsx`로 단순화하거나 라우트 유지하되 다음 구조:

```
🥇 추천 지역 — {지역명}
   - 추천 이유 (점수 상위 3축을 문장화)
   - 예상 통근시간 / 환승 (선택한 hub 기준)
   - 평균 월세
   - 특징 태그
🥈 / 🥉 차순위 2곳 (간략 카드)

[해당 지역 실제 매물 5개]  ← 솔하우징 listings 테이블에서 조회
```

점수는 sessionStorage로 전달(현재 패턴 유지). 슬러그 대신 점수+hub+필터를 search params로 직렬화하여 SSR/공유 가능하게.

## 4. 매물 연동

`src/lib/listings.functions.ts`에 `getListingsForArea` 신규 server fn:

- 입력: `{ areaSlug, hubAccessStation?, maxRentYen?, roomTypes?: string[], minSqm?, maxSqm?, limit }`.
- 추천 지역 후보 카탈로그가 노출하는 `station_names: string[]` (각 지역의 대표 역 1~3개)을 사용해 `listings.station_name_normalized in (...)` 로 매칭.
- `contract_status='available'` 필터 + 예산/구조/면적 필터 + 매칭 점수(예산 근접도 + 평수 근접도 + 추천 지역 점수)로 정렬, top N 반환.
- 기존 `getRecommendedListings`는 제거하지 않고 남겨두되 결과 페이지에서는 새 함수 사용.

## 5. 파일 변경 요약

- 수정: `src/lib/quiz-data.ts` (질문/타입/스코어 모델 교체)
- 수정: `src/routes/quiz.tsx` (Q1 단일선택, 슬라이더/체크박스 마지막 단계 지원)
- 신규: `src/lib/recommendation.ts` (지역 카탈로그 + 점수 계산)
- 신규: `src/lib/area-listings.functions.ts` (지역 기반 매물 조회)
- 수정: `src/routes/result.$slug.tsx` → 새 결과 페이지 (1·2·3등 + 매물 리스트)
- (DB 변경 없음 — 1차 버전은 코드 상수 카탈로그로 시작, 추후 마이그레이션으로 테이블화 가능)

## 확인 필요

- 후보 지역 ~20개 선정 리스트 OK? (제가 도쿄/주변 대표 거주지를 추리되, 빠뜨리고 싶지 않은 동네가 있으면 알려주세요.)
- 코드 상수로 시작해도 되는지, 아니면 처음부터 Supabase 테이블로 만들지 (테이블화하면 추후 관리자가 값 수정 가능).
- 마지막 3문항(예산/구조/평수)을 퀴즈에 추가하는 게 흐름상 OK? 아니면 결과 페이지에서 필터 UI로 분리할지.
