import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export interface ListingDTO {
  uid: number;
  title: string | null;
  address: string | null;
  station_name: string | null;
  station_line: string | null;
  walk_minutes: number | null;
  rent_yen: number | null;
  maintenance_fee_yen: number | null;
  room_type: string | null;
  size_sqm: number | null;
  image_url: string | null;
  property_url: string;
}

const inputSchema = z.object({
  type: z.enum(["MOVE", "SAVE", "LIFE", "HOME", "MOVE_LIFE", "SAVE_HOME", "MOVE_HOME", "LIFE_HOME"]),
  limit: z.number().int().min(1).max(20).optional(),
});

export const getRecommendedListings = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ListingDTO[]> => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: rows, error } = await supabase
      .from("recommended_listings")
      .select(
        "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url, life_area_id",
      )
      .eq("type_slug", data.type)
      .order("updated_at", { ascending: false })
      // 같은 건물의 호실 중복을 걸러내기 위해 넉넉히 가져온 뒤 dedup 처리
      .limit((data.limit ?? 3) * 20);

    if (error) {
      console.error("[getRecommendedListings]", error);
      return [];
    }

    // Dedup 규칙 (updated_at desc 정렬 → 먼저 본 것이 최신):
    //  1) 같은 건물(주소 동일, 없으면 타이틀 동일) → 1건만
    //  2) 같은 생활권(life_area_id 동일) → 1건만
    const seenBuilding = new Set<string>();
    const seenArea = new Set<string>();
    const deduped: ListingDTO[] = [];
    type Row = ListingDTO & { life_area_id?: string | null };
    for (const row of (rows ?? []) as Row[]) {
      const buildingKey = (row.address?.trim() || row.title?.trim() || `uid:${row.uid}`).toLowerCase();
      if (seenBuilding.has(buildingKey)) continue;
      const areaKey = row.life_area_id ?? "";
      if (areaKey && seenArea.has(areaKey)) continue;
      seenBuilding.add(buildingKey);
      if (areaKey) seenArea.add(areaKey);
      // life_area_id는 내부 dedup용 → 클라이언트로 노출하지 않음
      const { life_area_id: _omit, ...dto } = row;
      void _omit;
      deduped.push(dto);
      if (deduped.length >= (data.limit ?? 3)) break;
    }
    return deduped;
  });