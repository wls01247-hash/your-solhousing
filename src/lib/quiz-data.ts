// ============================================================
// 새 모델: 생활 중심지(hub) + 6개 평가축(axis) + 매물 필터(budget/roomType/size)
// ============================================================

export type Hub = "SHINJUKU" | "SHIBUYA" | "TOKYO" | "IKEBUKURO" | "UNSURE";

export const HUB_LABELS: Record<Hub, string> = {
  SHINJUKU: "신주쿠·나카노 방면",
  SHIBUYA: "시부야·에비스 방면",
  TOKYO: "도쿄역·긴자 방면",
  IKEBUKURO: "이케부쿠로·다카다노바바 방면",
  UNSURE: "아직 잘 모르겠어요",
};

export const HUB_SHORT: Record<Hub, string> = {
  SHINJUKU: "신주쿠",
  SHIBUYA: "시부야",
  TOKYO: "도쿄역",
  IKEBUKURO: "이케부쿠로",
  UNSURE: "도심 전반",
};

export type Axis =
  | "BUDGET"
  | "COMMUTE"
  | "VIBE"
  | "CONVENIENCE"
  | "SAFETY"
  | "SIZE";

export const AXIS_LABELS: Record<Axis, string> = {
  BUDGET: "예산 민감도",
  COMMUTE: "통근 효율",
  VIBE: "동네 분위기",
  CONVENIENCE: "생활 편의성",
  SAFETY: "치안",
  SIZE: "넓이",
};

export type RoomType = "1R" | "1K" | "1DK" | "1LDK" | "2K+";
export const ROOM_TYPES: RoomType[] = ["1R", "1K", "1DK", "1LDK", "2K+"];

export type SizeBand = "S" | "M" | "L" | "XL";
export const SIZE_BAND_LABEL: Record<SizeBand, string> = {
  S: "~20㎡ (콤팩트)",
  M: "20~25㎡",
  L: "25~30㎡",
  XL: "30㎡+",
};
export const SIZE_BAND_RANGE: Record<SizeBand, { min: number; max: number | null }> = {
  S: { min: 0, max: 20 },
  M: { min: 18, max: 26 },
  L: { min: 24, max: 32 },
  XL: { min: 28, max: null },
};

// ---------- 질문 정의 (discriminated union) ----------

export type AxisChoice = { label: string; text: string; axis: Axis; weight: number };

export type Question =
  | { id: number; kind: "hub"; prompt: string; choices: { label: string; text: string; hub: Hub }[] }
  | { id: number; kind: "axis"; prompt: string; choices: AxisChoice[] }
  | { id: number; kind: "budget"; prompt: string; min: number; max: number; step: number; default: number }
  | { id: number; kind: "roomType"; prompt: string }
  | { id: number; kind: "size"; prompt: string };

