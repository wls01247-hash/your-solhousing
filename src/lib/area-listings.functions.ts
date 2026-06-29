import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { ListingDTO } from "./listings.functions";

const inputSchema = z.object({
  stations: z.array(z.string()).min(1).max(20),
  maxRentYen: z.number().int().positive().optional(),
  minSqm: z.number().nonnegative().optional(),
  maxSqm: z.number().nonnegative().nullable().optional(),
  limit: z.number().int().min(1).max(20).default(5),
  minResults: z.number().int().min(0).max(20).default(3),
});

function normalizeStation(s: string): string {
  return s.replace(/[\s\u3000\t]+/g, "").replace(/駅+$/u, "").toLowerCase();
}

export const getListingsForArea = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ListingDTO[]> => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const stationsNorm = data.stations.map(normalizeStation);

    let q = supabase
      .from("listings")
      .select(
        "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url, station_name_normalized",
      )
      .eq("contract_status", "available")
      .in("station_name_normalized", stationsNorm);

    if (data.maxRentYen) {
      // 예산 + 10% 여유까지 허용
      q = q.lte("rent_yen", Math.round(data.maxRentYen * 1.1));
    }
    if (data.minSqm && data.minSqm > 0) {
      q = q.gte("size_sqm", data.minSqm * 0.85);
    }
    if (data.maxSqm != null) {
      q = q.lte("size_sqm", data.maxSqm * 1.15);
    }

    const { data: rows, error } = await q.limit(data.limit * 5);
    if (error) {
      console.error("[getListingsForArea]", error);
    }
    console.log("[getListingsForArea] input:", JSON.stringify(data));
    console.log("[getListingsForArea] stationsNorm:", stationsNorm);
    console.log("[getListingsForArea] primary rows count:", rows?.length ?? 0);

    const list = (rows ?? []) as (ListingDTO & { station_name_normalized?: string | null })[];

    const budget = data.maxRentYen ?? 100000;
    const minSqm = data.minSqm ?? 0;

    const scored = list
      .map((r) => {
        const rent = r.rent_yen ?? 999999;
        const sqm = r.size_sqm ?? 0;
        // 예산 근접도 (예산 이내면 만점, 초과는 감점)
        const budgetScore = rent <= budget ? 1 - (budget - rent) / (budget * 3) : Math.max(0, 1 - (rent - budget) / (budget * 0.3));
        const sqmScore = minSqm > 0 && sqm > 0 ? Math.max(0, 1 - Math.abs(sqm - (minSqm + 4)) / 20) : 0.5;
        return { r, score: budgetScore * 0.6 + sqmScore * 0.4 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, data.limit);

    // 같은 주소 dedupe
    const seen = new Set<string>();
    const result: ListingDTO[] = [];
    for (const { r } of scored) {
      const key = (r.address?.trim() || r.title?.trim() || `uid:${r.uid}`).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const { station_name_normalized: _n, ...dto } = r;
      void _n;
      result.push(dto);
    }

    // A. 적합 매물 3개 이상 → 상위 매물만 사용
    // B. 적합 매물 1~2개 → 전체 available 중 예산이 가장 가까운 유사 매물로 부족분 보충
    // C. 적합 매물 0개 → 전체 available 중 예산이 가장 가까운 매물 3개 추천
    if (result.length < data.minResults) {
      const seenUids = new Set(result.map((r) => r.uid));
      const { data: allRows } = await supabase
        .from("listings")
        .select(
          "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url",
        )
        .eq("contract_status", "available")
        .not("rent_yen", "is", null)
        .limit(500);

      const fallback = ((allRows ?? []) as ListingDTO[])
        .filter((r) => !seenUids.has(r.uid))
        .map((r) => ({ r, diff: Math.abs((r.rent_yen ?? 0) - budget) }))
        .sort((a, b) => a.diff - b.diff);

      for (const { r } of fallback) {
        if (result.length >= data.minResults) break;
        const key = (r.address?.trim() || r.title?.trim() || `uid:${r.uid}`).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(r);
      }
    }

    const final = result.slice(0, Math.max(data.minResults, data.limit));
    console.log("[getListingsForArea] final count:", final.length, "uids:", final.map((r) => r.uid));
    return final;
  });