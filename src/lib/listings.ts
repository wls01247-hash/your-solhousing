export interface Listing {
  id: string;
  title: string;
  station: string;
  walkMin: number;
  rent: number; // yen / month
  maintenance: number;
  layout: string;
  area: number; // m²
  image: string;
}

// Unsplash room photos (Mock 데이터)
const photo = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=70`;

export const listings: Record<string, Listing> = {
  l1:  { id: "l1",  title: "나카노 모던 1K",        station: "나카노",     walkMin: 5,  rent: 78000,  maintenance: 5000, layout: "1K",   area: 22.5, image: photo("photo-1505693416388-ac5ce068fe85") },
  l2:  { id: "l2",  title: "오기쿠보 역세권 1R",     station: "오기쿠보",   walkMin: 3,  rent: 82000,  maintenance: 4000, layout: "1R",   area: 20.1, image: photo("photo-1502672260266-1c1ef2d93688") },
  l3:  { id: "l3",  title: "츠나시마 직통 1K",       station: "츠나시마",   walkMin: 7,  rent: 69000,  maintenance: 3000, layout: "1K",   area: 24.0, image: photo("photo-1493809842364-78817add7ffb") },
  l4:  { id: "l4",  title: "아야세 절약 1R",        station: "아야세",     walkMin: 10, rent: 52000,  maintenance: 3000, layout: "1R",   area: 18.2, image: photo("photo-1484101403633-562f891dc89a") },
  l5:  { id: "l5",  title: "카메아리 가성비 1K",     station: "카메아리",   walkMin: 8,  rent: 56000,  maintenance: 3000, layout: "1K",   area: 21.0, image: photo("photo-1554995207-c18c203602cb") },
  l6:  { id: "l6",  title: "와라비 초저가 1R",      station: "와라비",     walkMin: 12, rent: 48000,  maintenance: 2000, layout: "1R",   area: 19.5, image: photo("photo-1522708323590-d24dbb6b0267") },
  l7:  { id: "l7",  title: "시모키타 감성 1K",      station: "시모키타자와", walkMin: 6,  rent: 92000,  maintenance: 5000, layout: "1K",   area: 23.0, image: photo("photo-1513584684374-8bab748fbf90") },
  l8:  { id: "l8",  title: "코엔지 빈티지 1DK",     station: "코엔지",     walkMin: 9,  rent: 88000,  maintenance: 4000, layout: "1DK",  area: 28.0, image: photo("photo-1493809842364-78817add7ffb") },
  l9:  { id: "l9",  title: "산겐자야 카페거리 1K",   station: "산겐자야",   walkMin: 5,  rent: 95000,  maintenance: 5000, layout: "1K",   area: 22.0, image: photo("photo-1505691938895-1758d7feb511") },
  l10: { id: "l10", title: "오이즈미가쿠엔 넓은 1LDK", station: "오이즈미가쿠엔", walkMin: 11, rent: 78000, maintenance: 4000, layout: "1LDK", area: 36.0, image: photo("photo-1556909114-f6e7ad7d3136") },
  l11: { id: "l11", title: "후나바시 조용한 1DK",   station: "후나바시",   walkMin: 8,  rent: 65000,  maintenance: 3000, layout: "1DK",  area: 30.0, image: photo("photo-1484154218962-a197022b5858") },
  l12: { id: "l12", title: "카와사키 햇살 1K",      station: "카와사키",   walkMin: 10, rent: 72000,  maintenance: 4000, layout: "1K",   area: 25.0, image: photo("photo-1502005229762-cf1b2da7c5d6") },
  l13: { id: "l13", title: "에비스 디자이너스 1K",   station: "에비스",     walkMin: 4,  rent: 132000, maintenance: 6000, layout: "1K",   area: 24.0, image: photo("photo-1505691938895-1758d7feb511") },
  l14: { id: "l14", title: "나카메구로 강뷰 1R",     station: "나카메구로", walkMin: 6,  rent: 125000, maintenance: 6000, layout: "1R",   area: 22.0, image: photo("photo-1513584684374-8bab748fbf90") },
  l15: { id: "l15", title: "지유가오카 부띠끄 1DK",  station: "지유가오카", walkMin: 7,  rent: 138000, maintenance: 7000, layout: "1DK",  area: 28.0, image: photo("photo-1556909114-f6e7ad7d3136") },
  l16: { id: "l16", title: "니시카사이 가족형 1LDK", station: "니시카사이", walkMin: 9,  rent: 82000,  maintenance: 4000, layout: "1LDK", area: 34.0, image: photo("photo-1484101403633-562f891dc89a") },
  l17: { id: "l17", title: "마치다 넓은 2K",       station: "마치다",     walkMin: 12, rent: 75000,  maintenance: 4000, layout: "2K",   area: 38.0, image: photo("photo-1505691938895-1758d7feb511") },
  l18: { id: "l18", title: "카와고에 한적한 1DK",   station: "카와고에",   walkMin: 13, rent: 62000,  maintenance: 3000, layout: "1DK",  area: 30.0, image: photo("photo-1554995207-c18c203602cb") },
  l19: { id: "l19", title: "키타센주 직통 1DK",     station: "키타센주",   walkMin: 5,  rent: 88000,  maintenance: 4500, layout: "1DK",  area: 30.0, image: photo("photo-1502672260266-1c1ef2d93688") },
  l20: { id: "l20", title: "미조노쿠치 1LDK",      station: "미조노쿠치", walkMin: 7,  rent: 96000,  maintenance: 5000, layout: "1LDK", area: 34.0, image: photo("photo-1493809842364-78817add7ffb") },
  l21: { id: "l21", title: "츠나시마 효율 1DK",     station: "츠나시마",   walkMin: 6,  rent: 84000,  maintenance: 4000, layout: "1DK",  area: 28.5, image: photo("photo-1502005229762-cf1b2da7c5d6") },
  l22: { id: "l22", title: "키치조지 공원뷰 1K",    station: "키치조지",   walkMin: 8,  rent: 98000,  maintenance: 5000, layout: "1K",   area: 24.0, image: photo("photo-1505691938895-1758d7feb511") },
  l23: { id: "l23", title: "코엔지 골목 1DK",       station: "코엔지",     walkMin: 7,  rent: 86000,  maintenance: 4000, layout: "1DK",  area: 27.0, image: photo("photo-1513584684374-8bab748fbf90") },
  l24: { id: "l24", title: "나카노 카페근처 1K",    station: "나카노",     walkMin: 6,  rent: 89000,  maintenance: 4500, layout: "1K",   area: 23.0, image: photo("photo-1556909114-f6e7ad7d3136") },
};