import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://solhousing.com";
const LIST_URL = (page: number) => `${BASE}/01_search/list.php?thema=1&page=${page}`;
const MAX_PAGES = 80; // ~4,800 listings
const UA = "Mozilla/5.0 (compatible; SolHousingSync/1.0; +https://solhousing.com)";

interface ParsedListing {
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
  year_built: number | null;
  move_in: string | null;
  image_url: string | null;
  property_url: string;
  contract_status: "available" | "pending" | "closed";
  raw_status: string | null;
  thema: number;
}

// Strip HTML tags, normalize whitespace
function clean(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t\u00a0]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

function parseListPage(html: string): ParsedListing[] {
  const out: ParsedListing[] = [];
  // Each card: <a href="javascript:view(NNN);" class="list_table_li_m"> ... </a>
  const cardRe = /<a\s+href="javascript:view\((\d+)\);"\s+class="list_table_li_m">([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html)) !== null) {
    const uid = parseInt(m[1], 10);
    const body = m[2];

    // Extract the four list_table_liX_m columns
    const cols: string[] = [];
    const colRe = /<div\s+class="list_table_li0_m\s+list_table_li[1-5]_m">([\s\S]*?)<\/div>/g;
    let cm: RegExpExecArray | null;
    while ((cm = colRe.exec(body)) !== null) cols.push(cm[1]);

    // Image
    const imgM = body.match(/<img\s+src="([^"]+)"/);
    const image_url = imgM ? (imgM[1].startsWith("http") ? imgM[1] : BASE + imgM[1]) : null;

    // Col 1: matter no. / address / line / station / walk
    const c1 = cols[0] ? clean(cols[0]) : "";
    const lines1 = c1.split("\n").filter((l) => !/<img/i.test(l));
    // Expected: ["no.xxx", "address", "line", "station", "N分"]
    const address = lines1[1] || null;
    const station_line_raw = lines1[2] || null;
    const station_raw = lines1[3] || null;
    const walkRaw = lines1.find((l) => /分$/.test(l)) || null;
    const walk_minutes = walkRaw ? parseInt(walkRaw, 10) || null : null;
    // station_raw like "新横浜 ・ 신요코하마" → take Japanese (before ・)
    const station_name = station_raw ? station_raw.split("・")[0].trim() : null;
    const station_line = station_line_raw ? station_line_raw.split("・")[0].trim() : null;

    // Col 2: rent / maintenance / shikikin / reikin
    const c2lines = cols[1] ? clean(cols[1]).split("\n") : [];
    // "11 万円", "10,000 円", "0 ヶ月", "1 ヶ月"
    const rentMatch = c2lines[0]?.match(/([\d.]+)\s*万円/);
    const rent_yen = rentMatch ? Math.round(parseFloat(rentMatch[1]) * 10000) : null;
    const maintMatch = c2lines[1]?.match(/([\d,]+)\s*円/);
    const maintenance_fee_yen = maintMatch ? parseInt(maintMatch[1].replace(/,/g, ""), 10) : null;

    // Col 3: year / room_type / size / move_in
    const c3lines = cols[2] ? clean(cols[2]).split("\n") : [];
    const year_built = c3lines[0] ? parseInt(c3lines[0], 10) || null : null;
    const room_type = c3lines[1] || null;
    const sizeMatch = c3lines[2]?.match(/([\d.]+)/);
    const size_sqm = sizeMatch ? parseFloat(sizeMatch[1]) : null;
    const move_in = c3lines[3] || null;

    // Col 4: status — "모집중 募集中" / "申込中 / 商談中" / "계약완료 / 契約済"
    const status_raw = cols[3] ? clean(cols[3]) : "";
    let contract_status: "available" | "pending" | "closed" = "available";
    if (/계약완료|契約済|成約|募集終了/.test(status_raw)) contract_status = "closed";
    else if (/申込中|商談中|相談中/.test(status_raw)) contract_status = "pending";

    out.push({
      uid,
      title: address, // 리스트 페이지에 건물명이 없어 주소를 타이틀로 사용
      address,
      station_name,
      station_line,
      walk_minutes,
      rent_yen,
      maintenance_fee_yen,
      room_type,
      size_sqm,
      year_built,
      move_in,
      image_url,
      property_url: `${BASE}/01_search/view.php?uid=${uid}`,
      contract_status,
      raw_status: status_raw || null,
      thema: 1,
    });
  }
  return out;
}

