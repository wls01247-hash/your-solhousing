import type { Hub, QuizAnswers, Axis } from "./quiz-data";
import { normalizeAxis } from "./quiz-data";

// 각 hub 기준 접근성: minutes(전철 소요), transfers(환승 횟수)
export interface HubAccess {
  minutes: number;
  transfers: number;
}

export interface Area {
  slug: string;
  name_ko: string;
  name_ja: string;
  // 솔하우징 listings.station_name(_normalized) 매칭용 일본어 역명
  stations: string[];
  hub_access: Record<Exclude<Hub, "UNSURE">, HubAccess>;
  avg_rent_yen: number;
  vibe: number; // 0-10
  convenience: number;
  safety: number;
  value: number;
  beginner_friendly: boolean;
  description: string;
  features: string[];
}

export const AREAS: Area[] = [
  {
    slug: "nakano",
    name_ko: "나카노",
    name_ja: "中野",
    stations: ["中野", "東中野", "新井薬師前", "野方"],
    hub_access: {
      SHINJUKU: { minutes: 5, transfers: 0 },
      SHIBUYA: { minutes: 18, transfers: 1 },
      TOKYO: { minutes: 20, transfers: 0 },
      IKEBUKURO: { minutes: 15, transfers: 1 },
    },
    avg_rent_yen: 98000,
    vibe: 8, convenience: 9, safety: 7, value: 7, beginner_friendly: true,
    description: "신주쿠까지 한 정거장. 서브컬처·맛집·심야영업 가게가 모여 있는 도심형 자취 1번지.",
    features: ["신주쿠 5분", "심야 편의시설", "맛집 풍부"],
  },
  {
    slug: "ogikubo",
    name_ko: "오기쿠보",
    name_ja: "荻窪",
    stations: ["荻窪", "西荻窪", "阿佐ヶ谷", "南阿佐ヶ谷"],
    hub_access: {
      SHINJUKU: { minutes: 12, transfers: 0 },
      SHIBUYA: { minutes: 25, transfers: 1 },
      TOKYO: { minutes: 26, transfers: 0 },
      IKEBUKURO: { minutes: 22, transfers: 1 },
    },
    avg_rent_yen: 88000,
    vibe: 7, convenience: 8, safety: 8, value: 8, beginner_friendly: true,
    description: "JR 츄오선 직통. 조용한 주택가에 카페와 라멘 명가가 공존하는 가성비 동네.",
    features: ["신주쿠 직통", "조용한 주거", "가성비"],
  },
  {
    slug: "koenji",
    name_ko: "코엔지",
    name_ja: "高円寺",
    stations: ["高円寺", "新高円寺", "東高円寺"],
    hub_access: {
      SHINJUKU: { minutes: 8, transfers: 0 },
      SHIBUYA: { minutes: 22, transfers: 1 },
      TOKYO: { minutes: 22, transfers: 1 },
      IKEBUKURO: { minutes: 20, transfers: 1 },
    },
    avg_rent_yen: 92000,
    vibe: 9, convenience: 8, safety: 7, value: 7, beginner_friendly: false,
    description: "빈티지·라이브하우스·이자카야가 넘치는 인디 감성 거리. 젊은층 자취 성지.",
    features: ["빈티지 거리", "라이브 문화", "심야 술집"],
  },
  {
    slug: "kichijoji",
    name_ko: "키치조지",
    name_ja: "吉祥寺",
    stations: ["吉祥寺", "三鷹", "井の頭公園"],
    hub_access: {
      SHINJUKU: { minutes: 17, transfers: 0 },
      SHIBUYA: { minutes: 26, transfers: 0 },
      TOKYO: { minutes: 35, transfers: 1 },
      IKEBUKURO: { minutes: 30, transfers: 1 },
    },
    avg_rent_yen: 102000,
    vibe: 10, convenience: 9, safety: 8, value: 6, beginner_friendly: true,
    description: "이노카시라 공원·세련된 잡화점·맛집. 매년 살고 싶은 동네 1위 단골.",
    features: ["살고싶은 동네 1위", "공원·카페", "쇼핑"],
  },
  {
    slug: "shimokitazawa",
    name_ko: "시모키타자와",
    name_ja: "下北沢",
    stations: ["下北沢", "東北沢", "池ノ上", "世田谷代田"],
    hub_access: {
      SHINJUKU: { minutes: 7, transfers: 0 },
      SHIBUYA: { minutes: 7, transfers: 0 },
      TOKYO: { minutes: 28, transfers: 1 },
      IKEBUKURO: { minutes: 22, transfers: 1 },
    },
    avg_rent_yen: 108000,
    vibe: 10, convenience: 8, safety: 7, value: 5, beginner_friendly: false,
    description: "신주쿠·시부야 양쪽 7분. 빈티지·서점·연극의 거리.",
    features: ["양 도심 직결", "감성 끝판", "심야 라이브"],
  },
  {
    slug: "sangenjaya",
    name_ko: "산겐자야",
    name_ja: "三軒茶屋",
    stations: ["三軒茶屋", "駒沢大学", "池尻大橋"],
    hub_access: {
      SHINJUKU: { minutes: 20, transfers: 1 },
      SHIBUYA: { minutes: 5, transfers: 0 },
      TOKYO: { minutes: 28, transfers: 1 },
      IKEBUKURO: { minutes: 32, transfers: 2 },
    },
    avg_rent_yen: 100000,
    vibe: 9, convenience: 9, safety: 8, value: 6, beginner_friendly: true,
    description: "시부야까지 5분. 골목 카페·이자카야가 즐비한 세련된 주거지.",
    features: ["시부야 5분", "카페·골목길", "주거+놀이"],
  },
  {
    slug: "ebisu",
    name_ko: "에비스",
    name_ja: "恵比寿",
    stations: ["恵比寿", "広尾", "代官山"],
    hub_access: {
      SHINJUKU: { minutes: 7, transfers: 0 },
      SHIBUYA: { minutes: 3, transfers: 0 },
      TOKYO: { minutes: 12, transfers: 0 },
      IKEBUKURO: { minutes: 17, transfers: 0 },
    },
    avg_rent_yen: 145000,
    vibe: 9, convenience: 10, safety: 9, value: 3, beginner_friendly: false,
    description: "야마노테선 핵심. 모든 도심 직결의 프리미엄 주거지.",
    features: ["전 도심 직결", "고급 주거", "치안 우수"],
  },
  {
    slug: "nakameguro",
    name_ko: "나카메구로",
    name_ja: "中目黒",
    stations: ["中目黒", "祐天寺", "学芸大学"],
    hub_access: {
      SHINJUKU: { minutes: 15, transfers: 1 },
      SHIBUYA: { minutes: 5, transfers: 0 },
      TOKYO: { minutes: 18, transfers: 1 },
      IKEBUKURO: { minutes: 25, transfers: 1 },
    },
    avg_rent_yen: 135000,
    vibe: 10, convenience: 8, safety: 9, value: 4, beginner_friendly: false,
    description: "메구로강 벚꽃길과 부티크. 시부야 한 정거장의 감성 주거지.",
    features: ["시부야 5분", "벚꽃길", "부티크 카페"],
  },
  {
    slug: "jiyugaoka",
    name_ko: "지유가오카",
    name_ja: "自由が丘",
    stations: ["自由が丘", "奥沢", "緑が丘"],
    hub_access: {
      SHINJUKU: { minutes: 22, transfers: 1 },
      SHIBUYA: { minutes: 12, transfers: 0 },
      TOKYO: { minutes: 28, transfers: 1 },
      IKEBUKURO: { minutes: 30, transfers: 1 },
    },
    avg_rent_yen: 115000,
    vibe: 9, convenience: 9, safety: 9, value: 5, beginner_friendly: true,
    description: "스위트·잡화·정원이 어우러진 우아한 주택가. 가족·여성 1인가구 인기.",
    features: ["우아한 주거", "잡화·카페", "치안 우수"],
  },
  {
    slug: "itabashi",
    name_ko: "이타바시",
    name_ja: "板橋",
    stations: ["板橋", "下板橋", "新板橋"],
    hub_access: {
      SHINJUKU: { minutes: 15, transfers: 1 },
      SHIBUYA: { minutes: 25, transfers: 1 },
      TOKYO: { minutes: 18, transfers: 1 },
      IKEBUKURO: { minutes: 5, transfers: 0 },
    },
    avg_rent_yen: 82000,
    vibe: 5, convenience: 7, safety: 7, value: 9, beginner_friendly: true,
    description: "이케부쿠로 한 정거장. 조용한 주택가와 저렴한 월세의 균형.",
    features: ["이케부쿠로 5분", "월세 저렴", "조용함"],
  },
  {
    slug: "akabane",
    name_ko: "아카바네",
    name_ja: "赤羽",
    stations: ["赤羽", "東十条", "十条"],
    hub_access: {
      SHINJUKU: { minutes: 18, transfers: 1 },
      SHIBUYA: { minutes: 25, transfers: 1 },
      TOKYO: { minutes: 18, transfers: 0 },
      IKEBUKURO: { minutes: 12, transfers: 0 },
    },
    avg_rent_yen: 80000,
    vibe: 7, convenience: 9, safety: 7, value: 9, beginner_friendly: true,
    description: "도쿄·이케부쿠로 직결 + 저렴한 월세. 술집·상점가가 풍부한 서민 1번지.",
    features: ["도쿄 직통", "상점가", "가성비"],
  },
  {
    slug: "kitasenju",
    name_ko: "키타센주",
    name_ja: "北千住",
    stations: ["北千住", "牛田", "京成関屋"],
    hub_access: {
      SHINJUKU: { minutes: 18, transfers: 1 },
      SHIBUYA: { minutes: 27, transfers: 2 },
      TOKYO: { minutes: 15, transfers: 0 },
      IKEBUKURO: { minutes: 12, transfers: 1 },
    },
    avg_rent_yen: 85000,
    vibe: 7, convenience: 9, safety: 7, value: 8, beginner_friendly: true,
    description: "5개 노선 환승의 동쪽 거점. 도쿄역 직통+저렴+편의시설 풍부.",
    features: ["5개 노선", "도쿄 15분", "상점가"],
  },
  {
    slug: "ayase",
    name_ko: "아야세",
    name_ja: "綾瀬",
    stations: ["綾瀬", "青井", "北綾瀬"],
    hub_access: {
      SHINJUKU: { minutes: 25, transfers: 1 },
      SHIBUYA: { minutes: 32, transfers: 2 },
      TOKYO: { minutes: 18, transfers: 0 },
      IKEBUKURO: { minutes: 22, transfers: 1 },
    },
    avg_rent_yen: 72000,
    vibe: 4, convenience: 6, safety: 6, value: 10, beginner_friendly: false,
    description: "치요다선 시점. 도쿄역까지 직통 18분의 초가성비 동네.",
    features: ["초저가", "도쿄 직통", "쇼핑몰"],
  },
  {
    slug: "kameari",
    name_ko: "카메아리",
    name_ja: "亀有",
    stations: ["亀有", "金町", "京成金町"],
    hub_access: {
      SHINJUKU: { minutes: 30, transfers: 1 },
      SHIBUYA: { minutes: 38, transfers: 2 },
      TOKYO: { minutes: 22, transfers: 0 },
      IKEBUKURO: { minutes: 30, transfers: 1 },
    },
    avg_rent_yen: 68000,
    vibe: 5, convenience: 7, safety: 7, value: 10, beginner_friendly: false,
    description: "거대 쇼핑몰 아리오와 조용한 주택가. 도쿄 동쪽 최저 월세 구간.",
    features: ["최저 월세", "대형마트", "가족 친화"],
  },
  {
    slug: "warabi",
    name_ko: "와라비",
    name_ja: "蕨",
    stations: ["蕨", "西川口", "戸田"],
    hub_access: {
      SHINJUKU: { minutes: 25, transfers: 1 },
      SHIBUYA: { minutes: 33, transfers: 1 },
      TOKYO: { minutes: 25, transfers: 0 },
      IKEBUKURO: { minutes: 18, transfers: 0 },
    },
    avg_rent_yen: 62000,
    vibe: 4, convenience: 7, safety: 7, value: 10, beginner_friendly: false,
    description: "사이타마 남단. 게이힌도호쿠선으로 이케부쿠로·도쿄 직통. 월세 최강.",
    features: ["최저 월세", "직통 환승無", "한인 마트"],
  },
  {
    slug: "kawasaki",
    name_ko: "카와사키",
    name_ja: "川崎",
    stations: ["川崎", "京急川崎", "尻手"],
    hub_access: {
      SHINJUKU: { minutes: 22, transfers: 1 },
      SHIBUYA: { minutes: 18, transfers: 1 },
      TOKYO: { minutes: 18, transfers: 0 },
      IKEBUKURO: { minutes: 30, transfers: 1 },
    },
    avg_rent_yen: 88000,
    vibe: 6, convenience: 10, safety: 7, value: 8, beginner_friendly: true,
    description: "도쿄 남쪽 거점도시. 라조나·역세권 인프라가 한 동네에 다 있음.",
    features: ["라조나", "도쿄 직통", "역세권 인프라"],
  },
  {
    slug: "tsunashima",
    name_ko: "츠나시마",
    name_ja: "綱島",
    stations: ["綱島", "日吉", "新綱島"],
    hub_access: {
      SHINJUKU: { minutes: 30, transfers: 1 },
      SHIBUYA: { minutes: 22, transfers: 0 },
      TOKYO: { minutes: 32, transfers: 1 },
      IKEBUKURO: { minutes: 35, transfers: 1 },
    },
    avg_rent_yen: 78000,
    vibe: 6, convenience: 7, safety: 8, value: 9, beginner_friendly: true,
    description: "토요코선·신요코하마선 직결. 시부야 환승 없이 22분, 한적한 주거.",
    features: ["시부야 직통", "조용한 주거", "신축 다수"],
  },
  {
    slug: "oizumi",
    name_ko: "오이즈미가쿠엔",
    name_ja: "大泉学園",
    stations: ["大泉学園", "保谷", "石神井公園"],
    hub_access: {
      SHINJUKU: { minutes: 25, transfers: 1 },
      SHIBUYA: { minutes: 33, transfers: 1 },
      TOKYO: { minutes: 35, transfers: 1 },
      IKEBUKURO: { minutes: 20, transfers: 0 },
    },
    avg_rent_yen: 80000,
    vibe: 6, convenience: 8, safety: 9, value: 8, beginner_friendly: true,
    description: "이케부쿠로 직통. 넓은 공원과 가족 친화 주택가, 평수 대비 월세 우수.",
    features: ["넓은 평수", "치안 우수", "이케부쿠로 직통"],
  },
  {
    slug: "wakoshi",
    name_ko: "와코시",
    name_ja: "和光市",
    stations: ["和光市", "成増", "地下鉄成増"],
    hub_access: {
      SHINJUKU: { minutes: 22, transfers: 0 },
      SHIBUYA: { minutes: 28, transfers: 0 },
      TOKYO: { minutes: 35, transfers: 1 },
      IKEBUKURO: { minutes: 13, transfers: 0 },
    },
    avg_rent_yen: 72000,
    vibe: 5, convenience: 7, safety: 8, value: 10, beginner_friendly: true,
    description: "후쿠토신선 시점. 이케부쿠로·신주쿠·시부야 환승無 직통, 사이타마 가성비.",
    features: ["3대 도심 직통", "환승無", "최저가권"],
  },
  {
    slug: "takadanobaba",
    name_ko: "다카다노바바",
    name_ja: "高田馬場",
    stations: ["高田馬場", "目白", "西早稲田"],
    hub_access: {
      SHINJUKU: { minutes: 4, transfers: 0 },
      SHIBUYA: { minutes: 12, transfers: 0 },
      TOKYO: { minutes: 20, transfers: 1 },
      IKEBUKURO: { minutes: 5, transfers: 0 },
    },
    avg_rent_yen: 100000,
    vibe: 8, convenience: 9, safety: 7, value: 7, beginner_friendly: true,
    description: "야마노테선+토자이선. 신주쿠·이케부쿠로 양쪽 한 정거장의 학생 거리.",
    features: ["야마노테선", "학생가", "심야 음식점"],
  },
];

