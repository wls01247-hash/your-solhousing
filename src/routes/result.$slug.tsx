import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { resultTypes, type ResultType, type Category, CATEGORY_SCORE_NAME, normalizeScore } from "@/lib/quiz-data";
import { listings } from "@/lib/listings";
import catFace from "@/assets/cat-face-only.png";
import catFull from "@/assets/cat-1.png";
import { Share2, MessageCircle, ExternalLink } from "lucide-react";
import { toPng } from "html-to-image";

export const Route = createFileRoute("/result/$slug")({
  head: ({ params }) => {
    const r = resultTypes[params.slug];
    const title = r ? `${r.emoji} ${r.name} | 도쿄 자취 성향 테스트` : "결과 | 도쿄 자취 성향 테스트";
    const desc = r ? `"${r.oneliner}" — 추천 동네: ${r.regions.join(", ")}` : "도쿄 자취 성향 결과";
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
  const r: ResultType | undefined = resultTypes[slug];
  if (!r) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-bold">결과를 찾을 수 없어요</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">처음으로</Link>
        </div>
      </main>
    );
  }
  return <ResultView r={r} />;
}

function useStoredScores(): Record<Category, number> | null {
  const [scores, setScores] = useState<Record<Category, number> | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("tokyo-quiz-scores");
      if (raw) setScores(JSON.parse(raw));
    } catch {}
  }, []);
  return scores;
}

function ResultView({ r }: { r: ResultType }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const rawScores = useStoredScores();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${r.emoji} 나의 도쿄 자취 성향: ${r.name}\n"${r.oneliner}"\n\n나도 테스트 해보기 👇`;

  const scores = useMemo(() => {
    if (!rawScores) return null;
    const entries = (Object.entries(rawScores) as [Category, number][]).map(
      ([cat, raw]) => ({ cat, name: CATEGORY_SCORE_NAME[cat], value: normalizeScore(cat, raw), raw })
    );
    const sorted = [...entries].sort((a, b) => b.value - a.value);
    return { entries, top: sorted[0] };
  }, [rawScores]);

  const onShare = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Try native share with image file
      if (typeof navigator !== "undefined" && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `tokyo-type-${r.slug}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${r.emoji} 나의 도쿄 자취 성향: ${r.name}`,
              text: `${shareText}\n${shareUrl}`,
              files: [file],
            });
            return;
          }
        } catch {}
      }

      // Fallback: copy link + auto-download image
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `tokyo-type-${r.slug}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  };

  const recommended = r.listings
    .map((id) => listings[id])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <main className="relative min-h-screen bg-gradient-soft pb-16">
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md px-5 pt-6">
        {/* capture-able card area (인스타 스토리용) */}
        <div ref={captureRef} className="rounded-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-soft"
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-90">
            <span>YOUR TOKYO TYPE</span>
            <span>SOL HOUSING</span>
          </div>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-4xl">{r.emoji}</div>
              <h1 className="mt-1 text-[26px] font-black leading-tight">{r.name}</h1>
              <p className="mt-2 text-sm font-medium opacity-90">"{r.oneliner}"</p>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <img src={catFull} alt="마스코트" className="h-[10rem] w-auto object-contain" draggable={false} />
            </div>
          </div>
        </motion.div>

        {/* score bars */}
        {scores && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 rounded-3xl bg-card p-4 shadow-card"
          >
            <h2 className="text-sm font-black text-foreground">나의 도쿄 자취 능력치</h2>
            <div className="mt-4 space-y-3.5">
              {scores.entries.map((s) => {
                const isTop = s.cat === scores.top.cat;
                return (
                  <div key={s.cat}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isTop ? "text-primary" : "text-muted-foreground"}>{s.name}</span>
                      <span className={isTop ? "text-primary" : "text-foreground/70"}>{s.value}점</span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 0.9, delay: 0.2 + 0.1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isTop ? "bg-gradient-to-r from-[var(--brand-soft)] to-[var(--accent-gold)]" : "bg-primary/25"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {scores.top && (
              <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-center">
                <p className="text-xs font-bold text-muted-foreground">가장 높은 유형</p>
                <p className="mt-1 text-base font-black text-primary">{scores.top.name}</p>
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">{r.description}</p>
          </motion.div>
        )}

        {/* regions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <img src={catFace} alt="마스코트" className="h-9 w-9 object-contain" draggable={false} />
            </div>
            <h2 className="text-sm font-black text-foreground">당신에게 어울리는 동네 TOP3</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.regions.map((reg) => (
              <span
                key={reg}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
              >
                #{reg}
              </span>
            ))}
          </div>
        </motion.div>
        </div>

        {/* triggers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <h2 className="text-sm font-black text-foreground">왜 위험한가? 실제 이사 트리거</h2>
          <ul className="mt-3 space-y-2">
            {r.triggers.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* listings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6"
        >
          <h2 className="text-base font-black text-foreground">추천 매물 TOP3</h2>
          <p className="mt-1 text-xs text-muted-foreground">솔하우징 큐레이션 · Mock 데이터</p>
          <div className="mt-3 flex flex-col gap-3">
            {recommended.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
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
            <button
              onClick={onShare}
              disabled={sharing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition active:scale-[0.98] disabled:opacity-60"
            >
              <Share2 size={16} />
              {sharing ? "공유 준비 중..." : copied ? "복사 완료!" : "친구한테 공유하기"}
            </button>

            <a
              href="https://pf.kakao.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition active:scale-[0.98]"
            >
              <MessageCircle size={16} />
              이 결과 기준으로 상담하기
            </a>

            <a
              href="https://www.sol-housing.jp/"
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

function ScrollReset() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

function ListingCard({ l }: { l: import("@/lib/listings").Listing }) {
  return (
    <motion.article
      whileTap={{ scale: 0.98 }}
      className="flex gap-3 overflow-hidden rounded-2xl border border-primary/10 bg-white p-3 shadow-[0_8px_24px_-6px_rgba(46,125,50,0.18)]"
    >
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={l.image}
          alt={l.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate text-[15px] font-extrabold text-foreground">{l.title}</h3>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {l.layout}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {l.station}역 도보 {l.walkMin}분 · {l.area}㎡
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-black text-primary">
            ¥{l.rent.toLocaleString()}
            <span className="ml-1 text-[10px] font-medium text-muted-foreground">
              +관 ¥{l.maintenance.toLocaleString()}
            </span>
          </p>
          <button className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm active:scale-95">
            상세보기
          </button>
        </div>
      </div>
    </motion.article>
  );
}