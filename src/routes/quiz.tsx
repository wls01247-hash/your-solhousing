import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  questions,
  EMPTY_AXES,
  ROOM_TYPES,
  SIZE_BAND_LABEL,
  STORAGE_KEY,
  type Axis,
  type Hub,
  type QuizAnswers,
  type RoomType,
  type SizeBand,
} from "@/lib/quiz-data";
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
  const [hub, setHub] = useState<Hub | null>(null);
  const [axes, setAxes] = useState<Record<Axis, number>>({ ...EMPTY_AXES });
  const [budget, setBudget] = useState<number>(90000);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [size, setSize] = useState<SizeBand | null>(null);

  const q = questions[step];
  const progress = useMemo(() => ((step + 1) / questions.length) * 100, [step]);
  const catPose = ((step % 4) + 1) as 1 | 2 | 3 | 4;

  const finish = (finalHub: Hub, finalSize: SizeBand) => {
    const answers: QuizAnswers = {
      hub: finalHub,
      axes,
      budget,
      roomTypes,
      size: finalSize,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {}
    navigate({ to: "/result/$slug", params: { slug: finalHub.toLowerCase() } });
  };

  const advance = () => {
    if (step + 1 >= questions.length) return; // 마지막 단계는 finish() 로 처리
    setStep(step + 1);
  };

  const pickHub = (h: Hub) => {
    setHub(h);
    advance();
  };
  const pickAxis = (axis: Axis, weight: number) => {
    setAxes((prev) => ({ ...prev, [axis]: prev[axis] + weight }));
    advance();
  };
  const submitBudget = () => advance();
  const toggleRoom = (rt: RoomType) => {
    setRoomTypes((prev) => (prev.includes(rt) ? prev.filter((x) => x !== rt) : [...prev, rt]));
  };
  const submitRooms = () => advance();
  const pickSize = (s: SizeBand) => {
    setSize(s);
    if (hub) finish(hub, s);
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
              {q.kind === "hub" &&
                q.choices.map((c, i) => (
                  <ChoiceButton key={c.label} label={c.label} text={c.text} i={i} onClick={() => pickHub(c.hub)} />
                ))}

              {q.kind === "axis" &&
                q.choices.map((c, i) => (
                  <ChoiceButton
                    key={c.label}
                    label={c.label}
                    text={c.text}
                    i={i}
                    onClick={() => pickAxis(c.axis, c.weight)}
                  />
                ))}

              {q.kind === "budget" && (
                <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-card">
                  <div className="text-center text-3xl font-black text-primary">
                    ¥{budget.toLocaleString()}
                    <span className="ml-1 text-sm text-muted-foreground">/월</span>
                  </div>
                  <input
                    type="range"
                    min={q.min}
                    max={q.max}
                    step={q.step}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-4 w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>¥{q.min.toLocaleString()}</span>
                    <span>¥{q.max.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={submitBudget}
                    className="mt-5 w-full rounded-2xl bg-gradient-brand py-3.5 text-sm font-bold text-primary-foreground shadow-soft active:scale-[0.98]"
                  >
                    다음
                  </button>
                </div>
              )}

              {q.kind === "roomType" && (
                <>
                  {ROOM_TYPES.map((rt, i) => {
                    const active = roomTypes.includes(rt);
                    return (
                      <motion.button
                        key={rt}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleRoom(rt)}
                        className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left shadow-card transition ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                            active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {active ? "✓" : "·"}
                        </span>
                        <span className="text-[15px] font-bold text-foreground">{rt}</span>
                      </motion.button>
                    );
                  })}
                  <button
                    onClick={submitRooms}
                    disabled={roomTypes.length === 0}
                    className="mt-2 w-full rounded-2xl bg-gradient-brand py-3.5 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-50"
                  >
                    다음 ({roomTypes.length}개 선택)
                  </button>
                </>
              )}

              {q.kind === "size" &&
                (Object.keys(SIZE_BAND_LABEL) as SizeBand[]).map((s, i) => (
                  <ChoiceButton
                    key={s}
                    label={["A", "B", "C", "D"][i]}
                    text={SIZE_BAND_LABEL[s]}
                    i={i}
                    onClick={() => pickSize(s)}
                  />
                ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function ChoiceButton({
  label,
  text,
  i,
  onClick,
}: {
  label: string;
  text: string;
  i: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * i }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-4 text-left shadow-card transition hover:border-primary hover:bg-primary/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-foreground">{text}</span>
    </motion.button>
  );
}