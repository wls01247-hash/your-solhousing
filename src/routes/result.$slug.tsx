import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  SIZE_BAND_RANGE,
  decodeAnswers,
  computeAbilities,
  topPersonality,
  personalityFromSlug,
  PERSONALITY,
  type Abilities,
  type PersonalityType,
  type QuizAnswers,
  type ResultSearch,
  type SizeBand,
} from "@/lib/quiz-data";
import { scoreAreas, type ScoredArea } from "@/lib/recommendation";
import catFull from "@/assets/cat-1.png";
import catFace from "@/assets/cat-face-only.png";
import { Share2, MessageCircle, ExternalLink, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getListingsForArea } from "@/lib/area-listings.functions";
import type { ListingDTO } from "@/lib/listings.functions";

export const Route = createFileRoute("/result/$slug")({
  validateSearch: (search: Record<string, unknown>): Partial<ResultSearch> => {
    const out: Partial<ResultSearch> = {};
    if (search.a != null) out.a = String(search.a);
    if (search.b != null && Number.isFinite(Number(search.b))) out.b = Number(search.b);
    if (search.s != null) out.s = String(search.s) as SizeBand;
    if (search.h != null) out.h = String(search.h) as ResultSearch["h"];
    return out;
  },
  head: ({ params }) => {
    const p = personalityFromSlug(params.slug);
    const meta = p ? PERSONALITY[p] : null;
    const title = meta
      ? `${meta.name} — 도쿄 자취 성향 테스트 | 솔하우징`
      : "결과 | 도쿄 자취 성향 테스트";
    const desc = meta ? `${meta.catchphrase} — 당신에게 어울리는 도쿄 동네 TOP3` : "도쿄 자취 성향 결과";
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
  const search = Route.useSearch();
  const personality = personalityFromSlug(slug);
  const storedAnswers = useStoredAnswers();
  const answers = useMemo(() => decodeAnswers(search) ?? storedAnswers, [search, storedAnswers]);

  if (!personality) {
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

  return <ResultView personality={personality} answers={answers} isOwner={storedAnswers != null} />;
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

const TYPE_ACCENT: Record<PersonalityType, { from: string; to: string; bar: string; chip: string }> = {
  MOVE: { from: "from-emerald-500", to: "to-green-600", bar: "from-emerald-400 to-amber-400", chip: "bg-emerald-50 text-emerald-700" },
  SAVE: { from: "from-amber-500", to: "to-orange-600", bar: "from-amber-400 to-rose-400", chip: "bg-amber-50 text-amber-700" },
  HOME: { from: "from-sky-500", to: "to-blue-600", bar: "from-sky-400 to-indigo-400", chip: "bg-sky-50 text-sky-700" },
  LIFE: { from: "from-pink-500", to: "to-rose-500", bar: "from-pink-400 to-fuchsia-400", chip: "bg-pink-50 text-pink-700" },
};

function ResultView({
  personality,
  answers,
  isOwner,
}: {
  personality: PersonalityType;
  answers: QuizAnswers;
  isOwner: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const abilities = useMemo(() => computeAbilities(answers.axes), [answers]);
  // 답변에서 다시 한번 1등 계산 (slug 와 mismatch 가능 — slug 우선)
  const liveTop = topPersonality(abilities);
  const meta = PERSONALITY[personality];
  const accent = TYPE_ACCENT[personality];

  const ranked = useMemo(() => scoreAreas(answers), [answers]);
  const top3 = ranked.slice(0, 3);
  const topArea = top3[0];

  const shareText = `🏠 내 도쿄 자취 유형: ${meta.name}\n${meta.catchphrase}\n어울리는 동네 → ${top3.map(t => `#${t.area.name_ko}`).join(" ")}\n\n나도 테스트 해보기 👇`;
  const shareMessage = `${shareText}\n${shareUrl}`;

  const onShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        try { await navigator.share({ title: meta.name, text: shareMessage }); return; } catch {}
      }
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { console.error(e); }
  };

  const sizeRange = SIZE_BAND_RANGE[answers.size];
  const fetchListings = useServerFn(getListingsForArea);
  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ["area-listings", topArea?.area.slug, answers.budget, answers.size],
    queryFn: () =>
      fetchListings({
        data: {
          stations: topArea.area.stations,
          maxRentYen: answers.budget,
          minSqm: sizeRange.min,
          maxSqm: sizeRange.max,
          limit: 3,
          minResults: 3,
        },
      }),
    staleTime: 5 * 60 * 1000,
    enabled: !!topArea,
  });

  return (
    <main className="relative min-h-screen bg-gradient-soft pb-16">
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md px-5 pt-6">
        {/* HERO — MBTI 스타일 유형 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`overflow-hidden rounded-3xl bg-gradient-to-br ${accent.from} ${accent.to} p-6 text-white shadow-soft`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest opacity-90">
            <span>YOUR TOKYO TYPE</span>
            <span>SOL HOUSING</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-2xl">
                {meta.emoji}
              </div> 
              <h1 className="mt-3 text-[25px] font-black leading-tight">{meta.name}</h1>
              <p className="mt-2 text-sm font-medium leading-relaxed opacity-95">{meta.catchphrase}</p>
            </div>
            <img src={catFull} alt="마스코트" className="h-[9rem] w-auto shrink-0 object-contain" draggable={false} />
          </div>
        </motion.div>

        {/* 4 능력치 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <h2 className="text-sm font-black text-foreground">나의 도쿄 자취 능력치</h2>
          <div className="mt-4 flex flex-col gap-4">
            {(["MOVE", "SAVE", "HOME", "LIFE"] as PersonalityType[]).map((t) => (
              <AbilityBar key={t} label={PERSONALITY[t].abilityLabel} value={abilities[t]} highlight={t === personality} accentBar={TYPE_ACCENT[t].bar} />
            ))}
          </div>
          <div className={`mt-5 rounded-2xl ${accent.chip} px-4 py-3 text-center`}>
            <p className="text-[11px] font-bold opacity-70">가장 높은 유형</p>
            <p className="mt-0.5 text-base font-black">{meta.abilityLabel}</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">{meta.description}</p>
          {liveTop !== personality && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              · 차순위 유형: {PERSONALITY[liveTop].name}
            </p>
          )}
        </motion.div>

        {/* TOP3 동네 해시태그 */}
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
            <h2 className="text-sm font-black text-foreground">당신에게 어울리는 동네 TOP3</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {top3.map((a) => (
              <span key={a.area.slug} className={`rounded-full ${accent.chip} px-4 py-2 text-sm font-bold`}>
                #{a.area.name_ko}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-foreground/70">{topArea?.area.description}</p>
        </motion.div>

        {/* 추천 매물 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6"
        >
          <h2 className="text-base font-black text-foreground">추천 매물</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {topArea?.area.name_ko} 우선 · 예산 ¥{answers.budget.toLocaleString()} 근접 매물
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {loadingListings && (<><ListingSkeleton /><ListingSkeleton /><ListingSkeleton /></>)}
            {!loadingListings && (!listings || listings.length === 0) && (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-card p-5 text-center text-sm text-muted-foreground">
                지금 모집중 매물이 없어요. 솔하우징에 문의해보세요.
              </div>
            )}
            {!loadingListings && listings?.map((l) => <ListingCard key={l.uid} l={l} />)}
          </div>
        </motion.div>

        {/* 차순위 (간단) */}
        {top3.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 rounded-3xl bg-card p-5 shadow-card"
          >
            <h2 className="text-sm font-black text-foreground">다른 후보 동네</h2>
            <div className="mt-3 flex flex-col gap-2">
              {top3.slice(1).map((r) => <RunnerCard key={r.area.slug} r={r} />)}
            </div>
          </motion.div>
        )}

        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 rounded-3xl bg-card p-5 shadow-card"
            id="share"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15">
                <img src={catFace} alt="마스코트" className="h-7 w-7 object-contain" draggable={false} />
              </div>
              <h2 className="text-sm font-black text-foreground">결과 공유하기</h2>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              <a href="https://pf.kakao.com/_iKBxfK" target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-kakao py-4 text-sm font-bold text-kakao-foreground shadow-[0_4px_12px_-4px_rgba(254,229,0,0.5)] transition active:scale-[0.98]">
                <MessageCircle size={18} />이 결과 기준으로 상담하기
              </a>
              <a href="https://www.instagram.com/solhousing/" target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] py-3.5 text-sm font-bold text-white shadow-soft transition active:scale-[0.98]">
                <Instagram size={16} />솔하우징 인스타 팔로우
              </a>
              <button onClick={onShare}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition active:scale-[0.98]">
                <Share2 size={16} />{copied ? "링크 복사 완료!" : "친구한테 공유하기"}
              </button>
              <a href="https://solhousing.com/01_search/list.php?thema=1" target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3.5 text-sm font-bold text-primary transition active:scale-[0.98]">
                <ExternalLink size={16} />더 다양한 집보기
              </a>
            </div>
          </motion.div>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 pb-8">
          <Link to="/" className="text-xs font-bold text-muted-foreground underline underline-offset-2">
            {isOwner ? "테스트 다시 하기" : "테스트 해보기"}
          </Link>
          <p className="text-[11px] text-muted-foreground">© SOL HOUSING — 도쿄 자취 큐레이션</p>
        </div>
      </div>
      <ScrollReset />
    </main>
  );
}

function AbilityBar({ label, value, highlight, accentBar }: { label: string; value: number; highlight: boolean; accentBar: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={`text-[13px] font-extrabold ${highlight ? "text-foreground" : "text-foreground/70"}`}>{label}</span>
        <span className={`text-[13px] font-black ${highlight ? "text-foreground" : "text-foreground/60"}`}>{value}점</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${accentBar}`}
        />
      </div>
    </div>
  );
}

function RunnerCard({ r }: { r: ScoredArea }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white p-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-black text-foreground">#{r.area.name_ko}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          평균 ¥{r.area.avg_rent_yen.toLocaleString()} · {r.area.features.slice(0, 2).join(" / ")}
        </p>
      </div>
    </div>
  );
}

function ScrollReset() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return null;
}

function ListingCard({ l }: { l: ListingDTO }) {
  const titleText = l.title?.split("\n")[0] || l.address || "매물";
  return (
    <motion.a
      href={l.property_url}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className="flex cursor-pointer gap-3 overflow-hidden rounded-2xl border border-primary/10 bg-white p-3 shadow-[0_8px_24px_-6px_rgba(46,125,50,0.18)]">
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        {l.image_url ? (
          <img src={l.image_url} alt={titleText} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">no image</div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate text-[14px] font-extrabold text-foreground">{titleText}</h3>
            {l.room_type && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{l.room_type}</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {l.station_name ?? "-"}駅{l.walk_minutes != null && ` · 도보 ${l.walk_minutes}분`}
            {l.size_sqm != null && ` · ${l.size_sqm}㎡`}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[15px] font-black leading-tight text-primary">¥{(l.rent_yen ?? 0).toLocaleString()}</p>
            {l.maintenance_fee_yen != null && (
              <p className="text-[10px] text-muted-foreground">+관리비 ¥{l.maintenance_fee_yen.toLocaleString()}</p>
            )}
          </div>
          <span
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm">
            상세보기
          </span>
        </div>
      </div>
    </motion.a>
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