// ---------- 점수 계산 ----------

export interface ScoredArea {
  area: Area;
  total: number; // 0-1
  breakdown: { hub: number; budget: number; vibe: number; convenience: number; safety: number; value: number };
  hubAccess: HubAccess | null;
  topReasons: string[];
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

// 통근 점수: 시간(분) + 환승 패널티
function hubAccessScore(a: HubAccess): number {
  const t = clamp01(1 - a.minutes / 45);
  const tr = clamp01(1 - a.transfers * 0.18);
  return clamp01(t * 0.7 + tr * 0.3);
}

function budgetScore(avg: number, budget: number): number {
  if (avg <= budget) return clamp01(1 - (budget - avg) / (budget * 2)); // 너무 싼 것도 살짝 감점
  return clamp01(1 - (avg - budget) / (budget * 0.4));
}

const REASON_LABEL: Record<keyof ScoredArea["breakdown"], string> = {
  hub: "통근 접근성",
  budget: "예산 적합도",
  vibe: "동네 분위기",
  convenience: "생활 편의성",
  safety: "치안",
  value: "가성비",
};

export function scoreAreas(answers: QuizAnswers): ScoredArea[] {
  const { hub, axes, budget } = answers;
  const unsure = hub === "UNSURE";

  // 축 가중치 (0-1 정규화) — UNSURE 면 commute=0, value/safety/conv 상향
  const wCommute = unsure ? 0 : 0.6 + normalizeAxis("COMMUTE", axes.COMMUTE) * 0.8;
  const wBudget = 0.5 + normalizeAxis("BUDGET", axes.BUDGET) * 1.0;
  const wVibe = 0.3 + normalizeAxis("VIBE", axes.VIBE) * 0.9;
  const wConv = (unsure ? 0.8 : 0.4) + normalizeAxis("CONVENIENCE", axes.CONVENIENCE) * 0.7;
  const wSafe = (unsure ? 0.9 : 0.4) + normalizeAxis("SAFETY", axes.SAFETY) * 0.8;
  const wValue = (unsure ? 0.9 : 0.3) + normalizeAxis("BUDGET", axes.BUDGET) * 0.6;

  const results: ScoredArea[] = AREAS.map((area) => {
    const access = unsure ? null : area.hub_access[hub as Exclude<Hub, "UNSURE">];
    const sHub = access ? hubAccessScore(access) : 0;
    const sBudget = budgetScore(area.avg_rent_yen, budget);
    const sVibe = area.vibe / 10;
    const sConv = area.convenience / 10;
    const sSafe = area.safety / 10;
    const sValue = area.value / 10;

    const beginnerBonus = unsure && area.beginner_friendly ? 0.08 : 0;

    const totalW = wCommute + wBudget + wVibe + wConv + wSafe + wValue;
    const total =
      (sHub * wCommute +
        sBudget * wBudget +
        sVibe * wVibe +
        sConv * wConv +
        sSafe * wSafe +
        sValue * wValue) /
        totalW +
      beginnerBonus;

    const breakdown = { hub: sHub, budget: sBudget, vibe: sVibe, convenience: sConv, safety: sSafe, value: sValue };
    const topReasons = (Object.entries(breakdown) as [keyof typeof breakdown, number][])
      .filter(([k]) => !(unsure && k === "hub"))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => REASON_LABEL[k]);

    return { area, total: clamp01(total), breakdown, hubAccess: access, topReasons };
  });

  return results.sort((a, b) => b.total - a.total);
}

export function axisDriverLabel(axis: Axis): string {
  return {
    BUDGET: "예산",
    COMMUTE: "통근",
    VIBE: "분위기",
    CONVENIENCE: "편의",
    SAFETY: "치안",
    SIZE: "넓이",
  }[axis];
}