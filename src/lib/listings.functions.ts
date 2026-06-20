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

const ALL_TYPES = [
  "MOVE",
  "SAVE",
  "LIFE",
  "HOME",
  "MOVE_LIFE",
  "SAVE_HOME",
  "MOVE_HOME",
  "LIFE_HOME",
] as const;

// 같은 토큰(MOVE/SAVE/LIFE/HOME)을 하나라도 공유하는 type_slug 를 인접 생활권으로 간주
function adjacentTypes(type: string): string[] {
  const tokens = new Set(type.split("_"));
  return ALL_TYPES.filter((t) => {
    if (t === type) return false;
    return t.split("_").some((tok) => tokens.has(tok));
  });
}

const SELECT_COLS =
  "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url, life_area_id, updated_at";

type Row = ListingDTO & { life_area_id?: string | null; updated_at?: string | null };

function buildingKey(row: Row): string {
  return (row.address?.trim() || row.title?.trim() || `uid:${row.uid}`).toLowerCase();
}

export const getRecommendedListings = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ListingDTO[]> => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const limit = data.limit ?? 6;

    async function fetchByTypes(types: string[]): Promise<Row[]> {
      if (types.length === 0) return [];
      const { data: rows, error } = await supabase
        .from("recommended_listings")
        .select(SELECT_COLS)
        .in("type_slug", types)
        .order("updated_at", { ascending: false })
        .limit(limit * 30);
      if (error) {
        console.error("[getRecommendedListings]", error);
        return [];
      }
      return (rows ?? []) as Row[];
    }

    const seenBuilding = new Set<string>();
    const deduped: ListingDTO[] = [];

    function pushRows(rows: Row[]) {
      for (const row of rows) {
        if (deduped.length >= limit) break;
        const key = buildingKey(row);
        if (seenBuilding.has(key)) continue;
        seenBuilding.add(key);
        const { life_area_id: _a, updated_at: _u, ...dto } = row;
        void _a; void _u;
        deduped.push(dto);
      }
    }

    // 1차: 매칭된 생활권(type_slug)에서 가져오기 (같은 건물 중복 제거)
    pushRows(await fetchByTypes([data.type]));

    // 2차: 3건 미만이면 인접 생활권(공통 토큰을 공유하는 type_slug)에서 보충
    if (deduped.length < 3) {
      pushRows(await fetchByTypes(adjacentTypes(data.type)));
    }

    // 3차: 그래도 비어 있으면 전체 매물에서 최신순으로 보충
    if (deduped.length === 0) {
      const { data: rows } = await supabase
        .from("listings")
        .select(
          "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url, updated_at",
        )
        .eq("contract_status", "available")
        .order("updated_at", { ascending: false })
        .limit(limit * 5);
      pushRows(((rows ?? []) as Row[]));
    }

    return deduped;
  });