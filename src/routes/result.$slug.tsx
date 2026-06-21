import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  HUB_LABELS,
  HUB_SHORT,
  STORAGE_KEY,
  SIZE_BAND_RANGE,
  type Hub,
  type QuizAnswers,
} from "@/lib/quiz-data";
import { scoreAreas, type ScoredArea } from "@/lib/recommendation";
import catFace from "@/assets/cat-face-only.png";
import catFull from "@/assets/cat-1.png";
import { Share2, MessageCircle, ExternalLink, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getListingsForArea } from "@/lib/area-listings.functions";
import type { ListingDTO } from "@/lib/listings.functions";

const HUBS: Hub[] = ["SHINJUKU", "SHIBUYA", "TOKYO", "IKEBUKURO", "UNSURE"];
function slugToHub(slug: string): Hub | null {
  const u = slug.toUpperCase();
  return (HUBS as string[]).includes(u) ? (u as Hub) : null;
}

export const Route = createFileRoute("/result/$slug")({
  head: ({ params }) => {
    const hub = slugToHub(params.slug);
    const title = hub
      ? `${HUB_SHORT[hub]} 생활 중심 자취 추천 | 솔하우징`
      : "결과 | 도쿄 자취 성향 테스트";
    const desc = hub
      ? `${HUB_LABELS[hub]} 기준 추천 동네 TOP3 + 실시간 매물 — 솔하우징`
      : "도쿄 자취 성향 결과";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: ResultPage,
});

function ResultPage() {
  const { slug } = useParams({ from: "/result/$slug" });
  const hub = slugToHub(slug);
  const answers = useStoredAnswers();

  if (!hub) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-bold">결과를 찾을 수 없어요</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">처음으로</Link>
        </div>
      </main>
    );
  }

  if (!answers) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-soft p-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">결과 데이터를 불러오는 중...</p>
          <Link to="/quiz" className="mt-4 inline-block text-primary underline">테스트 다시 하기</Link>
        </div>
      </main>
    );
  }

  return <ResultView hub={hub} answers={answers} />;
}

function useStoredAnswers(): QuizAnswers | null {
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, []);
  return answers;
}