async function fetchListPage(page: number, signal: AbortSignal): Promise<string> {
  const res = await fetch(LIST_URL(page), {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal,
  });
  if (!res.ok) throw new Error(`list page ${page} HTTP ${res.status}`);
  return res.text();
}

async function runSync(maxPages: number) {
  const all: ParsedListing[] = [];
  const seen = new Set<number>();
  const controller = new AbortController();
  // Hard cap on total time
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let pagesFetched = 0;
  let lastError: string | null = null;
  try {
    for (let p = 1; p <= maxPages; p++) {
      let html: string;
      try {
        html = await fetchListPage(p, controller.signal);
      } catch (e) {
        lastError = (e as Error).message;
        break;
      }
      const parsed = parseListPage(html);
      pagesFetched++;
      if (parsed.length === 0) break;
      let added = 0;
      for (const item of parsed) {
        if (seen.has(item.uid)) continue;
        seen.add(item.uid);
        all.push(item);
        added++;
      }
      // If no new uids on this page, we've looped back — stop
      if (added === 0) break;
      // small delay
      await new Promise((r) => setTimeout(r, 200));
    }
  } finally {
    clearTimeout(timeout);
  }

  // Upsert in batches
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const batchSize = 200;
  let upserted = 0;
  let upsertError: string | null = null;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize).map((r) => ({ ...r, updated_at: new Date().toISOString() }));
    const { error } = await supabaseAdmin.from("listings").upsert(batch, { onConflict: "uid" });
    if (error) {
      upsertError = error.message;
      break;
    }
    upserted += batch.length;
  }

  // Soft-close: any listing in DB (for this thema) that we did NOT see this run → 'closed'
  // Only run when the crawl looks healthy (no fetch error and we saw >= MIN_SEEN listings)
  // to avoid wiping the catalog when SolHousing temporarily blocks us.
  const MIN_SEEN = 50;
  let softClosed = 0;
  let softCloseError: string | null = null;
  if (!lastError && !upsertError && seen.size >= MIN_SEEN) {
    const seenUids = Array.from(seen);
    const { count, error } = await supabaseAdmin
      .from("listings")
      .update({ contract_status: "closed", updated_at: new Date().toISOString() }, { count: "exact" })
      .eq("thema", 1)
      .neq("contract_status", "closed")
      .not("uid", "in", `(${seenUids.join(",")})`);
    if (error) softCloseError = error.message;
    else softClosed = count ?? 0;
  }

  return {
    pages_fetched: pagesFetched,
    listings_parsed: all.length,
    listings_upserted: upserted,
    available: all.filter((l) => l.contract_status === "available").length,
    pending: all.filter((l) => l.contract_status === "pending").length,
    closed_in_feed: all.filter((l) => l.contract_status === "closed").length,
    soft_closed: softClosed,
    fetch_error: lastError,
    upsert_error: upsertError,
    soft_close_error: softCloseError,
  };
}

export const Route = createFileRoute("/api/public/hooks/sync-listings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const maxPages = Math.min(
          Math.max(parseInt(url.searchParams.get("max_pages") ?? "", 10) || MAX_PAGES, 1),
          MAX_PAGES,
        );
        try {
          const result = await runSync(maxPages);
          return Response.json({ success: true, ...result, ts: new Date().toISOString() });
        } catch (e) {
          console.error("[sync-listings]", e);
          return Response.json({ success: false, error: (e as Error).message }, { status: 500 });
        }
      },
      GET: async ({ request }) => {
        // Allow manual trigger via GET as well (no body needed)
        const url = new URL(request.url);
        const maxPages = Math.min(
          Math.max(parseInt(url.searchParams.get("max_pages") ?? "", 10) || MAX_PAGES, 1),
          MAX_PAGES,
        );
        try {
          const result = await runSync(maxPages);
          return Response.json({ success: true, ...result, ts: new Date().toISOString() });
        } catch (e) {
          console.error("[sync-listings]", e);
          return Response.json({ success: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});