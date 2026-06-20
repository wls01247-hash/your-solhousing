import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questions, type Category } from "@/lib/quiz-data";
import { Cat } from "@/components/Cat";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "테스트 진행 중 | 도쿄 자취 성향 테스트" },
      { name: "description", content: "15개 질문으로 알아보는 나의 도쿄 주거 성향" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Category, number>>({
    MOVE: 0,
    SAVE: 0,
    HOME: 0,
    LIFE: 0,
  });
  const q = questions[step];
  const progress = useMemo(() => ((step + 1) / questions.length) * 100, [step]);
  const catPose = ((step % 4) + 1) as 1 | 2 | 3 | 4;

  const pick = (cat: Category, weight: number) => {
    const next = { ...scores, [cat]: scores[cat] + weight };
    setScores(next);
    if (step + 1 >= questions.length) {
      try {
        sessionStorage.setItem("tokyo-quiz-scores", JSON.stringify(next));
      } catch {}
      // compute slug client side via dynamic import to avoid circular
      import("@/lib/quiz-data").then(({ computeResult }) => {
        const r = computeResult(next);
        navigate({ to: "/result/$slug", params: { slug: r.slug } });
      });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-soft">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-6">
        {/* progress */}
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-white/70 px-3 py-1 shadow-card">
            Q{step + 1} <span className="text-foreground/40">/ {questions.length}</span>
          </span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
          <motion.div
            className="h-full rounded-full bg-gradient-brand"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="mt-8 flex flex-1 flex-col"
          >
            <div className="flex items-center gap-3">
              <Cat pose={catPose} className="h-16 w-16 shrink-0" />
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                상황 #{q.id}
              </span>
            </div>

            <h2 className="mt-5 whitespace-pre-line text-[22px] font-extrabold leading-snug text-foreground">
              {q.prompt}
            </h2>

            <div className="mt-7 flex flex-col gap-3">
              {q.choices.map((c, i) => (
                <motion.button
                  key={c.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pick(c.cat, c.weight)}
                  className="group flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-4 text-left shadow-card transition hover:border-primary hover:bg-primary/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    {c.label}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-foreground">
                    {c.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}