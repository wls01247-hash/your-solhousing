#!/usr/bin/env node
// Standalone SolHousing crawler → Supabase upsert.
// Runs in GitHub Actions, independent of Lovable hosting.
//
// Required env:
//   SUPABASE_URL                 - https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    - service role key (bypasses RLS)
//   MAX_PAGES (optional, default 80)

import { createClient } from "@supabase/supabase-js";

const BASE = "https://solhousing.com";
const LIST_URL = (page) => `${BASE}/01_search/list.php?thema=1&page=${page}`;
const UA = "Mozilla/5.0 (compatible; SolHousingSync/1.0; +https://solhousing.com)";
const MAX_PAGES = parseInt(process.env.MAX_PAGES || "80", 10);
const MIN_SEEN_FOR_SOFT_CLOSE = 50;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function clean(s) {
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

function parseListPage(html) {
  const out = [];
  const cardRe = /<a\s+href="javascript:view\((\d+)\);"\s+class="list_table_li_m">([\s\S]*?)<\/a>/g;
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const uid = parseInt(m[1], 10);
    const body = m[2];

    const cols = [];
    const colRe = /<div\s+class="list_table_li0_m\s+list_table_li[1-5]_m">([\s\S]*?)<\/div>/g;
    let cm;
    while ((cm = colRe.exec(body)) !== null) cols.push(cm[1]);

    const imgM = body.match(/<img\s+src="([^"]+)"/);
    const image_url = imgM ? (imgM[1].startsWith("http") ? imgM[1] : BASE + imgM[1]) : null;

    const c1 = cols[0] ? clean(cols[0]) : "";
    const lines1 = c1.split("\n").filter((l) => !/<img/i.test(l));
    const address = lines1[1] || null;
    const station_line_raw = lines1[2] || null;
    const station_raw = lines1[3] || null;
    const walkRaw = lines1.find((l) => /分$/.test(l)) || null;
    const walk_minutes = walkRaw ? parseInt(walkRaw, 10) || null : null;
    const station_name = station_raw ? station_raw.split("・")[0].trim() : null;
    const station_line = station_line_raw ? station_line_raw.split("・")[0].trim() : null;

    const c2lines = cols[1] ? clean(cols[1]).split("\n") : [];
    const rentMatch = c2lines[0]?.match(/([\d.]+)\s*万円/);
    const rent_yen = rentMatch ? Math.round(parseFloat(rentMatch[1]) * 10000) : null;
    const maintMatch = c2lines[1]?.match(/([\d,]+)\s*円/);
    const maintenance_fee_yen = maintMatch ? parseInt(maintMatch[1].replace(/,/g, ""), 10) : null;

    const c3lines = cols[2] ? clean(cols[2]).split("\n") : [];
    const year_built = c3lines[0] ? parseInt(c3lines[0], 10) || null : null;
    const room_type = c3lines[1] || null;
    const sizeMatch = c3lines[2]?.match(/([\d.]+)/);
    const size_sqm = sizeMatch ? parseFloat(sizeMatch[1]) : null;
    const move_in = c3lines[3] || null;

    const status_raw = cols[3] ? clean(cols[3]) : "";
    let contract_status = "available";
    if (/계약완료|契約済|成約|募集終了/.test(status_raw)) contract_status = "closed";
    else if (/申込中|商談中|相談中/.test(status_raw)) contract_status = "pending";

    out.push({
      uid,
      title: address,
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

async function fetchListPage(page) {
  const res = await fetch(LIST_URL(page), {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
  });
  if (!res.ok) throw new Error(`list page ${page} HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const all = [];
  const seen = new Set();
  let pagesFetched = 0;
  let lastError = null;

  for (let p = 1; p <= MAX_PAGES; p++) {
    let html;
    try {
      html = await fetchListPage(p);
    } catch (e) {
      lastError = e.message;
      console.error(`fetch error on page ${p}: ${e.message}`);
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
    if (added === 0) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`crawled pages=${pagesFetched} listings=${all.length}`);

  // Upsert in batches
  const batchSize = 200;
  let upserted = 0;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize).map((r) => ({
      ...r,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("listings").upsert(batch, { onConflict: "uid" });
    if (error) {
      console.error("upsert error:", error.message);
      process.exit(1);
    }
    upserted += batch.length;
  }
  console.log(`upserted=${upserted}`);

  // Soft-close: anything in DB for thema=1 not seen this run → closed.
  // Only if crawl looks healthy.
  let softClosed = 0;
  if (!lastError && seen.size >= MIN_SEEN_FOR_SOFT_CLOSE) {
    const seenUids = Array.from(seen);
    const { count, error } = await supabase
      .from("listings")
      .update(
        { contract_status: "closed", updated_at: new Date().toISOString() },
        { count: "exact" },
      )
      .eq("thema", 1)
      .neq("contract_status", "closed")
      .not("uid", "in", `(${seenUids.join(",")})`);
    if (error) {
      console.error("soft-close error:", error.message);
    } else {
      softClosed = count ?? 0;
    }
  } else {
    console.log(
      `skipping soft-close (seen=${seen.size} min=${MIN_SEEN_FOR_SOFT_CLOSE} error=${lastError})`,
    );
  }

  const available = all.filter((l) => l.contract_status === "available").length;
  const pending = all.filter((l) => l.contract_status === "pending").length;
  const closedInFeed = all.filter((l) => l.contract_status === "closed").length;

  console.log(
    JSON.stringify({
      success: true,
      pages_fetched: pagesFetched,
      listings_parsed: all.length,
      listings_upserted: upserted,
      available,
      pending,
      closed_in_feed: closedInFeed,
      soft_closed: softClosed,
      fetch_error: lastError,
    }),
  );
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});