function ResultView({ hub, answers }: { hub: Hub; answers: QuizAnswers }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const ranked = useMemo(() => scoreAreas({ ...answers, hub }), [answers, hub]);
  const top = ranked[0];
  const runners = ranked.slice(1, 3);

  const shareText = `🏠 ${HUB_SHORT[hub]} 생활 중심 자취 추천\n🥇 ${top.area.name_ko} (${Math.round(top.total * 100)}점)\n\n나도 테스트 해보기 👇`;

  const onShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: `도쿄 자취 추천: ${top.area.name_ko}`, text: shareText, url: shareUrl });
          return;
        } catch {}
      }
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const sizeRange = SIZE_BAND_RANGE[answers.size];
  const fetchListings = useServerFn(getListingsForArea);
  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ["area-listings", top.area.slug, answers.budget, answers.roomTypes.join(","), answers.size],
    queryFn: () =>
      fetchListings({
        data: {
          stations: top.area.stations,
          maxRentYen: answers.budget,
          roomTypes: answers.roomTypes.length > 0 ? answers.roomTypes : undefined,
          minSqm: sizeRange.min,
          maxSqm: sizeRange.max,
          limit: 5,
        },
      }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <main className="relative min-h-screen bg-gradient-soft pb-16">
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md px-5 pt-6">
        {/* Hero — 추천 1위 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-soft"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-90">
            <span>🥇 RECOMMENDED AREA</span>
            <span>SOL HOUSING</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold opacity-90">{HUB_SHORT[hub]} 생활권 기준</p>
              <h1 className="mt-1 text-[30px] font-black leading-tight">{top.area.name_ko}</h1>
              <p className="text-sm font-medium opacity-90">{top.area.name_ja}</p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                매칭 {Math.round(top.total * 100)}점
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <img src={catFull} alt="마스코트" className="h-[9rem] w-auto object-contain" draggable={false} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <InfoChip label="평균 월세" value={`¥${top.area.avg_rent_yen.toLocaleString()}`} />
            {top.hubAccess ? (
              <InfoChip
                label={`${HUB_SHORT[hub]}까지`}
                value={`${top.hubAccess.minutes}분 · 환승 ${top.hubAccess.transfers}회`}
              />
            ) : (
              <InfoChip label="초보 추천" value="가성비 · 치안 중심" />
            )}
          </div>
        </motion.div>

        {/* 추천 이유 + 특징 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <h2 className="text-sm font-black text-foreground">왜 이 지역인가요?</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{top.area.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {top.topReasons.map((reason) => (
              <span key={reason} className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                ✓ {reason}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {top.area.features.map((f) => (
              <span key={f} className="rounded-full border border-border bg-white/60 px-3 py-1 text-[11px] font-semibold text-foreground/70">
                #{f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 차순위 */}
        {runners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 rounded-3xl bg-card p-5 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <img src={catFace} alt="마스코트" className="h-7 w-7 object-contain" draggable={false} />
              </div>
              <h2 className="text-sm font-black text-foreground">차순위 추천</h2>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {runners.map((r, idx) => (
                <RunnerCard key={r.area.slug} rank={idx + 2} r={r} hub={hub} />
              ))}
            </div>
          </motion.div>
        )}

        {/* 실제 매물 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6"
        >
          <h2 className="text-base font-black text-foreground">{top.area.name_ko} 실시간 매물</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            솔하우징 · 예산 ¥{answers.budget.toLocaleString()}{answers.roomTypes.length > 0 && ` · ${answers.roomTypes.join("/")}`} 기준
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {loadingListings && (
              <>
                <ListingSkeleton />
                <ListingSkeleton />
                <ListingSkeleton />
              </>
            )}
            {!loadingListings && (!listings || listings.length === 0) && (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-card p-5 text-center text-sm text-muted-foreground">
                조건에 맞는 모집중 매물이 없어요.
                <br />
                예산을 조금 늘리거나 솔하우징에 문의해보세요.
              </div>
            )}
            {!loadingListings && listings?.map((l) => <ListingCard key={l.uid} l={l} />)}
          </div>
        </motion.div>

        {/* bottom actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8 rounded-3xl bg-card p-5 shadow-card"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15">
              <img src={catFace} alt="마스코트" className="h-7 w-7 object-contain" draggable={false} />
            </div>
            <h2 className="text-sm font-black text-foreground">결과 공유하기</h2>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href="https://pf.kakao.com/_iKBxfK"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-kakao py-4 text-sm font-bold text-kakao-foreground shadow-[0_4px_12px_-4px_rgba(254,229,0,0.5)] transition active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              이 결과 기준으로 상담하기
            </a>

            <a
              href="https://www.instagram.com/solhousing/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] py-3.5 text-sm font-bold text-white shadow-soft transition active:scale-[0.98]"
            >
              <Instagram size={16} />
              솔하우징 인스타 팔로우
            </a>

            <button
              onClick={onShare}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition active:scale-[0.98]"
            >
              <Share2 size={16} />
              {copied ? "링크 복사 완료!" : "친구한테 공유하기"}
            </button>

            <a
              href="https://solhousing.com/01_search/list.php?thema=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3.5 text-sm font-bold text-primary transition active:scale-[0.98]"
            >
              <ExternalLink size={16} />
              더 다양한 집보기
            </a>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-2 pb-8">
          <Link
            to="/"
            className="text-xs font-bold text-muted-foreground underline underline-offset-2"
          >
            테스트 다시 하기
          </Link>
          <p className="text-[11px] text-muted-foreground">© SOL HOUSING — 도쿄 자취 큐레이션</p>
        </div>
      </div>
      <ScrollReset />
    </main>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur">
      <p className="text-[10px] font-bold uppercase opacity-80">{label}</p>
      <p className="mt-0.5 text-[13px] font-black">{value}</p>
    </div>
  );
}

function RunnerCard({ rank, r, hub }: { rank: number; r: ScoredArea; hub: Hub }) {
  const medal = rank === 2 ? "🥈" : "🥉";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white p-3">
      <div className="text-2xl">{medal}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[15px] font-black text-foreground">{r.area.name_ko}</h3>
          <span className="shrink-0 text-[11px] font-bold text-primary">{Math.round(r.total * 100)}점</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          ¥{r.area.avg_rent_yen.toLocaleString()}
          {r.hubAccess && ` · ${HUB_SHORT[hub]} ${r.hubAccess.minutes}분`}
          {r.hubAccess && ` · 환승 ${r.hubAccess.transfers}회`}
        </p>
        <p className="mt-1 truncate text-[11px] text-foreground/70">
          {r.topReasons.slice(0, 2).map((x) => `✓${x}`).join("  ")}
        </p>
      </div>
    </div>
  );
}

function ScrollReset() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

function ListingCard({ l }: { l: ListingDTO }) {
  const titleText = l.title?.split("\n")[0] || l.address || "매물";
  return (
    <motion.article
      whileTap={{ scale: 0.98 }}
      className="flex gap-3 overflow-hidden rounded-2xl border border-primary/10 bg-white p-3 shadow-[0_8px_24px_-6px_rgba(46,125,50,0.18)]"
    >
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        {l.image_url ? (
          <img
            src={l.image_url}
            alt={titleText}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            no image
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate text-[14px] font-extrabold text-foreground">{titleText}</h3>
            {l.room_type && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {l.room_type}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {l.station_name ?? "-"}駅
            {l.walk_minutes != null && ` · 도보 ${l.walk_minutes}분`}
            {l.size_sqm != null && ` · ${l.size_sqm}㎡`}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[15px] font-black leading-tight text-primary">
              ¥{(l.rent_yen ?? 0).toLocaleString()}
            </p>
            {l.maintenance_fee_yen != null && (
              <p className="text-[10px] text-muted-foreground">
                +관리비 ¥{l.maintenance_fee_yen.toLocaleString()}
              </p>
            )}
          </div>
          <a
            href={l.property_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm active:scale-95"
          >
            상세보기
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function ListingSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl border border-primary/10 bg-white p-3">
      <div className="h-28 w-28 shrink-0 animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}