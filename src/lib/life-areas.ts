// 심리테스트 유형 → 생활권 → 일본어 역명 매핑
// 추후 Supabase 테이블로 이관 가능하도록 단일 export로 관리

export type LifeAreaSlug =
  | "MOVE"
  | "SAVE"
  | "LIFE"
  | "HOME"
  | "MOVE_LIFE"
  | "SAVE_HOME"
  | "MOVE_HOME"
  | "LIFE_HOME";

export interface LifeArea {
  name: string; // 한국어 생활권 이름
  stations: string[]; // 일본어 역명 (솔하우징 데이터와 매칭)
}

export const LIFE_AREAS: Record<LifeAreaSlug, LifeArea[]> = {
  // 🚇 환승 알레르기형
  MOVE: [
    { name: "나카노", stations: ["中野", "東中野", "野方", "沼袋", "新井薬師前", "中野坂上"] },
    { name: "오기쿠보", stations: ["荻窪", "西荻窪", "阿佐ヶ谷", "南阿佐ヶ谷"] },
    { name: "츠나시마", stations: ["綱島", "日吉", "大倉山", "新綱島"] },
  ],
  // 💸 월세 수호신형
  SAVE: [
    { name: "아야세", stations: ["綾瀬", "青井", "北綾瀬"] },
    { name: "카메아리", stations: ["亀有", "金町", "京成金町"] },
    { name: "와라비", stations: ["蕨", "西川口", "戸田"] },
  ],
  // ☕ 카페 난민형
  LIFE: [
    { name: "시모키타자와", stations: ["下北沢", "東北沢", "池ノ上", "世田谷代田"] },
    { name: "코엔지", stations: ["高円寺", "新高円寺", "東高円寺", "阿佐ヶ谷"] },
    { name: "산겐자야", stations: ["三軒茶屋", "駒沢大学", "池尻大橋"] },
  ],
  // 🏠 집순이 끝판왕형
  HOME: [
    { name: "오이즈미가쿠엔", stations: ["大泉学園", "保谷", "石神井公園"] },
    { name: "후나바시", stations: ["船橋", "京成船橋", "東船橋"] },
    { name: "카와사키", stations: ["川崎", "京急川崎", "尻手"] },
  ],
  // 🚇☕ 도심 탐험가형
  MOVE_LIFE: [
    { name: "에비스", stations: ["恵比寿", "広尾", "代官山"] },
    { name: "나카메구로", stations: ["中目黒", "祐天寺", "学芸大学"] },
    { name: "지유가오카", stations: ["自由が丘", "奥沢", "緑が丘"] },
  ],
  // 💸🏠 가성비 실속형
  SAVE_HOME: [
    { name: "니시카사이", stations: ["西葛西", "葛西", "船堀"] },
    { name: "마치다", stations: ["町田", "相模大野", "玉川学園前"] },
    { name: "카와고에", stations: ["川越", "川越市", "本川越"] },
  ],
  // 🚇🏠 출퇴근 효율러
  MOVE_HOME: [
    { name: "키타센주", stations: ["北千住", "牛田", "京成関屋"] },
    { name: "미조노쿠치", stations: ["溝の口", "武蔵溝ノ口", "梶が谷"] },
    { name: "츠나시마", stations: ["綱島", "日吉", "新綱島"] },
  ],
  // ☕🏠 감성 집순이형
  LIFE_HOME: [
    { name: "키치조지", stations: ["吉祥寺", "井の頭公園", "三鷹"] },
    { name: "코엔지", stations: ["高円寺", "新高円寺", "東高円寺"] },
    { name: "나카노", stations: ["中野", "東中野", "新井薬師前"] },
  ],
};

export function getAllStations(type: LifeAreaSlug): string[] {
  const areas = LIFE_AREAS[type];
  if (!areas) return [];
  return Array.from(new Set(areas.flatMap((a) => a.stations)));
}