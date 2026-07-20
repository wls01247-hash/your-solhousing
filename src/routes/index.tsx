import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cat } from "@/components/Cat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "🏠 도쿄에서 당신이 살게 될 동네는? | 솔하우징" },
      { name: "description", content: "11개 질문으로 알아보는 나의 진짜 주거 성향. 도쿄 자취 성향 테스트, 약 1분." },
      { property: "og:title", content: "🏠 도쿄에서 당신이 살게 될 동네는?" },
      { property: "og:description", content: "나는 어디에 살아야 행복할까 — 도쿄 자취생 생존 테스트" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-soft">
      {/* deco blobs */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full items-center justify-between"
        >
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-primary shadow-card">
            SOL HOUSING
          </span>
          <span className="text-xs text-muted-foreground">도쿄 자취 성향 테스트</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
          className="mt-10"
        >
          <Cat pose={1} className="h-44 w-44" float />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 text-center text-3xl font-black leading-tight text-foreground"
        >
          🏠 도쿄에서<br />당신이 살게 될 동네는?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-3 text-center text-base font-semibold text-primary"
        >
          나는 어디에 살아야 행복할까
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 text-center text-sm leading-relaxed text-muted-foreground"
        >
          11개의 질문으로 알아보는<br />나의 진짜 주거 성향
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-foreground/70 shadow-card backdrop-blur"
        >
          <span>⏱</span>
          <span>소요시간 약 1분 · 총 11문항</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="mt-auto w-full pt-12"
        >
          <Link
            to="/quiz"
            className="block w-full rounded-2xl bg-gradient-brand py-4 text-center text-lg font-bold text-primary-foreground shadow-soft transition active:scale-[0.98]"
          >
            테스트 시작하기 →
          </Link>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            결과는 친구에게 공유할 수 있어요 ✨
          </p>
        </motion.div>
      </div>
    </main>
  );
}
