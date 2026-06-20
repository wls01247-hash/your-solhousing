export type Category = "MOVE" | "SAVE" | "HOME" | "LIFE";

export interface Choice {
  label: string;
  text: string;
  cat: Category;
  weight: number;
}

export interface Question {
  id: number;
  prompt: string;
  choices: Choice[];
}

export const questions: Question[] = [
  {
    id: 1,
    prompt: "부동산에서 10개 매물을 보여줬다.\n일주일 뒤에도 기억나는 것은?",
    choices: [
      { label: "A", text: "역 이름", cat: "MOVE", weight: 3 },
      { label: "B", text: "월세", cat: "SAVE", weight: 3 },
      { label: "C", text: "방 구조", cat: "HOME", weight: 3 },
      { label: "D", text: "동네 풍경", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 2,
    prompt: "내견을 다녀왔다!\n가장 먼저 체크하는 것은?",
    choices: [
      { label: "A", text: "역에서 여기까지 얼마나 걸리지...", cat: "MOVE", weight: 3 },
      { label: "B", text: "초기비용 어땠더라", cat: "SAVE", weight: 3 },
      { label: "C", text: "도면 찍어놔야지", cat: "HOME", weight: 3 },
      { label: "D", text: "주변에 맛집 있나 확인!", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 3,
    prompt: "대망의 이사 첫날.\n택배가 8개 도착했다.\n제일 먼저 뜯는 것은?",
    choices: [
      { label: "A", text: "공유기", cat: "MOVE", weight: 3 },
      { label: "B", text: "생활용품 박스", cat: "SAVE", weight: 3 },
      { label: "C", text: "침구류", cat: "HOME", weight: 3 },
      { label: "D", text: "인테리어 소품", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 4,
    prompt: "이사한 다음 날, 친구가 갑자기 말한다.\n\"오늘 네 집 가도 돼?\"\n첫 생각은?",
    choices: [
      { label: "A", text: "몇 시에 오지?", cat: "MOVE", weight: 2 },
      { label: "B", text: "뭐 사와 달라고 할까?", cat: "SAVE", weight: 3 },
      { label: "C", text: "집이 너무 더러운데", cat: "HOME", weight: 3 },
      { label: "D", text: "어디 데려가지?", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 5,
    prompt: "친구랑 신주쿠에서 놀다 막차를 놓쳤다!\n가장 먼저 드는 생각은?",
    choices: [
      { label: "A", text: "집 어떻게 가냐…", cat: "MOVE", weight: 3 },
      { label: "B", text: "택시비 얼마냐", cat: "SAVE", weight: 3 },
      { label: "C", text: "그냥 자고 갈까", cat: "HOME", weight: 3 },
      { label: "D", text: "밤새 술 마시면 되지?", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 6,
    prompt: "친구가 집 계약했다고 자랑한다.\n속으로 제일 먼저 드는 생각은?",
    choices: [
      { label: "A", text: "출퇴근 괜찮나", cat: "MOVE", weight: 3 },
      { label: "B", text: "얼마에 구했으려나?", cat: "SAVE", weight: 3 },
      { label: "C", text: "이 집 너무 깨끗하다!", cat: "HOME", weight: 3 },
      { label: "D", text: "집 앞에 스타벅스가 있잖아?", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 7,
    prompt: "친구 집에 놀러가려 했는데 비가 와서\n일정이 취소됐네….",
    choices: [
      { label: "A", text: "다른 약속 찾음", cat: "MOVE", weight: 2 },
      { label: "B", text: "돈 굳었다!!!", cat: "SAVE", weight: 3 },
      { label: "C", text: "집이 최고여~", cat: "HOME", weight: 3 },
      { label: "D", text: "근처 카페나 갈까?", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 8,
    prompt: "밤 11시. 배고픈데 냉장고가 비어 있다….",
    choices: [
      { label: "A", text: "편의점 가야겠다!", cat: "MOVE", weight: 2 },
      { label: "B", text: "마트 할인 찾아봐야지", cat: "SAVE", weight: 3 },
      { label: "C", text: "있는 걸로 버틴다", cat: "HOME", weight: 3 },
      { label: "D", text: "배달 시킨다", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 9,
    prompt: "한국에서 택배가 도착했다.\n생각보다 크군.. 가장 먼저 드는 생각은?",
    choices: [
      { label: "A", text: "언제 뜯지?", cat: "MOVE", weight: 3 },
      { label: "B", text: "와 이거 해외배송비 얼마였더라", cat: "SAVE", weight: 3 },
      { label: "C", text: "어디 둘지 고민", cat: "HOME", weight: 3 },
      { label: "D", text: "사진 찍어서 올려야징", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 10,
    prompt: "도쿄에서 길을 잃었다.\n배터리는 2%. 당신은?",
    choices: [
      { label: "A", text: "역부터 찾는다", cat: "MOVE", weight: 3 },
      { label: "B", text: "택시비 검색", cat: "SAVE", weight: 3 },
      { label: "C", text: "그냥 앉아서 생각", cat: "HOME", weight: 3 },
      { label: "D", text: "어차피 온 김에 구경", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 11,
    prompt: "도쿄에서 갑자기 하루가 추가로 생겼다.\n무계획 자유시간 24시간.",
    choices: [
      { label: "A", text: "일단 나간다", cat: "MOVE", weight: 3 },
      { label: "B", text: "가성비 좋은 가게 찾아보기", cat: "SAVE", weight: 3 },
      { label: "C", text: "집에 있을래", cat: "HOME", weight: 3 },
      { label: "D", text: "동네 탐험 시간이다!!!", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 12,
    prompt: "재택근무가 한 달간 확정됐다.\n기분 좋은 이유는?",
    choices: [
      { label: "A", text: "출근 안 하니까", cat: "MOVE", weight: 3 },
      { label: "B", text: "교통비 절약 굿!", cat: "SAVE", weight: 3 },
      { label: "C", text: "집에서 쉴 수 있으니까…", cat: "HOME", weight: 3 },
      { label: "D", text: "카페에서 작업할 수 있어!", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 13,
    prompt: "엘리베이터를 탔는데 누군가 말을 건다.\n\"안녕하세요~\" 당신은?",
    choices: [
      { label: "A", text: "몇 번 본 사람인지 기억하려고 한다", cat: "MOVE", weight: 3 },
      { label: "B", text: "혹시 사이비 아니야?", cat: "SAVE", weight: 3 },
      { label: "C", text: "어색하게 인사하고 끝", cat: "HOME", weight: 3 },
      { label: "D", text: "은근 반갑다", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 14,
    prompt: "퇴근하고 집에 도착했다.\n예상보다 하루가 너무 힘들었다. 당신은?",
    choices: [
      { label: "A", text: "내일 일정을 머릿속으로 정리한다", cat: "MOVE", weight: 3 },
      { label: "B", text: "가계부 작성은 잊으면 안되지", cat: "SAVE", weight: 3 },
      { label: "C", text: "일단 침대에 눕는다", cat: "HOME", weight: 3 },
      { label: "D", text: "오케이. 술 마시러 나간다", cat: "LIFE", weight: 3 },
    ],
  },
  {
    id: 15,
    prompt: '친구가 말한다. "너 지금 집 만족해?"\n가장 가까운 대답은?',
    choices: [
      { label: "A", text: "더 좋은 위치는 있을 듯", cat: "MOVE", weight: 5 },
      { label: "B", text: "더 싸게 구할 수 있었을 듯", cat: "SAVE", weight: 5 },
      { label: "C", text: "더 좋은 집은 있겠지만 찾기 귀찮다", cat: "HOME", weight: 5 },
      { label: "D", text: "더 재밌는 동네는 있을텐데", cat: "LIFE", weight: 5 },
    ],
  },
];

export interface ResultType {
  slug: string;
  emoji: string;
  name: string;
  risk: number;
  oneliner: string;
  description: string;
  triggers: string[];
  regions: string[];
  listings: string[]; // listing ids
}

export const resultTypes: Record<string, ResultType> = {
  MOVE: {
    slug: "MOVE",
    emoji: "🚇",
    name: "환승 알레르기형",
    risk: 84,
    oneliner: "월세 1만엔보다 내 아침 10분이 더 소중함",
    description:
      "당신에게 동네는 곧 '역'입니다. 환승 한 번 더 끼는 순간 후보에서 탈락. 출근길 만원 전철은 인생의 적입니다.",
    triggers: [
      "출근 시간이 5분만 늘어도 스트레스",
      "환승역 근처에 자석처럼 끌림",
      "막차 시간을 외우고 다님",
    ],
    regions: ["나카노", "오기쿠보", "츠나시마"],
    listings: ["l1", "l2", "l3"],
  },
  SAVE: {
    slug: "SAVE",
    emoji: "💸",
    name: "월세 수호신형",
    risk: 38,
    oneliner: "월세 5000엔 아끼면 치킨이 몇 마리냐",
    description:
      "가계부와 한 몸. 같은 조건이면 무조건 싼 쪽. 초기비용·갱신료까지 엑셀로 비교하는 절약 마스터.",
    triggers: [
      "월세 비교 사이트 즐겨찾기 10개",
      "관리비까지 더한 실질 월세로만 판단",
      "초기비용 0엔 매물 알림 설정",
    ],
    regions: ["아야세", "카메아리", "와라비"],
    listings: ["l4", "l5", "l6"],
  },
  LIFE: {
    slug: "LIFE",
    emoji: "☕",
    name: "카페 난민형",
    risk: 71,
    oneliner: "집은 바꿀 수 있어도 감성은 못 참음",
    description:
      "동네 분위기가 인생의 8할. 카페·서점·소품샵이 도보권에 있어야 살아납니다. 인스타 감성과 호환되는 동네 필수.",
    triggers: [
      "단골 카페가 사라지면 이사 고려",
      "주말 산책 코스가 곧 동네 평가",
      "인스타에 #일상 태그 자주 씀",
    ],
    regions: ["시모키타자와", "코엔지", "산겐자야"],
    listings: ["l7", "l8", "l9"],
  },
  HOME: {
    slug: "HOME",
    emoji: "🏠",
    name: "집순이 끝판왕형",
    risk: 12,
    oneliner: "침대가 마음에 들면 10년도 가능",
    description:
      "집 안이 곧 우주. 햇빛 잘 들고 조용하면 그곳이 베스트 동네. 이사는 인생의 마지막 보루.",
    triggers: [
      "주말 외출 0회도 행복함",
      "방 구조에 진심, 가구 배치 시뮬레이션",
      "조용한 동네면 역세권 양보 가능",
    ],
    regions: ["오이즈미가쿠엔", "후나바시", "카와사키"],
    listings: ["l10", "l11", "l12"],
  },
};

export const CATEGORY_SCORE_NAME: Record<Category, string> = {
  MOVE: "환승력",
  SAVE: "절약력",
  LIFE: "감성력",
  HOME: "집순력",
};

const MAX_SCORES: Record<Category, number> = {
  MOVE: 44,
  SAVE: 47,
  HOME: 47,
  LIFE: 47,
};

export function normalizeScore(cat: Category, raw: number): number {
  return Math.min(100, Math.round((raw / MAX_SCORES[cat]) * 100));
}

export function computeResult(scores: Record<Category, number>): ResultType {
  const sorted = (Object.entries(scores) as [Category, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const [top] = sorted;
  return resultTypes[top[0]];
}

export const CATEGORY_LABEL: Record<Category, string> = {
  MOVE: "ACCESS",
  SAVE: "MONEY",
  HOME: "SPACE",
  LIFE: "VIBE",
};

export const CATEGORY_KO: Record<Category, string> = {
  MOVE: "출퇴근",
  SAVE: "월세",
  HOME: "집 크기",
  LIFE: "동네 분위기",
};