export const questions: Question[] = [
  {
    id: 1,
    kind: "hub",
    prompt: "평일 가장 자주 가는 곳은 어디?",
    choices: [
      { label: "A", text: "신주쿠·나카노 방면", hub: "SHINJUKU" },
      { label: "B", text: "시부야·에비스 방면", hub: "SHIBUYA" },
      { label: "C", text: "도쿄역·긴자 방면", hub: "TOKYO" },
      { label: "D", text: "이케부쿠로·다카다노바바 방면", hub: "IKEBUKURO" },
      { label: "E", text: "아직 잘 모르겠어요", hub: "UNSURE" },
    ],
  },
  {
    id: 2,
    kind: "axis",
    prompt: "부동산에서 10개 매물을 보여줬다.\n일주일 뒤에도 기억나는 것은?",
    choices: [
      { label: "A", text: "역 이름", axis: "COMMUTE", weight: 3 },
      { label: "B", text: "월세", axis: "BUDGET", weight: 3 },
      { label: "C", text: "방 구조", axis: "SIZE", weight: 3 },
      { label: "D", text: "동네 풍경", axis: "VIBE", weight: 3 },
    ],
  },
  {
    id: 3,
    kind: "axis",
    prompt: "내견을 다녀왔다!\n가장 먼저 체크하는 것은?",
    choices: [
      { label: "A", text: "역에서 여기까지 얼마나 걸리지", axis: "COMMUTE", weight: 3 },
      { label: "B", text: "초기비용 어땠더라", axis: "BUDGET", weight: 3 },
      { label: "C", text: "방 평수 다시 확인", axis: "SIZE", weight: 3 },
      { label: "D", text: "주변 편의시설 / 맛집 체크", axis: "CONVENIENCE", weight: 3 },
    ],
  },
  {
    id: 4,
    kind: "axis",
    prompt: "친구가 집 계약했다고 자랑한다.\n속으로 제일 먼저 드는 생각은?",
    choices: [
      { label: "A", text: "출퇴근 괜찮나", axis: "COMMUTE", weight: 3 },
      { label: "B", text: "얼마에 구했으려나?", axis: "BUDGET", weight: 3 },
      { label: "C", text: "동네 분위기 좋아 보인다", axis: "VIBE", weight: 3 },
      { label: "D", text: "치안은 안전한 곳인가", axis: "SAFETY", weight: 3 },
    ],
  },
  {
    id: 5,
    kind: "axis",
    prompt: "밤 11시. 배고픈데 냉장고가 비어 있다.",
    choices: [
      { label: "A", text: "편의점·마트 도보 1분 필수", axis: "CONVENIENCE", weight: 4 },
      { label: "B", text: "배달 시키지 뭐", axis: "BUDGET", weight: 2 },
      { label: "C", text: "있는 걸로 버틴다", axis: "SIZE", weight: 2 },
      { label: "D", text: "동네에 24시 식당 있나?", axis: "VIBE", weight: 3 },
    ],
  },
  {
    id: 6,
    kind: "axis",
    prompt: "친구랑 놀다 막차를 놓쳤다!\n가장 먼저 드는 생각은?",
    choices: [
      { label: "A", text: "막차 시간 외워두는 게 인생", axis: "COMMUTE", weight: 4 },
      { label: "B", text: "택시비 얼마냐", axis: "BUDGET", weight: 3 },
      { label: "C", text: "밤길 무서운데 어떻게 가지", axis: "SAFETY", weight: 4 },
      { label: "D", text: "밤새 놀면 되지?", axis: "VIBE", weight: 2 },
    ],
  },
  {
    id: 7,
    kind: "axis",
    prompt: "재택근무가 한 달간 확정됐다.\n기분 좋은 이유는?",
    choices: [
      { label: "A", text: "출근 안 하니까", axis: "COMMUTE", weight: 3 },
      { label: "B", text: "교통비 절약 굿!", axis: "BUDGET", weight: 3 },
      { label: "C", text: "넓은 책상 펼쳐놓고 일하기", axis: "SIZE", weight: 4 },
      { label: "D", text: "동네 카페에서 작업할 수 있어!", axis: "VIBE", weight: 3 },
    ],
  },
  {
    id: 8,
    kind: "axis",
    prompt: "이사 갈 동네 후보 두 곳이 비슷한데,\n결정타가 되는 것은?",
    choices: [
      { label: "A", text: "월세 5천엔 차이", axis: "BUDGET", weight: 4 },
      { label: "B", text: "역에서 도보 5분 차이", axis: "COMMUTE", weight: 4 },
      { label: "C", text: "치안 평판이 더 좋은 쪽", axis: "SAFETY", weight: 4 },
      { label: "D", text: "카페·서점 더 많은 쪽", axis: "VIBE", weight: 4 },
    ],
  },
  {
    id: 9,
    kind: "axis",
    prompt: '친구가 묻는다. "너 지금 집 만족해?"\n가장 가까운 대답은?',
    choices: [
      { label: "A", text: "더 싸게 구할 수 있었을 듯", axis: "BUDGET", weight: 5 },
      { label: "B", text: "더 좋은 위치는 있을 듯", axis: "COMMUTE", weight: 5 },
      { label: "C", text: "더 넓은 집이면 좋겠다", axis: "SIZE", weight: 5 },
      { label: "D", text: "더 재밌는 동네는 있을 텐데", axis: "VIBE", weight: 5 },
    ],
  },
  {
    id: 10,
    kind: "budget",
    prompt: "한 달 월세 예산은 얼마까지?",
    min: 50000,
    max: 200000,
    step: 5000,
    default: 90000,
  },
  {
    id: 11,
    kind: "roomType",
    prompt: "원하는 방 구조는?\n(복수 선택 가능)",
  },
  {
    id: 12,
    kind: "size",
    prompt: "원하는 평수는?",
  },
];

