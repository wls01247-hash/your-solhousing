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

function totalCost(row: Row): number {
  return (row.rent_yen ?? Number.MAX_SAFE_INTEGER) + (row.maintenance_fee_yen ?? 0);
}

function category(type: string): "SAVE" | "MOVE" | "LIFE" | "OTHER" {
  if (type === "SAVE" || type === "SAVE_HOME") return "SAVE";
  if (type === "MOVE" || type === "MOVE_HOME") return "MOVE";
  if (type === "LIFE" || type === "LIFE_HOME" || type === "MOVE_LIFE") return "LIFE";
  return "OTHER";
}

// SAVE 계열: 가성비 우선 정렬 (월세+관리비 asc → 면적 desc → 최신순)
function sortSave(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const c = totalCost(a) - totalCost(b);
    if (c !== 0) return c;
    const s = (b.size_sqm ?? 0) - (a.size_sqm ?? 0);
    if (s !== 0) return s;
    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });
}

// MOVE 계열: 월세 asc → 최신순 (생활권 적합도는 fetch 단계에서 결정)
function sortMove(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const r = (a.rent_yen ?? Number.MAX_SAFE_INTEGER) - (b.rent_yen ?? Number.MAX_SAFE_INTEGER);
    if (r !== 0) return r;
    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });
}

// LIFE 계열: 지역 다양성을 위해 life_area_id 라운드로빈
function diversifyByArea(rows: Row[]): Row[] {
  const buckets = new Map<string, Row[]>();
  for (const row of rows) {
    const key = row.life_area_id ?? "__none__";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(row);
  }
  for (const list of buckets.values()) {
    list.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  }
  const result: Row[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const list of buckets.values()) {
      const next = list.shift();
      if (next) { result.push(next); added = true; }
    }
  }
  return result;
}

const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
    const cat = category(data.type);

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

    async function fetchAllAvailable(): Promise<Row[]> {
      const { data: rows, error } = await supabase
        .from("listings")
        .select(
          "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url, updated_at",
        )
        .eq("contract_status", "available")
        .order("rent_yen", { ascending: true, nullsFirst: false })
        .limit(limit * 50);
      if (error) {
        console.error("[getRecommendedListings:all]", error);
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

    if (cat === "SAVE") {
      // SAVE 계열: 가성비(월세+관리비) 우선. 생활권은 동률 시 가산.
      const matched = await fetchByTypes([data.type]);
      const matchedIds = new Set(matched.map((r) => r.uid));
      const all = await fetchAllAvailable();
      // 매칭 매물은 동률 시 우선되도록 cost 에 -1 가산 (사실상 같은 비용이면 생활권 우선)
      const merged: Row[] = [
        ...matched,
        ...all.filter((r) => !matchedIds.has(r.uid)),
      ];
      pushRows(sortSave(merged));
    } else if (cat === "MOVE") {
      // MOVE 계열: 생활권 적합도 우선 → 월세 asc → 최신순
      pushRows(sortMove(await fetchByTypes([data.type])));
      if (deduped.length < 3) {
        pushRows(sortMove(await fetchByTypes(adjacentTypes(data.type))));
      }
      if (deduped.length < 3) {
        pushRows(sortMove(await fetchAllAvailable()));
      }
    } else if (cat === "LIFE") {
      // LIFE 계열: 생활권 적합도 우선 → 지역 다양성(라운드로빈) → 최신순
      pushRows(diversifyByArea(await fetchByTypes([data.type])));
      if (deduped.length < 3) {
        pushRows(diversifyByArea(await fetchByTypes(adjacentTypes(data.type))));
      }
      if (deduped.length < 3) {
        pushRows(await fetchAllAvailable());
      }
    } else {
      // 기타(HOME 등): 기존 로직 유지
      pushRows(await fetchByTypes([data.type]));
      if (deduped.length < 3) {
        pushRows(await fetchByTypes(adjacentTypes(data.type)));
      }
      if (deduped.length === 0) {
        pushRows(await fetchAllAvailable());
      }
    }

    return deduped;
  });
