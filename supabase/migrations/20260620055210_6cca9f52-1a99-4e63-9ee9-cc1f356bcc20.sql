insert into public.life_area_types (slug, name_ko, emoji, description, display_order) values
  ('MOVE',       '환승 알레르기형',  '🚇',   '환승 없이 한 노선으로 출퇴근하고 싶은 타입', 1),
  ('SAVE',       '월세 수호신형',    '💸',   '월세 부담을 최소화하고 싶은 타입',           2),
  ('LIFE',       '카페 난민형',      '☕',   '동네 분위기·카페·문화를 중시하는 타입',       3),
  ('HOME',       '집순이 끝판왕형',  '🏠',   '조용하고 거주성 좋은 동네를 선호하는 타입',  4),
  ('MOVE_LIFE',  '도심 탐험가형',    '🚇☕', '교통과 라이프스타일을 모두 잡는 타입',        5),
  ('SAVE_HOME',  '가성비 실속형',    '💸🏠', '저렴하면서 살기 좋은 동네를 찾는 타입',       6),
  ('MOVE_HOME',  '출퇴근 효율러',    '🚇🏠', '교통 좋고 조용한 동네를 원하는 타입',         7),
  ('LIFE_HOME',  '감성 집순이형',    '☕🏠', '감성 동네에서 집콕하고 싶은 타입',            8)
on conflict (slug) do update
  set name_ko       = excluded.name_ko,
      emoji         = excluded.emoji,
      description   = excluded.description,
      display_order = excluded.display_order;

do $$
declare
  v_area_id  uuid;
  s_order    integer;
  rec        record;
  station    text;
begin
  for rec in
    select * from (values
      ('MOVE',      '나카노',         1, array['中野','東中野','野方','沼袋','新井薬師前','中野坂上']),
      ('MOVE',      '오기쿠보',       2, array['荻窪','西荻窪','阿佐ヶ谷','南阿佐ヶ谷']),
      ('MOVE',      '츠나시마',       3, array['綱島','日吉','大倉山','新綱島']),
      ('SAVE',      '아야세',         1, array['綾瀬','青井','北綾瀬']),
      ('SAVE',      '카메아리',       2, array['亀有','金町','京成金町']),
      ('SAVE',      '와라비',         3, array['蕨','西川口','戸田']),
      ('LIFE',      '시모키타자와',   1, array['下北沢','東北沢','池ノ上','世田谷代田']),
      ('LIFE',      '코엔지',         2, array['高円寺','新高円寺','東高円寺','阿佐ヶ谷']),
      ('LIFE',      '산겐자야',       3, array['三軒茶屋','駒沢大学','池尻大橋']),
      ('HOME',      '오이즈미가쿠엔', 1, array['大泉学園','保谷','石神井公園']),
      ('HOME',      '후나바시',       2, array['船橋','京成船橋','東船橋']),
      ('HOME',      '카와사키',       3, array['川崎','京急川崎','尻手']),
      ('MOVE_LIFE', '에비스',         1, array['恵比寿','広尾','代官山']),
      ('MOVE_LIFE', '나카메구로',     2, array['中目黒','祐天寺','学芸大学']),
      ('MOVE_LIFE', '지유가오카',     3, array['自由が丘','奥沢','緑が丘']),
      ('SAVE_HOME', '니시카사이',     1, array['西葛西','葛西','船堀']),
      ('SAVE_HOME', '마치다',         2, array['町田','相模大野','玉川学園前']),
      ('SAVE_HOME', '카와고에',       3, array['川越','川越市','本川越']),
      ('MOVE_HOME', '키타센주',       1, array['北千住','牛田','京成関屋']),
      ('MOVE_HOME', '미조노쿠치',     2, array['溝の口','武蔵溝ノ口','梶が谷']),
      ('MOVE_HOME', '츠나시마',       3, array['綱島','日吉','新綱島']),
      ('LIFE_HOME', '키치조지',       1, array['吉祥寺','井の頭公園','三鷹']),
      ('LIFE_HOME', '코엔지',         2, array['高円寺','新高円寺','東高円寺']),
      ('LIFE_HOME', '나카노',         3, array['中野','東中野','新井薬師前'])
    ) as t(type_slug, area_name, ord, stations)
  loop
    insert into public.life_areas (type_slug, name_ko, display_order)
    values (rec.type_slug, rec.area_name, rec.ord)
    on conflict (type_slug, name_ko) do update
      set display_order = excluded.display_order
    returning id into v_area_id;

    s_order := 0;
    foreach station in array rec.stations loop
      s_order := s_order + 1;
      insert into public.life_area_stations (life_area_id, station_name_ja, display_order)
      values (v_area_id, station, s_order)
      on conflict (life_area_id, station_name_ja) do update
        set display_order = excluded.display_order;
    end loop;
  end loop;
end $$;