// ---------- 답변/스코어 ----------

export interface QuizAnswers {
  hub: Hub;
  axes: Record<Axis, number>;
  budget: number;
  roomTypes: RoomType[];
  size: SizeBand;
}

export const EMPTY_AXES: Record<Axis, number> = {
  BUDGET: 0,
  COMMUTE: 0,
  VIBE: 0,
  CONVENIENCE: 0,
  SAFETY: 0,
  SIZE: 0,
};

// 각 축 별 최대 가중치(정규화 용)
const AXIS_MAX: Record<Axis, number> = {
  BUDGET: 20,
  COMMUTE: 19,
  VIBE: 18,
  CONVENIENCE: 7,
  SAFETY: 8,
  SIZE: 14,
};

export function normalizeAxis(axis: Axis, raw: number): number {
  return Math.max(0, Math.min(1, raw / AXIS_MAX[axis]));
}

export function axisPercent(axis: Axis, raw: number): number {
  return Math.round(normalizeAxis(axis, raw) * 100);
}

export const STORAGE_KEY = "tokyo-quiz-answers";

// ---------- 공유용: 답변을 URL 쿼리스트링으로 인코딩/디코딩 ----------
// hub 는 slug(/result/$slug)에 담기므로 쿼리에는 나머지 답변만 싣는다.

// axes 직렬화 순서(고정). 이 순서가 바뀌면 기존 공유 링크가 깨지므로 변경 금지.
const AXIS_ORDER: Axis[] = ["BUDGET", "COMMUTE", "VIBE", "CONVENIENCE", "SAFETY", "SIZE"];
const SIZE_BANDS = Object.keys(SIZE_BAND_LABEL) as SizeBand[];

// 결과 페이지의 검색 파라미터:
//   a: axes 값을 AXIS_ORDER 순서로 "."으로 연결 (예: "20.19.0.7.8.14")
//   b: 월세 예산(숫자)
//   r: 선택한 방 구조의 ROOM_TYPES 인덱스를 이어붙임 (예: "13" = 1K+1LDK), 없으면 생략
//   s: 평수 밴드(S/M/L/XL)
export interface ResultSearch {
  a: string;
  b: number;
  r?: string;
  s: SizeBand;
}

export function encodeAnswers(ans: QuizAnswers): ResultSearch {
  return {
    a: AXIS_ORDER.map((ax) => ans.axes[ax]).join("."),
    b: ans.budget,
    r: ans.roomTypes.map((rt) => ROOM_TYPES.indexOf(rt)).join("") || undefined,
    s: ans.size,
  };
}

// 검색 파라미터 + slug 의 hub 로 QuizAnswers 복원. 형식이 조금이라도 어긋나면 null 반환.
export function decodeAnswers(hub: Hub, search: Partial<ResultSearch>): QuizAnswers | null {
  const { a, b, r, s } = search;
  if (typeof a !== "string" || typeof b !== "number" || !Number.isFinite(b)) return null;
  if (typeof s !== "string" || !SIZE_BANDS.includes(s as SizeBand)) return null;

  const parts = a.split(".").map(Number);
  if (parts.length !== AXIS_ORDER.length || parts.some((n) => !Number.isFinite(n))) return null;

  const axes: Record<Axis, number> = { ...EMPTY_AXES };
  AXIS_ORDER.forEach((ax, i) => {
    axes[ax] = parts[i];
  });

  const roomTypes = (typeof r === "string" ? r.split("") : [])
    .map((d) => ROOM_TYPES[Number(d)])
    .filter((rt): rt is RoomType => Boolean(rt));

  return { hub, axes, budget: b, roomTypes, size: s as SizeBand };
}