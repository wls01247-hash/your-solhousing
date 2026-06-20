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
        "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url",
      )
      .eq("type_slug", data.type)
      .order("updated_at", { ascending: false })
      // 같은 건물의 호실 중복을 걸러내기 위해 넉넉히 가져온 뒤 dedup 처리
      .limit((data.limit ?? 3) * 20);

    if (error) {
      console.error("[getRecommendedListings]", error);
      return [];
    }

    // 중복 판정: 1) address 동일 → 같은 건물  2) address 없으면 title 동일
    // updated_at desc 정렬되어 있으므로 먼저 들어온 것(=최신)만 유지
    const seen = new Set<string>();
    const deduped: ListingDTO[] = [];
    for (const row of (rows ?? []) as ListingDTO[]) {
      const key = (row.address?.trim() || row.title?.trim() || `uid:${row.uid}`).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(row);
      if (deduped.length >= (data.limit ?? 3)) break;
    }
    return deduped;
  });