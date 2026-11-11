"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Compass,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  HandHeart,
  Heart,
  Home,
  Info,
  LoaderCircle,
  Lock,
  Map,
  MapPin,
  MessageCircle,
  Monitor,
  Moon,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  Trash2,
  Trophy,
  Type,
  UserRound,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import {
  calculateChart,
  formatExactPlacement,
  type BirthLocation,
  type ChartInput,
  type ChartResult,
  type RequestedSystem,
} from "@/lib/astrology";
import { lessonExpansions, lessonSources, lessons, quickReviews, type Lesson } from "@/lib/lesson-data";

type View = "home" | "learn" | "practice" | "profile" | "jyotisha";
type Appearance = "system" | "light" | "dark";
type TextScale = "default" | "large";

type AppState = {
  onboarded: boolean;
  name: string;
  background: string;
  knowledge: string;
  learningStyle: string;
  goals: string[];
  minutes: number;
  reminderEnabled: boolean;
  reminderTime: string;
  lastReminderDay: string | null;
  wisdom: number;
  streak: number;
  lastActive: string | null;
  activeDays: string[];
  completedLessons: string[];
  completedPractices: string[];
  reviewSchedule: Record<string, { nextDue: string; intervalDays: number }>;
  savedVerses: string[];
  journalEntries: Array<{ id: string; date: string; text: string }>;
  chartInput: ChartInput | null;
  requestedSystem: RequestedSystem;
  appearance: Appearance;
  textScale: TextScale;
  reducedMotion: boolean;
  highContrast: boolean;
  charts: Partial<Record<"vedic" | "western", ChartResult>>;
};

const initialState: AppState = {
  onboarded: false,
  name: "",
  background: "",
  knowledge: "beginner",
  learningStyle: "",
  goals: [],
  minutes: 5,
  reminderEnabled: false,
  reminderTime: "19:00",
  lastReminderDay: null,
  wisdom: 0,
  streak: 0,
  lastActive: null,
  activeDays: [],
  completedLessons: [],
  completedPractices: [],
  reviewSchedule: {},
  savedVerses: [],
  journalEntries: [],
  chartInput: null,
  requestedSystem: "vedic",
  appearance: "system",
  textScale: "default",
  reducedMotion: false,
  highContrast: false,
  charts: {},
};

const goalOptions = [
  { id: "learn", label: "Understand Hinduism", icon: BookOpen },
  { id: "calm", label: "Build a calmer mind", icon: Brain },
  { id: "purpose", label: "Find direction", icon: Compass },
  { id: "discipline", label: "Build discipline", icon: Target },
  { id: "health", label: "Create healthier rhythms", icon: Heart },
  { id: "astrology", label: "Understand astrology", icon: Orbit },
  { id: "relationships", label: "Improve relationships", icon: MessageCircle },
  { id: "practice", label: "Develop a spiritual practice", icon: Sparkles },
];

const backgroundOptions = [
  { id: "hindu", label: "I practice Hinduism", note: "Build depth and context" },
  { id: "familiar", label: "I’m culturally familiar", note: "Connect familiar ideas" },
  { id: "other-faith", label: "I follow another religion", note: "Learn without pressure" },
  { id: "spiritual", label: "Spiritual, not religious", note: "Explore practical wisdom" },
  { id: "new", label: "Completely new and curious", note: "Start with plain language" },
  { id: "academic", label: "Academic or cultural interest", note: "Emphasize history and schools" },
];

const backgroundLabels: Record<string, string> = Object.fromEntries(
  backgroundOptions.map((item) => [item.id, item.label]),
);

const learningStyleOptions = [
  { id: "practical", label: "Practical", note: "Everyday decisions and habits" },
  { id: "philosophical", label: "Philosophical", note: "Ideas, questions, and schools" },
  { id: "devotional", label: "Devotional", note: "Meaning, reverence, and relationship" },
  { id: "psychological", label: "Psychological", note: "Mind, emotion, and self-awareness" },
  { id: "mixed", label: "A thoughtful mix", note: "Balance all four approaches" },
];

const learningFocus: Record<string, { label: string; question: string }> = {
  practical: { label: "Everyday application", question: "Where could this idea change one decision you make today?" },
  philosophical: { label: "A question to investigate", question: "Which assumptions does this idea invite you to examine? How might another school interpret it?" },
  devotional: { label: "Meaning and relationship", question: "How might this idea deepen attention to a person, value, or sacred relationship that matters to you?" },
  psychological: { label: "Notice your inner response", question: "What feeling or habit arises as you consider this idea? Can you notice it without judgment?" },
  mixed: { label: "Connect idea and experience", question: "What does this idea mean, how does it feel, and what small action might follow?" },
};

const navItems: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Today", icon: Home },
  { id: "learn", label: "Learn", icon: Map },
  { id: "practice", label: "Practice", icon: Dumbbell },
  { id: "profile", label: "You", icon: UserRound },
];

const LESSON_REWARD = 30;
const REVIEW_REWARD = 5;
const PRACTICE_REWARD = 10;
const REFLECTION_REWARD = 5;

function pathLabel(minutes: number) {
  if (minutes <= 5) return { name: "Quick", minutes: 5, detail: "Idea · decision · reflection" };
  if (minutes <= 10) return { name: "Standard", minutes: 10, detail: "Guided lesson and practice" };
  return { name: "Deep", minutes: minutes >= 20 ? 20 : 15, detail: "Full activities and sources" };
}

const colorClasses: Record<Lesson["color"], string> = {
  saffron: "bg-amber-500 text-white shadow-amber-500/20",
  violet: "bg-violet-600 text-white shadow-violet-600/20",
  sky: "bg-sky-600 text-white shadow-sky-600/20",
  emerald: "bg-emerald-600 text-white shadow-emerald-600/20",
};

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function activityUpdate(state: AppState) {
  const today = dayKey();
  const activeDays = state.activeDays.includes(today) ? state.activeDays : [...state.activeDays, today].slice(-90);
  if (state.lastActive === today) return { streak: state.streak, lastActive: today, activeDays };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return {
    streak: state.lastActive === dayKey(yesterday) ? state.streak + 1 : 1,
    lastActive: today,
    activeDays,
  };
}

function ThemeControl({
  appearance,
  onChange,
  showLabel = false,
}: {
  appearance: Appearance;
  onChange: (appearance: Appearance) => void;
  showLabel?: boolean;
}) {
  const active = appearance === "light" ? { label: "Light", icon: Sun } : appearance === "dark" ? { label: "Dark", icon: Moon } : { label: "System", icon: Monitor };
  const ActiveIcon = active.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={showLabel ? "default" : "icon"} className={`theme-control rounded-full ${showLabel ? "gap-2 px-3" : ""}`} aria-label={`Appearance: ${active.label}`}>
          <ActiveIcon className="size-4" />
          {showLabel && <span>{active.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-2xl p-2 shadow-xl">
        <DropdownMenuLabel className="px-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={appearance} onValueChange={(value) => onChange(value as Appearance)}>
          <DropdownMenuRadioItem value="light" className="rounded-xl py-2.5"><Sun /> Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="rounded-xl py-2.5"><Moon /> Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="rounded-xl py-2.5"><Monitor /> System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Onboarding({ initial, onFinish, appearance, onAppearanceChange }: { initial: AppState; onFinish: (state: Partial<AppState>) => void; appearance: Appearance; onAppearanceChange: (appearance: Appearance) => void }) {
  const [step, setStep] = useState(0);
  const name = initial.name;
  const [goals, setGoals] = useState<string[]>(initial.goals);
  const [background, setBackground] = useState(initial.background);
  const knowledge = initial.knowledge || "beginner";
  const [learningStyle, setLearningStyle] = useState(initial.learningStyle);
  const hasSavedPreferences = initial.goals.length > 0 || Boolean(initial.background) || Boolean(initial.learningStyle);
  const [minutes, setMinutes] = useState(hasSavedPreferences ? initial.minutes || 5 : 0);
  const reminderTime = initial.reminderTime || "19:00";
  const totalSteps = 3;
  const restored = hasSavedPreferences;

  const canContinue =
    step === 1 ? goals.length > 0 : step === 2 ? Boolean(background) : step === 3 ? Boolean(learningStyle) && minutes > 0 : true;

  const toggleGoal = (goal: string) => {
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  };

  const finish = () => {
    onFinish({
      onboarded: true,
      name: name.trim() || "Seeker",
      goals,
      background,
      knowledge,
      learningStyle,
      minutes,
      reminderTime,
    });
  };

  return (
    <main className="dharma-cosmos min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Flower2 className="size-6" />
            </span>
            <span className="text-lg">Dharma Quest</span>
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && <span className="text-sm text-muted-foreground">Step {Math.min(step, totalSteps)} of {totalSteps}</span>}
            <ThemeControl appearance={appearance} onChange={onAppearanceChange} />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center py-8">
          <section className="dharma-card w-full rounded-[2rem] border bg-card p-6 sm:p-10">
            {step > 0 && <Progress value={(step / totalSteps) * 100} aria-label={`Onboarding step ${step} of ${totalSteps}`} className="mb-8 h-2.5" />}

            {step === 0 && (
              <div className="onboarding-stage text-center">
                <div className="gentle-float mx-auto mb-6 grid size-24 place-items-center rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-900 text-white shadow-2xl shadow-violet-600/25">
                  <Sparkles className="size-11" />
                </div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                  Learn it · live it
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  Learn timeless ideas. Live them today.
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  A welcoming introduction to Hindu philosophy, thoughtful daily practice, and the many traditions that shape them.
                </p>
                <div className="mx-auto mt-7 grid max-w-xl gap-3 text-left sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary p-4"><BookOpen className="size-5 text-primary" /><strong className="mt-3 block">Learn</strong><span className="text-sm text-muted-foreground">Ideas with sources and context</span></div>
                  <div className="rounded-2xl bg-secondary p-4"><Heart className="size-5 text-primary" /><strong className="mt-3 block">Practice</strong><span className="text-sm text-muted-foreground">Small, adaptable actions</span></div>
                  <div className="rounded-2xl border border-dashed bg-background p-4"><Orbit className="size-5 text-primary" /><strong className="mt-3 block">Explore, optionally</strong><span className="text-sm text-muted-foreground">Jyotisha in cultural context</span></div>
                </div>
                <Button onClick={() => setStep(1)} size="lg" className="mt-8 h-12 rounded-xl px-8 text-base">
                  Begin my journey <ArrowRight />
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">Three choices · about one minute</p>
              </div>
            )}

            {step === 1 && (
              <div key="onboarding-goals" className="onboarding-stage">
                <p className="text-sm font-semibold text-primary">Your intention</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">What brings you here?</h1>
                <p className="mt-2 text-muted-foreground">Choose all that feel useful. You can change them later.</p>
                {restored && goals.length > 0 && <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground"><Check className="mr-1 inline size-4" /> Saved preferences restored from this browser.</p>}
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {goalOptions.map(({ id, label, icon: Icon }) => {
                    const selected = goals.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleGoal(id)}
                        aria-pressed={selected}
                        className={`flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-left text-base font-medium transition ${selected ? "border-primary bg-primary/10 ring-2 ring-primary/15" : "bg-background hover:border-primary/45 hover:bg-secondary/50"}`}
                      >
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                          <Icon className="size-5" />
                        </span>
                        <span className="flex-1">{label}</span>
                        {selected && <Check className="size-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div key="onboarding-background" className="onboarding-stage">
                <p className="text-sm font-semibold text-primary">Your learning lens</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">What is your background?</h1>
                <p className="mt-2 text-muted-foreground">Tell us your perspective. Everyone can learn the core ideas without changing their beliefs.</p>
                {restored && background && <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground"><Check className="mr-1 inline size-4" /> Your saved background is selected.</p>}
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {backgroundOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBackground(option.id)}
                      aria-pressed={background === option.id}
                      className={`rounded-2xl border p-4 text-left transition ${background === option.id ? "border-primary bg-primary/10 ring-2 ring-primary/15" : "bg-background hover:border-primary/45"}`}
                    >
                      <span className="flex items-center justify-between gap-2 font-semibold">
                        {option.label}
                        {background === option.id && <CircleCheck className="size-5 text-primary" />}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{option.note}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div key="onboarding-rhythm" className="onboarding-stage">
                <p className="text-sm font-semibold text-primary">Your starting rhythm</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Choose a path that fits today</h1>
                <p className="mt-2 text-muted-foreground">This changes emphasis and length, never the care or accuracy of the teaching.</p>
                {restored && learningStyle && <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground"><Check className="mr-1 inline size-4" /> Saved learning preferences restored.</p>}
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {learningStyleOptions.map((option) => (
                    <button key={option.id} type="button" onClick={() => setLearningStyle(option.id)} aria-pressed={learningStyle === option.id} className={`rounded-2xl border p-4 text-left transition ${learningStyle === option.id ? "border-primary bg-primary/10 ring-2 ring-primary/15" : "bg-background hover:border-primary/45"}`}>
                      <span className="flex items-center justify-between gap-2 font-semibold">{option.label}{learningStyle === option.id && <CircleCheck className="size-5 text-primary" />}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{option.note}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-7 text-sm font-semibold">How much time do you want today?</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    [5, "Quick", "Idea · decision · reflection"],
                    [10, "Standard", "Guided lesson and practice"],
                    [initial.minutes >= 20 ? 20 : 15, "Deep", "All activities and sources"],
                  ].map(([value, label, note]) => (
                    <button key={String(value)} type="button" onClick={() => setMinutes(Number(value))} aria-pressed={minutes === value} className={`rounded-2xl border p-4 text-left transition ${minutes === value ? "border-primary bg-primary/10 ring-2 ring-primary/15" : "bg-background hover:border-primary/45"}`}>
                      <Clock3 className={`size-5 ${minutes === value ? "text-primary" : "text-muted-foreground"}`} />
                      <strong className="mt-3 block">{label} · {value} min</strong>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{note}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-accent/70 p-4 text-sm leading-6 text-accent-foreground"><strong>The estimate is a promise.</strong> A five-minute choice opens a five-minute path. You can always go deeper later.</div>
                <p className="mt-4 text-sm text-muted-foreground">Name, reminders, and more preferences are optional in You.</p>
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="mt-3"><ArrowLeft /> Back</Button>
                <Button onClick={finish} disabled={!canContinue} size="lg" className="mt-7 h-12 w-full rounded-xl px-8 text-base">{minutes ? `Start my ${minutes}-minute path` : "Choose your style and time"} <ArrowRight /></Button>
              </div>
            )}

            {step > 0 && step < totalSteps && (
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>
                  <ArrowLeft /> Back
                </Button>
                <Button disabled={!canContinue} onClick={() => setStep((current) => current + 1)} className="rounded-xl px-6">
                  Continue <ArrowRight />
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <span className="brand-mark grid size-11 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
        <Flower2 className="size-5" />
      </span>
      <div className="sr-only sm:not-sr-only"><strong className="block text-[1.02rem] leading-tight tracking-tight">Dharma Quest</strong><span className="text-xs text-sidebar-foreground/55">Wisdom for daily life</span></div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: string | number }) {
  const numeric = typeof value === "number" ? value : Number.NaN;
  const previous = useRef(Number.isFinite(numeric) ? numeric : 0);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!Number.isFinite(numeric)) {
      setDisplay(value);
      return;
    }
    const from = previous.current;
    previous.current = numeric;
    if (document.documentElement.dataset.motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || from === numeric) {
      setDisplay(numeric);
      return;
    }
    let frame = 0;
    let started = 0;
    const tick = (time: number) => {
      if (!started) started = time;
      const progress = Math.min(1, (time - started) / 520);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (numeric - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric, value]);

  return <>{display}</>;
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string | number }) {
  return (
    <div className="stat-pill flex items-center gap-2 rounded-full border bg-card px-3.5 py-2">
      <Icon className="size-4 text-amber-500" />
      <span className="hidden text-xs text-muted-foreground sm:inline">{label}</span>
      <strong className="text-sm tabular-nums"><AnimatedNumber value={value} /></strong>
    </div>
  );
}

function Pronunciation({ term }: { term: string }) {
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    setAvailable("speechSynthesis" in window);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);
  if (!available) return <p className="mt-3 text-xs text-muted-foreground">Pronunciation audio is unavailable in this browser.</p>;
  const speak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term.split(" · ")[0]);
    utterance.lang = "hi-IN";
    utterance.rate = .75;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); toast.info("This device could not play the pronunciation."); };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  return <div className="mt-3"><Button type="button" size="sm" variant="ghost" onClick={speaking ? () => { window.speechSynthesis.cancel(); setSpeaking(false); } : speak} className="rounded-xl"><Volume2 /> {speaking ? "Stop pronunciation" : "Hear the Sanskrit term"}</Button><p className="mt-1 text-xs text-muted-foreground">Device voice approximation; pronunciation varies by region.</p></div>;
}

function MatchingPaths({ pairs, selected, matched, onSelect, onMeaning }: { pairs: Array<{term: string; meaning: string}>; selected: number | null; matched: number[]; onSelect: (index: number) => void; onMeaning: (index: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Record<number, string>>({});
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      const next: Record<number, string> = {};
      pairs.forEach((_, index) => {
        const term = element.querySelector(`[data-term="${index}"]`)?.getBoundingClientRect();
        const meaning = element.querySelector(`[data-meaning="${index}"]`)?.getBoundingClientRect();
        if (!term || !meaning) return;
        const x1 = term.right - bounds.left;
        const y1 = term.top + term.height / 2 - bounds.top;
        const x2 = meaning.left - bounds.left;
        const y2 = meaning.top + meaning.height / 2 - bounds.top;
        const middle = (x1 + x2) / 2;
        next[index] = `M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}`;
      });
      setPaths(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [pairs]);
  return <div ref={container} className="matching-grid relative mt-6 grid grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] gap-8">
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">{matched.map((index) => <path key={index} className="match-path" d={paths[index]} pathLength="1" fill="none" stroke="var(--primary)" strokeWidth="2" />)}</svg>
    <div className="space-y-3">{pairs.map((pair, index) => <button key={pair.term} data-term={index} type="button" disabled={matched.includes(index)} aria-pressed={selected === index} aria-label={`${pair.term}${matched.includes(index) ? `, matched to ${pair.meaning}` : ", select term"}`} onClick={() => onSelect(index)} className={`relative min-h-16 w-full rounded-2xl border p-3 text-left text-sm font-bold transition ${matched.includes(index) ? "border-emerald-500 bg-emerald-500/10" : selected === index ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/40"}`}>{matched.includes(index) && <Check className="mr-1 inline size-4" />}{pair.term}</button>)}</div>
    <div className="space-y-3">{pairs.map((_, reverseIndex) => pairs.length - 1 - reverseIndex).map((index) => <button key={pairs[index].meaning} data-meaning={index} type="button" disabled={matched.includes(index) || selected === null} aria-label={`${pairs[index].meaning}${matched.includes(index) ? `, matched to ${pairs[index].term}` : selected !== null ? `, choose for ${pairs[selected].term}` : ""}`} onClick={() => onMeaning(index)} className={`relative min-h-16 w-full rounded-2xl border p-3 text-left text-sm leading-5 transition ${matched.includes(index) ? "border-emerald-500 bg-emerald-500/10" : "bg-background hover:border-primary/40 disabled:opacity-60"}`}>{matched.includes(index) && <Check className="mr-1 inline size-4" />}{pairs[index].meaning}</button>)}</div>
  </div>;
}

function AppShell({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const [view, setViewState] = useState<View>("home");
  const setView = (nextView: View) => {
    setViewState(nextView);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const openLesson = (lesson: Lesson) => {
    const source = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const reduced = state.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !document.startViewTransition || !source) return setSelectedLesson(lesson);
    source.style.viewTransitionName = "lesson-opening";
    const transition = document.startViewTransition(() => {
      source.style.viewTransitionName = "";
      flushSync(() => setSelectedLesson(lesson));
    });
    void Promise.allSettled([transition.ready, transition.finished, transition.updateCallbackDone]).finally(() => { source.style.viewTransitionName = ""; });
  };

  return (
    <div className="app-shell dharma-cosmos min-h-screen">
      <aside className="app-rail fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
        <AppLogo />
        <nav className="mt-10 space-y-1" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-current={view === id ? "page" : undefined}
              className={`rail-link flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${view === id ? "is-active bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/66 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`}
            >
              <Icon className={`size-5 ${view === id ? "text-sidebar-primary" : ""}`} /> {label}
            </button>
          ))}
        </nav>
        <div className="garden-card mt-auto rounded-3xl border border-sidebar-border bg-sidebar-accent/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Sprout className="size-4 text-sidebar-primary" /> Inner garden</div>
          <p className="mt-2 text-xs leading-5 text-sidebar-foreground/65">{state.completedLessons.length === lessons.length ? "Your garden is flourishing. Keep the ideas alive in practice." : `${3 - (state.completedLessons.length % 3)} more lesson${3 - (state.completedLessons.length % 3) === 1 ? "" : "s"} to grow your next lotus.`}</p>
          <Progress value={state.completedLessons.length === lessons.length ? 100 : (state.completedLessons.length % 3) * (100 / 3)} aria-label="Progress to next learning milestone" className="mt-3 bg-sidebar-border [&_[data-slot=progress-indicator]]:bg-sidebar-primary" />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="app-topbar sticky top-0 z-20 border-b bg-background/86 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="lg:hidden"><AppLogo /></div>
            <div className="hidden lg:block"><p className="text-sm text-muted-foreground">Your {state.minutes}-minute path</p></div>
            <div className="flex items-center gap-2">
              <ThemeControl appearance={state.appearance} onChange={(appearance) => setState((current) => ({ ...current, appearance }))} />
              <StatPill icon={Flame} label="streak" value={state.streak} />
              <StatPill icon={Sparkles} label="wisdom" value={state.wisdom} />
            </div>
          </div>
        </header>

        <main className="app-main mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
          {view === "home" && <HomeView state={state} setState={setState} openLesson={openLesson} setView={setView} />}
          {view === "learn" && <LearnView state={state} openLesson={openLesson} setView={setView} />}
          {view === "practice" && <PracticeView state={state} setState={setState} />}
          {view === "jyotisha" && <AstrologyView state={state} setState={setState} />}
          {view === "profile" && <ProfileView state={state} setState={setState} setView={setView} />}
        </main>
      </div>

      <nav className="mobile-dock fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-card/95 px-1 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-current={view === id ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.72rem] font-semibold ${view === id ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon className="size-5" /> {label}
          </button>
        ))}
      </nav>

      <LessonDialog
        lesson={selectedLesson}
        open={Boolean(selectedLesson)}
        onOpenChange={(open) => !open && setSelectedLesson(null)}
        state={state}
        setState={setState}
      />
    </div>
  );
}

function HomeView({
  state,
  setState,
  openLesson,
  setView,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  openLesson: (lesson: Lesson) => void;
  setView: (view: View) => void;
}) {
  const nextLesson = lessons.find((lesson) => !state.completedLessons.includes(lesson.id)) ?? lessons[0];
  const nextGita = lessonExpansions[nextLesson.id].gita;
  const path = pathLabel(state.minutes);
  const progress = Math.round((state.completedLessons.length / lessons.length) * 100);
  const completedToday = state.lastActive === dayKey();
  const weekStart = new Date();
  weekStart.setHours(12, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekKeys = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + offset);
    return dayKey(date);
  });
  const weeklyDays = weekKeys.filter((key) => state.activeDays.includes(key)).length;
  const weeklyGoal = Math.min(100, Math.round((weeklyDays / 5) * 100));

  return (
    <div className="page-view">
      <div className="page-intro flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker text-sm font-semibold text-primary">{completedToday ? "Your rhythm is alive" : "Today’s path"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Namaste, {state.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Learn one idea, test it in a real decision, then carry it into your day.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Settings2 className="size-4" /> Learning lens: {backgroundLabels[state.background]}</div>
      </div>

      <section className="daily-quest dharma-card mt-7 overflow-hidden rounded-[2rem] border bg-card">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-300"><Star className="size-4 fill-current" /> Recommended daily quest</div>
            <p className="mt-5 text-sm text-muted-foreground">{nextLesson.sanskrit}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{nextLesson.title}</h2>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{nextLesson.summary}</p>
            <div className="mt-5" aria-label="Daily path length">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Choose today’s path</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 10, state.minutes >= 20 ? 20 : 15].map((minutes) => {
                  const option = pathLabel(minutes);
                  const active = path.minutes === option.minutes;
                  return <button key={minutes} type="button" onClick={() => setState((current) => ({ ...current, minutes }))} aria-pressed={active} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/45"}`}>{option.name} · {option.minutes} min</button>;
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{path.detail}. Change your default under You.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {path.minutes} minutes</span>
              <span className="flex items-center gap-1.5"><Sparkles className="size-4" /> {state.completedLessons.includes(nextLesson.id) ? REVIEW_REWARD : LESSON_REWARD} wisdom</span>
              <span className="flex items-center gap-1.5"><Target className="size-4" /> Includes a life quest</span>
            </div>
            <Button onClick={() => openLesson(nextLesson)} size="lg" className="mt-7 h-12 rounded-xl px-6 text-base">
              <Play className="fill-current" /> Start {path.name.toLowerCase()} path · about {path.minutes} min
            </Button>
          </div>
          <div className="quest-visual relative min-h-72 overflow-hidden border-t p-7 text-white lg:border-l lg:border-t-0">
            <div className="quest-orbit quest-orbit-one" aria-hidden="true" />
            <div className="quest-orbit quest-orbit-two" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">From the Gita</span><BookOpen className="size-6 text-amber-300" /></div>
              <div className="my-7">
                <p className="text-xl font-semibold leading-8 text-white">{nextGita.paraphrase}</p>
                <p className="mt-3 text-sm text-amber-200">{nextGita.reference} · plain-language paraphrase</p>
              </div>
              <div><div className="flex justify-between text-sm"><span>{state.completedLessons.length} of {lessons.length} lessons</span><strong>{progress}%</strong></div><Progress value={progress} className="mt-2 bg-white/15 [&_[data-slot=progress-indicator]]:bg-amber-400" /></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <section className="surface-card rounded-3xl border bg-card p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Live it today</p><h2 className="mt-1 text-xl font-bold">Your off-screen practice</h2></div><span className="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><Footprints className="size-5" /></span></div>
          <p className="mt-5 rounded-2xl bg-secondary/70 p-4 leading-7">{nextLesson.practice}</p>
          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" /> Practices are optional and adaptable. Choose rest, seated movement, or reflection whenever that better serves you.</p>
        </section>
        <section className="surface-card rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-amber-500/12 text-amber-600 dark:text-amber-300"><Trophy className="size-5" /></span><div><p className="text-sm text-muted-foreground">Weekly rhythm</p><h2 className="text-xl font-bold">{weeklyDays} of 5 practice days</h2></div></div>
          <div className="mt-4"><div className="flex justify-between text-xs text-muted-foreground"><span>Weekly goal</span><strong>{weeklyGoal}%</strong></div><Progress value={weeklyGoal} className="mt-2" /></div>
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {weekKeys.map((key, index) => {
              const active = state.activeDays.includes(key);
              return <div key={key} className="text-center text-xs text-muted-foreground"><span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span><span aria-label={active ? "Practice completed" : "No practice recorded"} className={`mx-auto mt-2 grid size-8 place-items-center rounded-full ${active ? "bg-amber-500 text-white" : "bg-muted"}`}>{active ? <Check className="size-4" /> : ""}</span></div>;
            })}
          </div>
          <Button variant="outline" onClick={() => setView("practice")} className="mt-5 w-full rounded-xl">Open quick practice <ChevronRight /></Button>
        </section>
      </div>
    </div>
  );
}

function LearnView({ state, openLesson, setView }: { state: AppState; openLesson: (lesson: Lesson) => void; setView: (view: View) => void }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const grouped = lessons.reduce<Record<string, Lesson[]>>((all, lesson) => {
    (all[lesson.unit] ??= []).push(lesson);
    return all;
  }, {});
  const recommendedId = lessons.find((lesson) => !state.completedLessons.includes(lesson.id))?.id;
  const totalMinutes = lessons.reduce((total, lesson) => total + lesson.duration, 0);
  return (
    <div className="page-view">
      <p className="section-kicker text-sm font-semibold text-primary">Learning journey</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Build wisdom one step at a time</h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">Lessons begin with recognition, then move into judgment, action, and reflection.</p>

      <section className="mt-7 grid gap-4 rounded-[2rem] border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div><p className="text-sm font-semibold text-primary">Course overview</p><h2 className="mt-1 text-xl font-bold">{lessons.length} lessons across {Object.keys(grouped).length} units</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">About {Math.round(totalMinutes / 60)} hours in standard mode. Follow the recommended sequence or preview any topic before it unlocks.</p></div>
        <Button type="button" variant="outline" onClick={() => setSourcesOpen(true)} className="rounded-xl"><BookOpen /> Sources & traditions</Button>
      </section>

      <div className="mt-8 space-y-10">
        {Object.entries(grouped).map(([unit, unitLessons], unitIndex) => (
          <section key={unit} className="journey-unit rounded-[2rem] border bg-card/65 p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="unit-number grid size-10 place-items-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">{unitIndex + 1}</span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Unit {unitIndex + 1}</p><h2 className="text-xl font-bold">{unit}</h2></div></div>
            <div className="mx-auto max-w-2xl space-y-8">
              {unitLessons.map((lesson, index) => {
                const complete = state.completedLessons.includes(lesson.id);
                const lessonIndex = lessons.findIndex((item) => item.id === lesson.id);
                const priorIndex = lessonIndex - 1;
                const locked = priorIndex >= 0 && !state.completedLessons.includes(lessons[priorIndex].id);
                const prerequisite = locked ? lessons[priorIndex] : null;
                return (
                  <div key={lesson.id} className={`lesson-node relative flex ${complete ? "is-complete" : ""} ${recommendedId === lesson.id ? "is-next" : ""} ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <button
                      type="button"
                      aria-label={`${lesson.title}, ${locked ? `Preview. Full lesson unlocks after ${prerequisite?.title}` : complete ? "completed, review" : "recommended next"}`}
                      onClick={() => locked ? setPreviewLesson(lesson) : openLesson(lesson)}
                      className={`lesson-path-card group flex w-full max-w-md items-center gap-4 rounded-3xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/35 ${locked ? "opacity-75" : ""}`}
                    >
                      <span className={`grid size-14 shrink-0 place-items-center rounded-2xl shadow-lg ${locked ? "bg-muted text-muted-foreground shadow-none" : complete ? "bg-emerald-600 text-white shadow-emerald-600/15" : colorClasses[lesson.color]}`}>
                        {locked ? <Lock className="size-5" /> : complete ? <Check className="size-6" /> : <BookOpen className="size-6" />}
                      </span>
                      <span className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{lesson.sanskrit}</span><strong className="mt-1 block text-lg">{lesson.title}</strong><span className="mt-1 block text-sm leading-5 text-muted-foreground">{lesson.summary}</span><span className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> {pathLabel(state.minutes).minutes} min · {pathLabel(state.minutes).name}</span>{complete && <span className="text-emerald-600 dark:text-emerald-300">Completed</span>}{recommendedId === lesson.id && !complete && <span className="text-primary">Recommended next</span>}{locked && <span>Preview · unlocks after {prerequisite?.title}</span>}</span></span>
                      <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <section className="mt-8 overflow-hidden rounded-[2rem] border bg-card">
        <div className="grid gap-5 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className="grid size-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-200"><Orbit className="size-7" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Optional cultural exploration</p><h2 className="mt-1 text-xl font-bold">Explore Jyotisha</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Learn how this traditional interpretive practice relates to some Hindu communities—and why it is not a definition of Hinduism or a scientifically validated prediction method.</p></div><Button type="button" variant="outline" onClick={() => setView("jyotisha")} className="rounded-xl">Explore optionally <ChevronRight /></Button></div>
      </section>

      <Dialog open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.75rem] sm:max-w-3xl">
          <DialogHeader><DialogTitle>Sources and traditions</DialogTitle><DialogDescription>Each lesson identifies its source lens and where interpretation varies. Dharma Quest uses original summaries rather than silently presenting paraphrases as translations.</DialogDescription></DialogHeader>
          <div className="mt-3 space-y-3">{lessons.map((lesson) => { const source = lessonSources[lesson.id]; return <details key={lesson.id} className="rounded-2xl border bg-card p-4"><summary className="cursor-pointer font-semibold">{lesson.title} <span className="ml-2 text-sm font-normal text-muted-foreground">{lesson.sanskrit}</span></summary><dl className="mt-4 grid gap-3 text-sm"><Detail label="Primary source lens" value={source.primary} /><Detail label="Wording" value={source.form} /><Detail label="Edition and translation status" value={source.edition} /><Detail label="Tradition" value={source.tradition} /><Detail label="Where views differ" value={source.note} /></dl></details>; })}</div>
          <p className="mt-4 rounded-2xl bg-accent/70 p-4 text-sm leading-6 text-accent-foreground"><strong>Review status:</strong> This is an educational editorial synthesis. Independent credentialed scholar review is still pending; use the references to continue with qualified teachers and complete translations.</p>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(previewLesson)} onOpenChange={(open) => { if (!open) setPreviewLesson(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.75rem] sm:max-w-xl"><DialogHeader><DialogTitle>{previewLesson?.title}</DialogTitle><DialogDescription>Topic preview · explore without changing course progress.</DialogDescription></DialogHeader>{previewLesson && <><p className="text-sm font-semibold text-primary">{previewLesson.sanskrit}</p><p className="leading-7">{previewLesson.teaching[0]}</p><p className="rounded-2xl bg-secondary p-4 text-sm leading-6">{previewLesson.summary}</p><p className="text-sm leading-6 text-muted-foreground">Full lesson unlocks after “{lessons[lessons.findIndex((item) => item.id === previewLesson.id) - 1]?.title}”.</p><details className="rounded-2xl border p-4"><summary className="cursor-pointer text-sm font-semibold">Source and tradition</summary><p className="mt-3 text-sm leading-6">{lessonSources[previewLesson.id].primary}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{lessonSources[previewLesson.id].tradition}</p></details><Button type="button" onClick={() => setPreviewLesson(null)} className="rounded-xl">Back to learning path</Button></>}</DialogContent></Dialog>
    </div>
  );
}

function LessonDialog({
  lesson,
  open,
  onOpenChange,
  state,
  setState,
}: {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const [forceDeep, setForceDeep] = useState(false);
  const pathStages = forceDeep
    ? [0, 1, 2, 3, 4, 5, 6]
    : state.minutes <= 5
      ? [1, 3, 6]
      : state.minutes <= 10
        ? [0, 1, 2, 3, 4, 6]
        : [0, 1, 2, 3, 4, 5, 6];
  const [stage, setStage] = useState(pathStages[0]);
  const [warmupAnswer, setWarmupAnswer] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [matchMessage, setMatchMessage] = useState("");
  const [mythAnswer, setMythAnswer] = useState<boolean | null>(null);
  const [mythSubmitted, setMythSubmitted] = useState(false);
  const [challengeSelection, setChallengeSelection] = useState<number[]>([]);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [commitment, setCommitment] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);
  const claimedThisRun = useRef(false);

  const resetLesson = (firstStage = pathStages[0]) => {
    setStage(firstStage);
    setWarmupAnswer(null);
    setAnswer(null);
    setAnswerSubmitted(false);
    setSelectedTerm(null);
    setMatchedPairs([]);
    setMatchMessage("");
    setMythAnswer(null);
    setMythSubmitted(false);
    setChallengeSelection([]);
    setChallengeSubmitted(false);
    setCommitment(null);
    setScore(0);
    setFinished(false);
    setEarnedReward(0);
    claimedThisRun.current = false;
  };

  useEffect(() => {
    if (open) {
      setForceDeep(false);
      resetLesson(state.minutes <= 5 ? 1 : 0);
    }
    // Reset only when a lesson is opened or replaced.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson?.id, state.minutes]);

  if (!lesson) return null;
  const expansion = lessonExpansions[lesson.id];
  if (!expansion) return null;
  const totalStages = pathStages.length;
  const stagePosition = pathStages.indexOf(stage);
  const answered = answer !== null;
  const correct = answer === lesson.correct;
  const alreadyComplete = state.completedLessons.includes(lesson.id);
  const completionReward = alreadyComplete ? REVIEW_REWARD : LESSON_REWARD;
  const verseSaved = state.savedVerses.includes(expansion.gita.reference);
  const challenge = expansion.challenge;
  const orderCorrect =
    challenge.type === "order" &&
    challengeSelection.length === challenge.items.length &&
    challengeSelection.every((item, index) => item === index);
  const selectCorrect =
    challenge.type === "select" &&
    challengeSelection.length === challenge.correct.length &&
    [...challengeSelection].sort().every((item, index) => item === [...challenge.correct].sort()[index]);
  const challengeCorrect = orderCorrect || selectCorrect;

  const stageLabels = ["Begin", "Discover", "Connect", "Choose", "Myth check", "Build", "Live it"];

  const canContinue =
    stage === 0
      ? warmupAnswer !== null
      : stage === 2
        ? matchedPairs.length === expansion.matchPairs.length
        : stage === 3
          ? answerSubmitted
          : stage === 4
            ? mythSubmitted
            : stage === 5
              ? challengeSubmitted
              : true;

  const chooseAnswer = (index: number) => {
    if (answerSubmitted) return;
    setAnswer((current) => current === index ? null : index);
  };

  const checkAnswer = () => {
    if (answer === null || answerSubmitted) return;
    if (answer === lesson.correct) setScore((current) => Math.min(4, current + 1));
    setAnswerSubmitted(true);
  };

  const retryAnswer = () => {
    setAnswer(null);
    setAnswerSubmitted(false);
  };

  const chooseMythAnswer = (value: boolean) => {
    if (mythSubmitted) return;
    setMythAnswer((current) => current === value ? null : value);
  };

  const toggleVerse = () => {
    setState((current) => ({
      ...current,
      savedVerses: current.savedVerses.includes(expansion.gita.reference)
        ? current.savedVerses.filter((reference) => reference !== expansion.gita.reference)
        : [...current.savedVerses, expansion.gita.reference],
    }));
    toast.success(verseSaved ? "Removed from saved teachings" : "Saved to your practice hub");
  };

  const checkMythAnswer = () => {
    if (mythAnswer === null || mythSubmitted) return;
    if (mythAnswer === expansion.myth.correct) setScore((current) => Math.min(4, current + 1));
    setMythSubmitted(true);
  };

  const retryMythAnswer = () => {
    setMythAnswer(null);
    setMythSubmitted(false);
  };

  const chooseMeaning = (index: number) => {
    if (selectedTerm === null || matchedPairs.includes(index)) return;
    if (selectedTerm === index) {
      const next = [...matchedPairs, index];
      setMatchedPairs(next);
      setSelectedTerm(null);
      setMatchMessage(next.length === expansion.matchPairs.length ? "All connected—beautiful work." : "That connection is right.");
      if (next.length === expansion.matchPairs.length) setScore((current) => Math.min(4, current + 1));
    } else {
      setMatchMessage("Not that one—compare the meanings and try again.");
    }
  };

  const toggleChallengeItem = (index: number) => {
    if (challengeSubmitted) return;
    if (challenge.type === "order") {
      if (!challengeSelection.includes(index)) setChallengeSelection((current) => [...current, index]);
      return;
    }
    setChallengeSelection((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  const checkChallenge = () => {
    if (challengeSubmitted) return;
    const isCorrect =
      challenge.type === "order"
        ? challengeSelection.length === challenge.items.length && challengeSelection.every((item, index) => item === index)
        : challengeSelection.length === challenge.correct.length &&
          [...challengeSelection].sort().every((item, index) => item === [...challenge.correct].sort()[index]);
    if (isCorrect) setScore((current) => Math.min(4, current + 1));
    setChallengeSubmitted(true);
  };

  const retryChallenge = () => {
    setChallengeSelection([]);
    setChallengeSubmitted(false);
  };

  const completeLesson = () => {
    if (claimedThisRun.current) return;
    claimedThisRun.current = true;
    setEarnedReward(completionReward);
    setState((current) => {
      const firstCompletion = !current.completedLessons.includes(lesson.id);
      return {
        ...current,
        ...activityUpdate(current),
        wisdom: current.wisdom + (firstCompletion ? LESSON_REWARD : REVIEW_REWARD),
        completedLessons: firstCompletion ? [...current.completedLessons, lesson.id] : current.completedLessons,
      };
    });
    setFinished(true);
    toast.success(`${alreadyComplete ? "Review" : "Lesson"} complete · +${completionReward} wisdom`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} style={{ viewTransitionName: "lesson-opening" }} className="lesson-dialog-shell max-h-[92vh] overflow-y-auto rounded-[1.75rem] p-0 sm:max-w-3xl">
        {finished ? (
          <div className="lesson-finish relative grid min-h-[34rem] place-items-center overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 p-8 text-center text-white">
            <span className="lesson-finish-ring lesson-finish-ring-one" aria-hidden="true" />
            <span className="lesson-finish-ring lesson-finish-ring-two" aria-hidden="true" />
            <div className="relative z-10">
              <div className="relative mx-auto size-32"><svg className="completion-ring absolute inset-0 size-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="59" fill="none" stroke="rgb(255 255 255 / 15%)" strokeWidth="3" /><circle className="completion-ring-stroke" cx="64" cy="64" r="59" fill="none" stroke="#fbbf24" strokeWidth="3" pathLength="1" /></svg><span className="lesson-finish-icon lesson-bloom absolute inset-2 grid place-items-center rounded-full bg-amber-400 text-amber-950 shadow-2xl shadow-amber-300/30"><Trophy className="size-12" /></span></div>
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-amber-300">Lesson complete</p>
              <DialogTitle className="completion-concept mt-3 text-4xl font-black tracking-tight">{lesson.title}</DialogTitle>
              <DialogDescription className="sr-only">Your lesson progress and reward have been saved. Review your learning and the next recommended action.</DialogDescription>
              <p className="wisdom-reward mx-auto mt-4 w-fit rounded-full bg-amber-400 px-5 py-2 font-black text-amber-950">+{earnedReward} wisdom</p>
              <div className="completion-summary mx-auto mt-7 grid max-w-xl gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl bg-white/8 p-4"><span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">What you learned</span><p className="mt-2 text-sm leading-6 text-violet-50">{lesson.teaching[0]}</p></div><div className="rounded-2xl bg-white/8 p-4"><span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">What you practiced</span><p className="mt-2 text-sm leading-6 text-violet-50">Thoughtful action in a real decision.</p></div><div className="rounded-2xl bg-white/8 p-4"><span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Try today</span><p className="mt-2 text-sm leading-6 text-violet-50">{lesson.practice}</p></div></div>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button type="button" onClick={() => onOpenChange(false)} className="rounded-xl bg-white text-slate-950 hover:bg-white/90">Back to today <ArrowRight /></Button>{!forceDeep && state.minutes <= 10 && <Button type="button" variant="outline" onClick={() => { setForceDeep(true); resetLesson(0); }} className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">Go deeper with full activities</Button>}</div>
              <p className="completion-next mt-5 text-sm text-violet-100">{lessons.find((item) => !state.completedLessons.includes(item.id)) ? `Recommended next: ${lessons.find((item) => !state.completedLessons.includes(item.id))?.title}` : "All lessons explored. Return to Practice to keep the ideas alive."}</p>
            </div>
          </div>
        ) : (
          <>
        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="absolute right-4 top-4 z-20 rounded-xl">Exit</Button>
        <div className="lesson-topbar border-b p-6 sm:p-8">
          <DialogHeader>
            <div className="mb-3 flex items-center justify-between gap-3 pr-8"><span className="text-sm font-semibold text-primary">{lesson.sanskrit}</span><span className="text-xs text-muted-foreground">{stageLabels[stage]} · {stagePosition + 1} of {totalStages}</span></div>
            <Progress value={((stagePosition + 1) / totalStages) * 100} aria-label={`Lesson step ${stagePosition + 1} of ${totalStages}`} className="mb-3 lesson-progress" />
            <DialogTitle className="text-2xl font-bold tracking-tight">{lesson.title}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center justify-between gap-2 text-sm leading-6"><span>Your learning lens: {backgroundLabels[state.background]?.toLowerCase() ?? "curiosity"}.</span><span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-300"><Star className="size-4 fill-current" /> {score}/{pathStages.filter((item) => item >= 2 && item <= 5).length} discoveries</span></DialogDescription>
            <Button type="button" variant="ghost" size="sm" onClick={() => resetLesson()} className="mt-2 w-fit rounded-xl"><RotateCcw /> Reset lesson</Button>
          </DialogHeader>
        </div>

        <div key={stage} className="lesson-stage p-6 sm:p-8">
          {stage === 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Step into the story</p>
              <h3 className="mt-3 text-2xl font-bold">{expansion.hook.title}</h3>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">{expansion.hook.body}</p>
              <p className="mt-6 font-semibold">What is your first instinct?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {expansion.hook.choices.map((choice, index) => (
                  <button key={choice} type="button" onClick={() => setWarmupAnswer((current) => current === index ? null : index)} aria-pressed={warmupAnswer === index} className={`rounded-2xl border p-4 text-left font-semibold transition ${warmupAnswer === index ? "border-primary bg-primary/10 text-primary" : "bg-background hover:border-primary/40"}`}><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-muted-foreground">Choice {index + 1}</span>{choice}</button>
                ))}
              </div>
              {warmupAnswer !== null && <p className="mt-4 rounded-2xl bg-secondary/70 p-4 text-sm leading-6">There is no score here. Hold onto your instinct—we’ll give it a wiser framework.</p>}
            </div>
          )}

          {stage === 1 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Discover the idea</p>
              <Pronunciation term={lesson.sanskrit} />
              <figure className="idea-metaphor mt-5 rounded-2xl border bg-secondary/45 p-4"><div className="flex items-center gap-2 text-center text-xs font-semibold"><span className="flex-1 rounded-xl bg-card p-3"><Search className="mx-auto mb-2 size-5 text-primary" /> Notice the situation</span><ArrowRight className="size-4 shrink-0 text-primary" /><span className="flex-1 rounded-xl bg-card p-3"><Compass className="mx-auto mb-2 size-5 text-primary" /> Consider with care</span><ArrowRight className="size-4 shrink-0 text-primary" /><span className="flex-1 rounded-xl bg-card p-3"><Footprints className="mx-auto mb-2 size-5 text-primary" /> Take one step</span></div><figcaption className="mt-3 text-xs leading-5 text-muted-foreground">A learning metaphor: an idea becomes useful through attention, discernment, and action.</figcaption></figure>
              <div className="mt-4 space-y-4">
                {lesson.teaching.map((paragraph, index) => (
                  <div key={paragraph} className="teaching-reveal flex gap-3" style={{ animationDelay: `${index * 90}ms` }}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{index + 1}</span><p className="leading-7">{paragraph}</p></div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 leading-7"><div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200"><Sparkles className="size-5" /> Why it matters</div><p className="mt-2 text-sm">{expansion.insight}</p></div>
              <div className="mt-4 rounded-2xl bg-secondary/55 p-4"><p className="text-sm font-semibold text-primary">{(learningFocus[state.learningStyle] ?? learningFocus.mixed).label}</p><p className="mt-2 text-sm leading-6">{(learningFocus[state.learningStyle] ?? learningFocus.mixed).question}</p></div>
              {lesson.id === "gita-context" && <ol aria-label="The Gita’s narrative setting" className="mt-5 grid gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-3"><li><strong className="text-primary">1 · Mahabharata</strong><p className="mt-1 text-muted-foreground">The larger epic story.</p></li><li><strong className="text-primary">2 · Arjuna’s crisis</strong><p className="mt-1 text-muted-foreground">A difficult decision on the battlefield.</p></li><li><strong className="text-primary">3 · The dialogue</strong><p className="mt-1 text-muted-foreground">Krishna and Arjuna explore action and wisdom.</p></li></ol>}
              <aside className="gita-bridge mt-5 overflow-hidden rounded-3xl border p-5 sm:p-6">
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><BookOpen className="size-4" /> Gita connection</span>
                    <div className="flex items-center gap-2"><span className="rounded-full border bg-card/70 px-3 py-1 text-xs font-semibold">{expansion.gita.reference}</span><Button type="button" size="sm" variant="outline" onClick={toggleVerse} aria-pressed={verseSaved} className="h-8 rounded-full bg-card/70 px-3"><Bookmark className={verseSaved ? "fill-current" : ""} /> {verseSaved ? "Saved" : "Save"}</Button></div>
                  </div>
                  <h4 className="mt-5 text-xl font-bold">{expansion.gita.theme}</h4>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{expansion.gita.paraphrase}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-card/65 p-4 text-sm leading-6"><strong className="block text-xs uppercase tracking-[0.12em] text-primary">In context</strong> This verse supports the lesson’s focus on {expansion.gita.theme.toLowerCase()} within Krishna and Arjuna’s larger conversation about wise action.</div><div className="rounded-2xl bg-card/65 p-4 text-sm leading-6"><strong className="block text-xs uppercase tracking-[0.12em] text-primary">Reflect</strong> Where could this teaching change one choice you make today?</div></div>
                  <p className="mt-4 text-xs font-medium text-muted-foreground">Plain-language interpretive paraphrase · translations and philosophical interpretations vary across traditions</p>
                </div>
              </aside>
              <details className="mt-5 rounded-2xl border bg-muted/30 p-4">
                <summary className="cursor-pointer font-semibold">Sources, wording, and tradition</summary>
                <dl className="mt-4 grid gap-3 text-sm"><Detail label="Primary source lens" value={lessonSources[lesson.id].primary} /><Detail label="Wording" value={lessonSources[lesson.id].form} /><Detail label="Edition and translation status" value={lessonSources[lesson.id].edition} /><Detail label="Tradition" value={lessonSources[lesson.id].tradition} /><Detail label="Where views differ" value={lessonSources[lesson.id].note} /></dl>
              </details>
            </div>
          )}

          {stage === 2 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Make the connections</p>
              <h3 className="mt-3 text-xl font-bold">Match each idea to its meaning</h3>
              <p className="mt-2 text-sm text-muted-foreground">Tap a term, then tap the meaning that belongs with it.</p>
              <MatchingPaths pairs={expansion.matchPairs} selected={selectedTerm} matched={matchedPairs} onSelect={(index) => { setSelectedTerm((current) => current === index ? null : index); setMatchMessage(""); }} onMeaning={chooseMeaning} />
              {matchedPairs.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => { setMatchedPairs([]); setSelectedTerm(null); setMatchMessage(""); }} className="mt-3 rounded-xl"><RotateCcw /> Reset matches</Button>
              )}
              {matchMessage && <p role="status" className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${matchMessage.startsWith("Not") ? "bg-amber-500/10 text-amber-900 dark:text-amber-100" : "bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"}`}>{matchMessage}</p>}
            </div>
          )}

          {stage === 3 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Choose wisely</p>
              <div className="mt-4 rounded-2xl bg-secondary/70 p-5 leading-7"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Situation</span>{lesson.scenario}</div>
              <h3 className="mt-6 text-lg font-bold">{lesson.question}</h3>
              <div className="mt-4 space-y-3">
                {lesson.answers.map((option, index) => {
                  const selected = answer === index;
                  const isCorrect = answerSubmitted && index === lesson.correct;
                  const isWrong = answerSubmitted && selected && !correct;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={answerSubmitted}
                      onClick={() => chooseAnswer(index)}
                      aria-pressed={selected}
                      className={`answer-tile flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${isCorrect ? "is-right border-emerald-500 bg-emerald-500/10" : isWrong ? "is-wrong border-destructive bg-destructive/10" : selected ? "is-selected border-primary bg-primary/10" : "bg-background hover:border-primary/40"}`}
                    >
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${isCorrect ? "bg-emerald-600 text-white" : isWrong ? "bg-destructive text-white" : "bg-muted"}`}>{isCorrect ? <Check className="size-4" /> : String.fromCharCode(65 + index)}</span>{option}
                    </button>
                  );
                })}
              </div>
              {!answerSubmitted && <Button type="button" onClick={checkAnswer} disabled={!answered} className="mt-5 w-full rounded-xl"><Check /> Check answer</Button>}
              {answerSubmitted && (
                <div role="status" className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${correct ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-100" : "bg-amber-500/10 text-amber-950 dark:text-amber-100"}`}>
                  <strong>{correct ? "Exactly." : "Good attempt—look at the intention."}</strong> {lesson.explanation}
                  {!correct && <Button type="button" variant="outline" onClick={retryAnswer} className="mt-4 w-full rounded-xl bg-background/70"><RotateCcw /> Try again</Button>}
                </div>
              )}
            </div>
          )}

          {stage === 4 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Myth or wisdom?</p>
              <div className="mt-5 rounded-3xl bg-gradient-to-br from-indigo-950 to-violet-950 p-6 text-center text-white shadow-xl">
                <MessageCircle className="mx-auto size-8 text-amber-300" />
                <p className="mt-4 text-xl font-bold leading-8">“{expansion.myth.statement}”</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[true, false].map((value) => {
                  const selected = mythAnswer === value;
                  const isRight = mythSubmitted && value === expansion.myth.correct;
                  const isWrong = mythSubmitted && selected && value !== expansion.myth.correct;
                  return <button key={String(value)} type="button" disabled={mythSubmitted} aria-pressed={selected} onClick={() => chooseMythAnswer(value)} className={`answer-tile rounded-2xl border p-5 text-center text-lg font-bold transition ${isRight ? "is-right border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : isWrong ? "is-wrong border-destructive bg-destructive/10 text-destructive" : selected ? "is-selected border-primary bg-primary/10 text-primary" : "bg-background hover:border-primary/40"}`}>{value ? "True" : "False"}</button>;
                })}
              </div>
              {!mythSubmitted && <Button type="button" onClick={checkMythAnswer} disabled={mythAnswer === null} className="mt-5 w-full rounded-xl"><Check /> Check answer</Button>}
              {mythSubmitted && <div role="status" className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${mythAnswer === expansion.myth.correct ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-100" : "bg-amber-500/10 text-amber-950 dark:text-amber-100"}`}><strong>{mythAnswer === expansion.myth.correct ? "You spotted it." : "This one is a myth."}</strong> {expansion.myth.explanation}{mythAnswer !== expansion.myth.correct && <Button type="button" variant="outline" onClick={retryMythAnswer} className="mt-4 w-full rounded-xl bg-background/70"><RotateCcw /> Try again</Button>}</div>}
            </div>
          )}

          {stage === 5 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{challenge.type === "order" ? "Put it in order" : "Select all that apply"}</p>
              <h3 className="mt-3 text-xl font-bold">{challenge.prompt}</h3>
              {challenge.type === "order" ? (
                <>
                  <div className="mt-5 min-h-28 rounded-2xl border-2 border-dashed bg-muted/35 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted-foreground">Your sequence</p>{!challengeSubmitted && challengeSelection.length > 0 && <div className="flex gap-1"><Button type="button" size="sm" variant="ghost" onClick={() => setChallengeSelection((current) => current.slice(0, -1))} className="h-8 rounded-lg px-2 text-xs"><RotateCcw /> Undo</Button><Button type="button" size="sm" variant="ghost" onClick={() => setChallengeSelection([])} className="h-8 rounded-lg px-2 text-xs">Clear</Button></div>}</div>
                    <div className="flex flex-wrap gap-2" aria-live="polite">{challengeSelection.length ? challengeSelection.map((index, position) => <button key={index} type="button" disabled={challengeSubmitted} aria-label={`Step ${position + 1}: ${challenge.items[index]}. Remove from sequence.`} onClick={() => setChallengeSelection((current) => current.filter((item) => item !== index))} className="sequence-chip rounded-xl bg-primary px-3 py-2 text-left text-sm font-semibold text-primary-foreground"><span className="mr-2 opacity-70">{position + 1}</span>{challenge.items[index]}</button>) : <span className="text-sm text-muted-foreground">Tap the steps below to build the sequence.</span>}</div>
                  </div>
                  <div className="mt-4 space-y-2">{challenge.items.map((_, reverseIndex) => challenge.items.length - 1 - reverseIndex).map((index) => <button key={challenge.items[index]} type="button" disabled={challengeSubmitted || challengeSelection.includes(index)} onClick={() => toggleChallengeItem(index)} className="w-full rounded-2xl border bg-background p-4 text-left font-semibold transition hover:border-primary/40 disabled:opacity-40">{challenge.items[index]}</button>)}</div>
                </>
              ) : (
                <div className="mt-5 space-y-3">{challenge.options.map((option, index) => {
                  const selected = challengeSelection.includes(index);
                  const rightAfterCheck = challengeSubmitted && challenge.correct.includes(index);
                  const wrongAfterCheck = challengeSubmitted && selected && !challenge.correct.includes(index);
                  return <button key={option} type="button" disabled={challengeSubmitted} aria-pressed={selected} onClick={() => toggleChallengeItem(index)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left font-semibold transition ${rightAfterCheck ? "border-emerald-500 bg-emerald-500/10" : wrongAfterCheck ? "border-destructive bg-destructive/10" : selected ? "border-primary bg-primary/10" : "bg-background hover:border-primary/40"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-lg border ${selected ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{selected && <Check className="size-4" />}</span>{option}</button>;
                })}</div>
              )}
              {!challengeSubmitted ? <Button onClick={checkChallenge} disabled={challenge.type === "order" ? challengeSelection.length !== challenge.items.length : challengeSelection.length === 0} className="mt-5 w-full rounded-xl"><Check /> Check answer</Button> : <div role="status" className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${challengeCorrect ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-100" : "bg-amber-500/10 text-amber-950 dark:text-amber-100"}`}><strong>{challengeCorrect ? "Nicely built." : "Good experiment."}</strong> {challenge.explanation}{challenge.type === "order" && !challengeCorrect && <span className="mt-2 block font-semibold">Try this order: {challenge.items.join(" → ")}</span>}{!challengeCorrect && <Button type="button" variant="outline" onClick={retryChallenge} className="mt-4 w-full rounded-xl bg-background/70"><RotateCcw /> Undo and try again</Button>}</div>}
            </div>
          )}

          {stage === 6 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Live it</p>
              <div className="mt-4 rounded-3xl bg-gradient-to-br from-violet-950 to-indigo-950 p-6 text-white shadow-xl shadow-violet-900/15">
                <div className="flex items-center gap-3 text-amber-300"><Target className="size-5" /><span className="text-sm font-semibold">Your real-life quest</span></div>
                <p className="mt-4 text-lg leading-8">{lesson.practice}</p>
              </div>
              <div className="mt-5 rounded-2xl border p-5"><p className="text-sm font-semibold text-primary">Return to this question</p><p className="mt-2 leading-7">{lesson.reflection}</p></div>
              <p className="mt-6 font-semibold">Choose one way to carry it forward</p>
              <div className="mt-3 space-y-2">{expansion.commitments.map((item, index) => <button key={item} type="button" aria-pressed={commitment === index} onClick={() => setCommitment((current) => current === index ? null : index)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${commitment === index ? "border-primary bg-primary/10 text-primary" : "bg-background hover:border-primary/40"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full border ${commitment === index ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{commitment === index && <Check className="size-4" />}</span>{item}</button>)}</div>
              <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Completion records effort, not whether you felt a “perfect” result. Honest reflection always counts.</p>
            </div>
          )}
        </div>

        <DialogFooter className="lesson-footer border-t p-5 sm:p-6">
          {stagePosition > 0 && <Button variant="ghost" onClick={() => setStage(pathStages[stagePosition - 1])}><ArrowLeft /> Back</Button>}
          {stage >= 2 && stage <= 5 && stage !== 3 && !canContinue && stagePosition < totalStages - 1 && <Button variant="ghost" onClick={() => setStage(pathStages[stagePosition + 1])} className="text-muted-foreground">Skip for now</Button>}
          {stagePosition < totalStages - 1 ? (
            <Button onClick={() => setStage(pathStages[stagePosition + 1])} disabled={!canContinue} className="rounded-xl px-6">Continue <ArrowRight /></Button>
          ) : (
            <Button onClick={completeLesson} disabled={commitment === null} className="rounded-xl px-6"><Sparkles /> {alreadyComplete ? `Finish review · +${REVIEW_REWARD}` : `Complete lesson · +${LESSON_REWARD}`}</Button>
          )}
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PracticeView({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [revealed, setRevealed] = useState(false);
  const [activePractice, setActivePractice] = useState<PracticeId | null>(null);
  const [journalDraft, setJournalDraft] = useState("");
  const availableReviews = quickReviews.filter((review) => state.completedLessons.includes(review.lessonId) && (!state.reviewSchedule[review.lessonId] || state.reviewSchedule[review.lessonId].nextDue <= dayKey())).sort((a, b) => (state.reviewSchedule[a.lessonId]?.nextDue ?? "").localeCompare(state.reviewSchedule[b.lessonId]?.nextDue ?? ""));
  const card = availableReviews[0] ?? null;
  const scheduleReview = (remembered: boolean) => {
    if (!card) return;
    const previous = state.reviewSchedule[card.lessonId]?.intervalDays ?? 0;
    const intervalDays = remembered ? Math.min(30, previous ? previous * 2 : 2) : 1;
    const due = new Date();
    due.setDate(due.getDate() + intervalDays);
    setState((current) => ({ ...current, ...activityUpdate(current), reviewSchedule: { ...current.reviewSchedule, [card.lessonId]: { nextDue: dayKey(due), intervalDays } } }));
    setRevealed(false);
    toast.success(`Review saved · returns in ${intervalDays} day${intervalDays === 1 ? "" : "s"}`);
  };

  const completePractice = (id: PracticeId) => {
    const key = `${dayKey()}:${id}`;
    if (state.completedPractices.includes(key)) {
      toast.success("Practice revisited · today’s reward was already claimed");
      return;
    }
    setState((current) => current.completedPractices.includes(key) ? current : ({
      ...current,
      ...activityUpdate(current),
      wisdom: current.wisdom + PRACTICE_REWARD,
      completedPractices: [...current.completedPractices, key],
    }));
    toast.success(`Practice complete · +${PRACTICE_REWARD} wisdom`);
  };

  const openPractice = (id: PracticeId) => {
    setActivePractice(id);
  };

  const saveReflection = () => {
    const text = journalDraft.trim();
    if (!text) return;
    setState((current) => ({
      ...current,
      ...activityUpdate(current),
      wisdom: current.wisdom + REFLECTION_REWARD,
      journalEntries: [{ id: `${Date.now()}`, date: dayKey(), text }, ...current.journalEntries].slice(0, 50),
    }));
    setJournalDraft("");
    toast.success(`Reflection saved privately · +${REFLECTION_REWARD} wisdom`);
  };

  return (
    <div className="page-view">
      <p className="section-kicker text-sm font-semibold text-primary">Practice hub</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Strengthen what you’re learning</h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">Review concepts, then carry one of them into the rest of your day.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="dharma-card rounded-[2rem] border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-primary">Quick review</p><h2 className="mt-1 text-xl font-bold">{card ? `${availableReviews.length} review${availableReviews.length === 1 ? "" : "s"} ready` : "Your review deck"}</h2></div><RotateCcw className="size-5 text-muted-foreground" /></div>
          {card ? <><button key={`${card.lessonId}-${revealed}`} type="button" onClick={() => setRevealed(true)} aria-label={revealed ? "Review answer" : "Reveal review answer"} className="review-card mt-6 flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border bg-gradient-to-br from-secondary/70 to-background p-7 text-center transition hover:border-primary/35">
            {!revealed ? <><Brain className="size-9 text-primary" /><p className="mt-5 text-xl font-bold leading-8">{card.prompt}</p><span className="mt-5 text-sm text-muted-foreground">Tap to reveal</span></> : <><span className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">From a lesson you completed</span><p className="mt-3 text-2xl font-bold">{card.answer}</p><p className="mt-3 max-w-md leading-7 text-muted-foreground">{card.detail}</p></>}
          </button>
          {revealed && <div className="mt-5 grid grid-cols-2 gap-3"><Button type="button" variant="outline" onClick={() => scheduleReview(false)} className="min-h-11 rounded-xl">Revisit tomorrow</Button><Button type="button" onClick={() => scheduleReview(true)} className="min-h-11 rounded-xl">I remembered <Check /></Button></div>}<p className="mt-4 text-xs leading-5 text-muted-foreground">Reviews return after a short interval. Remembered ideas get more space; difficult ones return tomorrow.</p></> : <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/25 p-7 text-center"><BookOpen className="size-10 text-primary" /><h3 className="mt-4 text-xl font-bold">{state.completedLessons.length ? "You’re up to date" : "Complete your first lesson"}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{state.completedLessons.length ? "Your completed concepts will return on their review dates. Explore another lesson or try a small practice today." : "Complete your first lesson to unlock personalized review of concepts you have already encountered."}</p></div>}
        </section>
        <section>
          <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-semibold text-primary">Mind + body</p><h2 className="mt-1 text-xl font-bold">Choose one small practice</h2></div><span className="text-right text-sm text-muted-foreground">+{PRACTICE_REWARD} first time daily</span></div>
          <div className="mt-4 space-y-3">
            {practiceOptions.map(({ id, title, detail, icon: Icon }) => {
              const done = state.completedPractices.includes(`${dayKey()}:${id}`);
              return (
                <button key={id} type="button" onClick={() => openPractice(id)} className={`practice-card group flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-sm transition ${done ? "is-complete" : "hover:border-primary/35"}`}>
                  <PracticeMiniAnimation id={id} done={done} fallbackIcon={Icon} />
                  <span className="relative z-10 flex-1"><strong className="block">{title}</strong><span className="mt-1 block text-sm leading-6 text-muted-foreground">{detail}</span><span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.11em] ${done ? "text-emerald-600 dark:text-emerald-300" : "text-primary"}`}>{done ? <><RotateCcw className="size-3.5" /> Replay ritual</> : <>Begin ritual <Sparkles className="size-3.5" /></>}</span></span>
                  <ChevronRight className="relative z-10 size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              );
            })}
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" /> These are general wellness practices, not medical care. Stop any movement or breathing practice that feels uncomfortable.</p>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border bg-card p-6">
          <p className="text-sm font-semibold text-primary">Reflection journal</p>
          <h2 className="mt-1 text-xl font-bold">What are you noticing?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your entries remain in this browser. Honest reflection earns the same respect as a correct answer.</p>
          <Textarea value={journalDraft} onChange={(event) => setJournalDraft(event.target.value)} placeholder="One thought, feeling, or choice I want to notice…" className="mt-5 min-h-28 rounded-2xl" />
          <Button onClick={saveReflection} disabled={!journalDraft.trim()} className="mt-3 rounded-xl"><Sparkles /> Save reflection</Button>
          {state.journalEntries[0] && <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm leading-6"><span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Latest · {state.journalEntries[0].date}</span><p className="mt-2">{state.journalEntries[0].text}</p></div>}
        </section>
        <section className="rounded-[2rem] border bg-card p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-primary">Saved teachings</p><h2 className="mt-1 text-xl font-bold">Your Gita collection</h2></div><Bookmark className="size-6 text-amber-500" /></div>
          {state.savedVerses.length ? <div className="mt-5 space-y-3">{state.savedVerses.map((reference) => {
            const saved = Object.values(lessonExpansions).find((item) => item.gita.reference === reference)?.gita;
            return <article key={reference} className="rounded-2xl bg-secondary/70 p-4"><strong className="text-sm text-primary">{reference}</strong><p className="mt-2 text-sm leading-6">{saved?.paraphrase ?? "Saved teaching"}</p><Button type="button" variant="ghost" size="sm" onClick={() => setState((current) => ({ ...current, savedVerses: current.savedVerses.filter((item) => item !== reference) }))} className="mt-2 h-8 rounded-lg px-2 text-xs"><Trash2 /> Remove</Button></article>;
          })}</div> : <div className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Save a Gita connection during any lesson and it will appear here.</div>}
        </section>
      </div>
      {activePractice && (
        <PracticeExperience
          practice={activePractice}
          alreadyCompleted={state.completedPractices.includes(`${dayKey()}:${activePractice}`)}
          onClose={() => setActivePractice(null)}
          onComplete={completePractice}
        />
      )}
    </div>
  );
}

type PracticeId = "breath" | "walk" | "seva";

const practiceOptions: Array<{
  id: PracticeId;
  title: string;
  detail: string;
  icon: typeof Brain;
}> = [
  { id: "breath", title: "Four-breath pause", detail: "Four comfortable breaths before one stressful response.", icon: Brain },
  { id: "walk", title: "Mindful movement", detail: "Seven minutes of walking, gentle mobility, or seated movement.", icon: Footprints },
  { id: "seva", title: "Quiet service", detail: "One helpful action centered on what another person actually needs.", icon: HandHeart },
];

function PracticeMiniAnimation({
  id,
  done,
  fallbackIcon: Icon,
}: {
  id: PracticeId;
  done: boolean;
  fallbackIcon: typeof Brain;
}) {
  if (done) {
    return (
      <span className="practice-mini practice-mini-complete" aria-hidden="true">
        <span className="practice-complete-halo" />
        <Check className="relative z-10 size-5" />
      </span>
    );
  }
  if (id === "breath") {
    return (
      <span className="practice-mini practice-mini-breath" aria-hidden="true">
        <span className="mini-breath-ring" />
        <Flower2 className="relative z-10 size-5" />
      </span>
    );
  }
  if (id === "walk") {
    return (
      <span className="practice-mini practice-mini-walk" aria-hidden="true">
        <span className="mini-path" />
        <Footprints className="mini-footsteps relative z-10 size-5" />
      </span>
    );
  }
  return (
    <span className="practice-mini practice-mini-seva" aria-hidden="true">
      <span className="mini-seva-ring" />
      <Icon className="relative z-10 size-5" />
    </span>
  );
}

function PracticeExperience({
  practice,
  alreadyCompleted,
  onClose,
  onComplete,
}: {
  practice: PracticeId;
  alreadyCompleted: boolean;
  onClose: () => void;
  onComplete: (practice: PracticeId) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [serviceChoice, setServiceChoice] = useState("");
  const [rippleStarted, setRippleStarted] = useState(false);
  const [rippleReady, setRippleReady] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [earnedPracticeReward, setEarnedPracticeReward] = useState(0);
  const finishedPractice = useRef(false);
  const [staticTimer, setStaticTimer] = useState(false);
  const elapsedRef = useRef(0);

  const limit = practice === "breath" ? 32 : 420;

  useEffect(() => {
    if (!running || practice === "seva") return;
    let frame = 0;
    let previousTime = performance.now();
    const tick = (time: number) => {
      elapsedRef.current = Math.min(limit, elapsedRef.current + (time - previousTime) / 1000);
      previousTime = time;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current < limit) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [limit, practice, running]);

  useEffect(() => {
    if (elapsed >= limit) setRunning(false);
  }, [elapsed, limit]);

  useEffect(() => {
    if (!rippleStarted) return;
    const timer = window.setTimeout(() => setRippleReady(true), 1900);
    return () => window.clearTimeout(timer);
  }, [rippleStarted]);

  const finish = () => {
    if (finishedPractice.current) return;
    finishedPractice.current = true;
    setRunning(false);
    setEarnedPracticeReward(alreadyCompleted ? 0 : PRACTICE_REWARD);
    onComplete(practice);
    setCelebrating(true);
  };

  const formatTimer = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  const breathSecond = elapsed % 8;
  const breathPhase = breathSecond < 3 ? "Breathe in" : breathSecond < 4 ? "Pause softly" : "Breathe out";
  const breathCountdown = Math.ceil(breathSecond < 3 ? 3 - breathSecond : breathSecond < 4 ? 4 - breathSecond : 8 - breathSecond);
  const breathGrowth = breathSecond < 3 ? (1 - Math.cos(Math.PI * breathSecond / 3)) / 2 : breathSecond < 4 ? 1 : (1 + Math.cos(Math.PI * (breathSecond - 4) / 4)) / 2;
  const breathScale = .76 + breathGrowth * .32;

  if (celebrating) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="overflow-hidden rounded-[2rem] border-0 p-0 sm:max-w-xl">
          <div className="wisdom-celebration relative grid min-h-[30rem] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,#7c55d0_0%,#32205f_44%,#17102f_100%)] p-8 text-center text-white">
            <span className="celebration-orbit celebration-orbit-one" aria-hidden="true"><Star className="size-5 fill-current" /></span>
            <span className="celebration-orbit celebration-orbit-two" aria-hidden="true"><Sparkles className="size-5" /></span>
            <span className="celebration-orbit celebration-orbit-three" aria-hidden="true"><Flower2 className="size-5" /></span>
            <div className="relative z-10">
              <span className="wisdom-burst mx-auto grid size-28 place-items-center rounded-full bg-white/15 backdrop-blur"><Check className="size-12" strokeWidth={3} /></span>
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Practice complete</p>
              <DialogTitle className="mt-3 text-4xl font-black tracking-tight">Wisdom lived</DialogTitle>
              <DialogDescription className="sr-only">Practice complete. Your activity record has been saved.</DialogDescription>
              <p className="mt-3 text-lg text-violet-100">A small action became part of your path.</p>
              <span className="wisdom-reward mt-7 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-black text-amber-950 shadow-xl shadow-amber-300/20"><Sparkles className="size-5" /> {earnedPracticeReward ? `+${earnedPracticeReward} wisdom` : "Practice revisited"}</span>
              <Button onClick={onClose} className="mx-auto mt-6 flex min-h-11 rounded-xl bg-white text-violet-950 hover:bg-violet-100">Return to practice</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[2rem] p-0 sm:max-w-2xl">
        {practice === "breath" && (
          <>
            <DialogHeader className="px-6 pt-6 text-left sm:px-8 sm:pt-8">
              <p className="text-sm font-semibold text-sky-600 dark:text-sky-300">Calm · 32 seconds</p>
              <DialogTitle className="text-2xl sm:text-3xl">Four-breath pause</DialogTitle>
              <DialogDescription className="text-base leading-7">Breathe comfortably—never force the pace. Let the light guide four gentle cycles.</DialogDescription>
            </DialogHeader>
            <div className={`breath-ritual mx-6 mt-6 overflow-hidden rounded-[1.75rem] sm:mx-8 ${running ? "is-running" : ""} ${elapsed >= 32 ? "is-finished" : ""} ${staticTimer ? "is-static" : ""}`}>
              <span className="breath-aurora" aria-hidden="true" />
              <span className="breath-ring breath-ring-one" style={{ transform: `translate(-50%, -50%) scale(${.7 + breathGrowth * .48})`, opacity: .2 + breathGrowth * .5 }} aria-hidden="true" />
              <span className="breath-ring breath-ring-two" style={{ transform: `translate(-50%, -50%) scale(${.78 + breathGrowth * .32})`, opacity: .15 + breathGrowth * .3 }} aria-hidden="true" />
              <div className="breath-orb" style={{ transform: `translate(-50%, -50%) scale(${breathScale})` }} aria-hidden="true"><Flower2 className="size-12" /></div>
              <div className="relative z-10 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-100">{elapsed >= 32 ? "Four breaths complete" : running ? `Breath ${Math.min(4, Math.floor(elapsed / 8) + 1)} of 4` : "When you’re ready"}</p>
                <p className="mt-2 text-3xl font-black text-white" aria-live="polite">{elapsed >= 32 ? "Notice the quiet" : running ? breathPhase : elapsed ? "Paused" : "Begin gently"}</p>
                {running && <p className="mt-2 text-lg font-semibold text-sky-100">{breathCountdown}</p>}
              </div>
            </div>
            <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
              <div className="mb-4 flex justify-center"><Button type="button" variant="ghost" size="sm" onClick={() => setStaticTimer((current) => !current)} className="rounded-xl">{staticTimer ? "Use animated guide" : "Use static timer"}</Button></div>
              <div className="mb-5 flex justify-center gap-2" aria-label={`${Math.min(4, Math.floor(elapsed / 8))} of 4 breaths completed`}>
                {[0, 1, 2, 3].map((item) => <span key={item} className={`h-2.5 w-10 rounded-full transition-colors ${elapsed >= (item + 1) * 8 ? "bg-sky-500" : elapsed >= item * 8 && running ? "bg-sky-300" : "bg-muted"}`} />)}
              </div>
              {elapsed >= 32 ? (
                <Button onClick={finish} className="h-12 w-full rounded-xl"><Sparkles /> {alreadyCompleted ? "Finish replay" : `Claim +${PRACTICE_REWARD} wisdom`}</Button>
              ) : (
                <Button onClick={() => setRunning((current) => !current)} className="h-12 w-full rounded-xl">{running ? <><Pause /> Pause</> : <><Play /> {elapsed ? "Continue" : "Begin four breaths"}</>}</Button>
              )}
              <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">If this rhythm feels uncomfortable, return to your natural breath or close the practice.</p>
            </div>
          </>
        )}

        {practice === "walk" && (
          <>
            <DialogHeader className="px-6 pt-6 text-left sm:px-8 sm:pt-8">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Body · 7 minutes</p>
              <DialogTitle className="text-2xl sm:text-3xl">Mindful movement</DialogTitle>
              <DialogDescription className="text-base leading-7">Walk, stretch, or move while seated. Follow sensation instead of performance.</DialogDescription>
            </DialogHeader>
            <div className={`movement-ritual mx-6 mt-6 overflow-hidden rounded-[1.75rem] sm:mx-8 ${running ? "is-running" : ""}`}>
              <span className="movement-glow" aria-hidden="true" />
              <span className="movement-path movement-path-one" aria-hidden="true" />
              <span className="movement-path movement-path-two" aria-hidden="true" />
              <span className="movement-step movement-step-one" aria-hidden="true"><Footprints className="size-6" /></span>
              <span className="movement-step movement-step-two" aria-hidden="true"><Footprints className="size-5" /></span>
              <div className="relative z-10 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">Move with attention</p>
                <p className="mt-2 text-5xl font-black tabular-nums text-white">{formatTimer(Math.max(0, 420 - elapsed))}</p>
                <p className="mt-3 text-sm text-emerald-100">Feel one point of contact, then the next.</p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => setRunning((current) => !current)} variant={running ? "outline" : "default"} className="h-12 rounded-xl">{running ? <><Pause /> Pause timer</> : <><Play /> {elapsed ? "Resume movement" : "Start movement"}</>}</Button>
                <Button onClick={finish} disabled={elapsed === 0} variant="outline" className="h-12 rounded-xl"><Check /> I completed it</Button>
              </div>
              <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">The timer is a guide. Stop or choose a seated version whenever your body asks.</p>
            </div>
          </>
        )}

        {practice === "seva" && (
          <>
            <DialogHeader className="px-6 pt-6 text-left sm:px-8 sm:pt-8">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">Seva · one sincere action</p>
              <DialogTitle className="text-2xl sm:text-3xl">Create a quiet ripple</DialogTitle>
              <DialogDescription className="text-base leading-7">Choose what would genuinely help someone today. The value is in the care, not the credit.</DialogDescription>
            </DialogHeader>
            <div className={`seva-ritual mx-6 mt-6 overflow-hidden rounded-[1.75rem] sm:mx-8 ${rippleStarted ? "is-rippling" : ""}`}>
              <span className="seva-ripple seva-ripple-one" aria-hidden="true" />
              <span className="seva-ripple seva-ripple-two" aria-hidden="true" />
              <span className="seva-ripple seva-ripple-three" aria-hidden="true" />
              <span className="seva-heart"><Heart className="size-12 fill-current" /></span>
              <div className="relative z-10 mt-5 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-100">{rippleReady ? "Intention released" : "Kindness travels"}</p>
                <p className="mt-2 text-2xl font-black text-white">{rippleReady ? serviceChoice : "Begin with what is needed"}</p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
              <p className="text-sm font-semibold">Choose your intention</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {["Listen fully", "Offer practical help", "Encourage someone"].map((choice) => (
                  <button key={choice} type="button" disabled={rippleStarted} onClick={() => setServiceChoice(choice)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${serviceChoice === choice ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-200" : "bg-card hover:border-amber-500/50"}`}>{choice}</button>
                ))}
              </div>
              {!rippleReady ? (
                <Button onClick={() => setRippleStarted(true)} disabled={!serviceChoice || rippleStarted} className="mt-5 h-12 w-full rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400"><HandHeart /> {rippleStarted ? "Sending your ripple…" : "Send the ripple"}</Button>
              ) : (
                <Button onClick={finish} className="mt-5 h-12 w-full rounded-xl"><Sparkles /> Carry it into your day</Button>
              )}
              <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">Complete the action privately when the moment is right. No proof or recognition is needed.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type PlaceResult = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

const defaultChartInput: ChartInput = {
  name: "",
  birthDate: "",
  birthTime: "12:00",
  timeAccuracy: "exact",
  location: { name: "", country: "", latitude: 0, longitude: 0, timezone: "" },
  houseSystem: "placidus",
};

function AstrologyView({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [editing, setEditing] = useState(!state.charts.vedic && !state.charts.western);
  const [input, setInput] = useState<ChartInput>(state.chartInput ?? { ...defaultChartInput, name: state.name });
  const [system, setSystem] = useState<RequestedSystem>(state.requestedSystem);
  const [placeQuery, setPlaceQuery] = useState(state.chartInput?.location.name ?? "");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculationStage, setCalculationStage] = useState("");
  const [error, setError] = useState("");
  const [activeSystem, setActiveSystem] = useState<"vedic" | "western">(state.charts.vedic ? "vedic" : "western");

  const searchPlaces = async (event: React.FormEvent) => {
    event.preventDefault();
    if (placeQuery.trim().length < 2) return;
    setSearching(true);
    setError("");
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeQuery.trim())}&count=6&language=en&format=json`);
      if (!response.ok) throw new Error("Location search is temporarily unavailable.");
      const data = await response.json() as { results?: PlaceResult[] };
      setPlaceResults(data.results ?? []);
      if (!data.results?.length) setError("No matching birthplace found. Try the nearest city or include the country.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not search for that place.");
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (place: PlaceResult) => {
    const location: BirthLocation = {
      name: [place.name, place.admin1].filter(Boolean).join(", "),
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    };
    setInput((current) => ({ ...current, location }));
    setPlaceQuery(`${location.name}, ${location.country}`);
    setPlaceResults([]);
  };

  const createChart = async () => {
    setError("");
    if (!input.birthDate) return setError("Enter your birth date.");
    if (input.timeAccuracy !== "unknown" && !input.birthTime) return setError("Enter your recorded birth time or select “unknown.”");
    if (!input.location.timezone) return setError("Search for and select your birthplace.");
    setCalculating(true);
    try {
      const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      setCalculationStage("Resolving historical time zone…");
      await nextFrame();
      const charts: Partial<Record<"vedic" | "western", ChartResult>> = {};
      setCalculationStage("Calculating planetary positions…");
      await nextFrame();
      if (system === "vedic" || system === "both") charts.vedic = await calculateChart(input, "vedic");
      if (system === "western" || system === "both") charts.western = await calculateChart(input, "western");
      setCalculationStage("Building your chart…");
      await nextFrame();
      setState((current) => ({
        ...current,
        chartInput: input,
        requestedSystem: system,
        charts,
      }));
      const initial = charts.vedic ? "vedic" : "western";
      setActiveSystem(initial);
      setEditing(false);
      toast.success("Chart calculated · optional exploration badge earned");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The chart could not be calculated.");
    } finally {
      setCalculating(false);
      setCalculationStage("");
    }
  };

  const chart = state.charts[activeSystem];

  if (!editing && chart) {
    const availableSystems = (["vedic", "western"] as const).filter((item) => state.charts[item]);
    return (
      <AstrologyResult
        chart={chart}
        name={state.chartInput?.name || state.name}
        location={state.chartInput?.location}
        availableSystems={availableSystems}
        activeSystem={activeSystem}
        setActiveSystem={setActiveSystem}
        onEdit={() => setEditing(true)}
        onDelete={() => {
          setState((current) => ({ ...current, chartInput: null, charts: {} }));
          setInput({ ...defaultChartInput, name: state.name });
          setPlaceQuery("");
          setEditing(true);
          toast.success("Birth information deleted from this browser");
        }}
      />
    );
  }

  return (
    <div className="page-view">
      <p className="section-kicker text-sm font-semibold text-primary">Optional cultural exploration</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Explore Jyotisha</h1>
      <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">Jyotisha is a traditional Indian astral interpretive practice with historical relationships to many Hindu communities. Not all Hindus practice or prioritize it, and it is not a definition of Hinduism or a scientifically validated prediction method.</p>
      <div className="mt-5 max-w-3xl rounded-2xl border border-violet-500/20 bg-violet-500/8 p-4 text-sm leading-6"><strong>This module is separate from course progress.</strong> Creating a chart earns an exploration badge, not wisdom points or lesson completion. Calculations happen in this browser; birthplace search sends only the typed place name to the search provider.</div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[.76fr_1.24fr]">
        <aside className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-6 text-white shadow-2xl shadow-violet-950/15 sm:p-8">
          <Orbit className="size-10 text-amber-300" />
          <h2 className="mt-6 text-2xl font-bold">What we need—and why</h2>
          <div className="mt-6 space-y-5">
            {[
              [CalendarDays, "Birth date", "Sets the planetary positions."],
              [Clock3, "Recorded time", "Determines the Ascendant and houses."],
              [MapPin, "Birthplace", "Resolves coordinates, time zone, and historical daylight saving."],
              [Settings2, "Tradition", "Keeps Vedic and Western calculation rules distinct."],
            ].map(([Icon, title, detail]) => {
              const TypedIcon = Icon as typeof CalendarDays;
              return <div key={title as string} className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-300"><TypedIcon className="size-5" /></span><div><strong className="block text-sm">{title as string}</strong><span className="mt-1 block text-sm leading-6 text-white/60">{detail as string}</span></div></div>;
            })}
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65"><ShieldCheck className="mb-2 size-5 text-emerald-300" />Your chart stays in this browser. It is not uploaded to an astrology profile database.</div>
        </aside>

        <section className="dharma-card rounded-[2rem] border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Chart setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose one system or compare both side by side.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["vedic", "Vedic", "Sidereal · Lahiri"],
              ["western", "Western", "Tropical zodiac"],
              ["both", "Both", "Two distinct charts"],
            ].map(([id, label, note]) => (
              <button key={id} type="button" onClick={() => setSystem(id as RequestedSystem)} aria-pressed={system === id} className={`rounded-2xl border p-4 text-left transition ${system === id ? "border-primary bg-primary/10 ring-2 ring-primary/15" : "bg-background hover:border-primary/40"}`}><strong className="block">{label}</strong><span className="mt-1 block text-xs text-muted-foreground">{note}</span></button>
            ))}
          </div>

          {(system === "vedic" || system === "both") && <div className="mt-5 rounded-2xl bg-secondary/60 p-4 text-sm leading-6"><strong>The Vedic method used here</strong><p className="mt-2">The sidereal zodiac uses Lahiri ayanamsha, a commonly used offset from the tropical zodiac. Whole-sign houses assign one sign to each house. Rahu and Ketu use the mean lunar node, a smoothed mathematical position. Other Jyotisha traditions may choose different settings.</p></div>}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">Name for your chart<Input value={input.name} onChange={(event) => setInput((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-11 rounded-xl" placeholder="Your name" /></label>
            <label className="text-sm font-semibold">Birth date<Input type="date" value={input.birthDate} onInput={(event) => setInput((current) => ({ ...current, birthDate: (event.target as HTMLInputElement).value }))} onChange={(event) => setInput((current) => ({ ...current, birthDate: event.target.value }))} className="mt-2 h-11 rounded-xl" /></label>
            <label className="text-sm font-semibold">Birth time<Input type="time" disabled={input.timeAccuracy === "unknown"} value={input.birthTime} onInput={(event) => setInput((current) => ({ ...current, birthTime: (event.target as HTMLInputElement).value }))} onChange={(event) => setInput((current) => ({ ...current, birthTime: event.target.value }))} className="mt-2 h-11 rounded-xl" /><span className="mt-1.5 block text-xs font-normal text-muted-foreground">Use the time on a birth record when possible.</span></label>
            <label className="text-sm font-semibold">Time accuracy<Select value={input.timeAccuracy} onValueChange={(value) => setInput((current) => ({ ...current, timeAccuracy: value as ChartInput["timeAccuracy"] }))}><SelectTrigger className="mt-2 h-11 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="exact">Exact or recorded</SelectItem><SelectItem value="close">Within about 15 minutes</SelectItem><SelectItem value="approximate">Approximate</SelectItem><SelectItem value="unknown">Unknown</SelectItem></SelectContent></Select></label>
          </div>

          <form onSubmit={searchPlaces} className="mt-5">
            <label className="text-sm font-semibold" htmlFor="birthplace">Birthplace</label>
            <div className="mt-2 flex gap-2"><Input id="birthplace" value={placeQuery} onChange={(event) => { setPlaceQuery(event.target.value); setInput((current) => ({ ...current, location: defaultChartInput.location })); }} className="h-11 rounded-xl" placeholder="City, state or province, country" /><Button type="submit" variant="outline" disabled={searching} className="h-11 rounded-xl px-4">{searching ? <LoaderCircle className="animate-spin" /> : <Search />}<span className="sr-only">Search birthplace</span></Button></div>
          </form>

          {placeResults.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-2xl border bg-popover shadow-lg">
              {placeResults.map((place) => (
                <button key={place.id} type="button" onClick={() => selectPlace(place)} className="flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-accent"><MapPin className="size-4 shrink-0 text-primary" /><span className="flex-1 text-sm"><strong>{place.name}</strong>{place.admin1 ? `, ${place.admin1}` : ""}, {place.country}<span className="mt-0.5 block text-xs text-muted-foreground">{place.timezone} · {place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}</span></span></button>
              ))}
            </div>
          )}
          {input.location.timezone && <div className="mt-3 flex items-start gap-2 rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:text-emerald-100"><CircleCheck className="mt-0.5 size-4 shrink-0" /><span><strong>{input.location.name}, {input.location.country}</strong><span className="block text-xs opacity-75">{input.location.timezone} · {input.location.latitude.toFixed(4)}, {input.location.longitude.toFixed(4)}</span></span></div>}

          {(system === "western" || system === "both") && (
            <label className="mt-5 block text-sm font-semibold">Western house system<Select value={input.houseSystem} onValueChange={(value) => setInput((current) => ({ ...current, houseSystem: value as ChartInput["houseSystem"] }))}><SelectTrigger className="mt-2 h-11 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="placidus">Placidus</SelectItem><SelectItem value="whole-sign">Whole sign</SelectItem></SelectContent></Select></label>
          )}

          {error && <div role="alert" className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm leading-6 text-destructive">{error}</div>}

          <Button type="button" onClick={createChart} disabled={calculating} size="lg" className="mt-6 h-12 w-full rounded-xl text-base">{calculating ? <><LoaderCircle className="animate-spin" /> {calculationStage || "Preparing calculation…"}</> : <><Orbit /> Calculate my chart</>}</Button>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Astrology is offered as a traditional interpretive system for reflection, not scientific prediction or medical, legal, or financial advice.</p>
        </section>
      </div>
    </div>
  );
}

function AstrologyResult({
  chart,
  name,
  location,
  availableSystems,
  activeSystem,
  setActiveSystem,
  onEdit,
  onDelete,
}: {
  chart: ChartResult;
  name: string;
  location?: BirthLocation;
  availableSystems: ("vedic" | "western")[];
  activeSystem: "vedic" | "western";
  setActiveSystem: (system: "vedic" | "western") => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [animateChart, setAnimateChart] = useState(true);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const selected = chart.placements.find((placement) => placement.name === selectedPlacement);
  const selectedReading = selected ? chart.readings.find((section) => section.evidence.includes(selected.name)) : null;
  const sun = chart.placements.find((item) => item.name === "Sun")!;
  const moon = chart.placements.find((item) => item.name === "Moon")!;
  const primaryAspects = chart.aspects.slice(0, 8);
  return (
    <div className="page-view">
      <div className="page-intro flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-primary">{chart.system === "vedic" ? "Vedic · Sidereal" : "Western · Tropical"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{name || "Your"} birth chart</h1><p className="mt-2 text-muted-foreground">{location ? `${location.name}, ${location.country}` : "Calculated birth location"}</p></div>
        <div className="flex flex-wrap gap-2">
          {availableSystems.length > 1 && availableSystems.map((system) => <Button key={system} variant={activeSystem === system ? "default" : "outline"} onClick={() => setActiveSystem(system)} className="rounded-xl capitalize">{system}</Button>)}
          <Button variant="outline" onClick={onEdit} className="rounded-xl"><Settings2 /> Edit birth data</Button>
          <Button variant="ghost" onClick={onDelete} className="rounded-xl text-destructive"><Trash2 /> Delete birth data</Button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <BigThreeCard icon={Sun} label="Sun" placement={sun} />
        <BigThreeCard icon={Moon} label="Moon" placement={moon} />
        <BigThreeCard icon={Compass} label="Ascendant" placement={chart.ascendant} />
      </div>

      <Tabs defaultValue="overview" className="mt-7">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl bg-card p-1.5 shadow-sm">
          <TabsTrigger value="overview" className="min-h-10 rounded-xl px-4">Overview</TabsTrigger>
          <TabsTrigger value="reading" className="min-h-10 rounded-xl px-4">Full reading</TabsTrigger>
          <TabsTrigger value="placements" className="min-h-10 rounded-xl px-4">Placements</TabsTrigger>
          <TabsTrigger value="timing" className="min-h-10 rounded-xl px-4">Timing</TabsTrigger>
          <TabsTrigger value="details" className="min-h-10 rounded-xl px-4">Calculation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <section className="dharma-card rounded-[2rem] border bg-card p-4 sm:p-6"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Calculated chart</p>{animateChart && <Button type="button" size="sm" variant="ghost" onClick={() => setAnimateChart(false)} className="h-8 rounded-lg">Skip animation</Button>}</div><ChartWheel chart={chart} animate={animateChart} selected={selectedPlacement} onSelect={setSelectedPlacement} /><p className="mt-3 text-xs leading-5 text-muted-foreground">Select a placement to trace its calculation and reflection.</p><div aria-live="polite" className="mt-3 min-h-20 rounded-2xl border bg-secondary/35 p-4 text-sm leading-6">{selected ? <><strong className="block text-primary">{selected.name} · {formatExactPlacement(selected)}</strong><p className="mt-1">{selectedReading?.practice ?? "Treat this placement as an optional traditional reflection rather than a statement of fact about you."}</p></> : "Planetary symbols show calculated positions. Their traditional meanings are interpretive."}</div>{chart.system === "vedic" && <p className="mt-4 rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground"><strong>Traditional core and modern additions:</strong> Sun through Saturn plus Rahu and Ketu form the traditional core shown here. Uranus, Neptune, Pluto, aspects, and the Midheaven are optional modern additions and are not universal in classical Jyotisha.</p>}</section>
            <section className="space-y-4">
              <div className="rounded-2xl border bg-card p-4"><p className="text-sm font-semibold">Choose a placement</p><div className="mt-3 grid grid-cols-3 gap-2">{chart.placements.map((placement) => <button type="button" key={placement.name} onClick={() => setSelectedPlacement(placement.name)} aria-pressed={selectedPlacement === placement.name} className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition ${selectedPlacement === placement.name ? "border-primary bg-primary/10 text-primary" : "bg-background hover:border-primary/40"}`}>{placement.symbol} {placement.name}</button>)}</div></div>
              {chart.readings.slice(0, 3).map((section) => <ReadingCard key={section.title} section={section} />)}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="reading" className="mt-5">
          <div className="grid gap-4 lg:grid-cols-2">{chart.readings.map((section) => <ReadingCard key={section.title} section={section} />)}</div>
        </TabsContent>

        <TabsContent value="placements" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <section className="overflow-hidden rounded-[2rem] border bg-card"><div className="border-b p-5"><h2 className="text-xl font-bold">Exact placements</h2><p className="mt-1 text-sm text-muted-foreground">Compare each reading’s evidence with these calculated positions.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/60 text-xs uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3">Body</th><th className="px-5 py-3">Position</th><th className="px-5 py-3">House</th><th className="px-5 py-3">Motion</th></tr></thead><tbody>{chart.placements.map((placement) => <tr key={placement.name} className="border-t first:border-t-0"><td className="px-5 py-3 font-semibold"><span className="mr-2 text-lg text-primary">{placement.symbol}</span>{placement.name}</td><td className="whitespace-nowrap px-5 py-3">{formatExactPlacement(placement)}</td><td className="px-5 py-3">{placement.house ?? "—"}</td><td className="px-5 py-3 text-muted-foreground">{placement.retrograde ? "Retrograde" : "Direct"}</td></tr>)}</tbody></table></div></section>
            <section className="rounded-[2rem] border bg-card p-5"><h2 className="text-xl font-bold">Major aspects</h2><p className="mt-1 text-sm text-muted-foreground">Closest recognized angular relationships.</p><div className="mt-4 space-y-2">{primaryAspects.length ? primaryAspects.map((aspect) => <div key={`${aspect.between}-${aspect.type}`} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-3 text-sm"><span><strong>{aspect.between}</strong><span className="ml-2 text-muted-foreground">{aspect.type}</span></span><span className="font-mono text-xs text-muted-foreground">{aspect.orb.toFixed(1)}°</span></div>) : <p className="text-sm text-muted-foreground">No major aspects within the selected orbs.</p>}</div></section>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-[2rem] bg-gradient-to-br from-indigo-950 to-violet-950 p-6 text-white"><Orbit className="size-7 text-amber-300" /><p className="mt-5 text-sm font-semibold text-amber-300">Current timing lens</p><h2 className="mt-2 text-2xl font-bold">{chart.dasha ? `${chart.dasha.lord} · ${chart.dasha.subLord}` : "Current transits"}</h2><p className="mt-3 leading-7 text-white/70">{chart.timingNote}</p>{chart.dasha && <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm"><span className="text-white/55">Mahadasha</span><strong className="mt-1 block">{chart.dasha.lord} · {new Date(chart.dasha.start).toLocaleDateString()} – {new Date(chart.dasha.end).toLocaleDateString()}</strong><span className="mt-3 block text-white/55">Current antardasha</span><strong className="mt-1 block">{chart.dasha.subLord} · through {new Date(chart.dasha.subEnd).toLocaleDateString()}</strong><span className="mt-3 block text-white/55">Next major period</span><strong className="mt-1 block">{chart.dasha.nextLord}</strong></div>}</section>
            <section className="rounded-[2rem] border bg-card p-6"><h2 className="text-xl font-bold">{chart.panchanga ? "Birth panchanga" : "Use timing carefully"}</h2>{chart.panchanga ? <div className="mt-5 space-y-3">{Object.entries(chart.panchanga).map(([key, value]) => <div key={key} className="flex justify-between gap-4 rounded-xl bg-muted/60 p-3 text-sm"><span className="capitalize text-muted-foreground">{key}</span><strong>{value}</strong></div>)}</div> : <p className="mt-3 leading-7 text-muted-foreground">Transit interpretations describe themes that may be useful to reflect on. They do not guarantee events or replace your judgment.</p>}<div className="mt-5 rounded-2xl bg-accent/70 p-4 text-sm leading-6 text-accent-foreground"><strong>No fear-based predictions.</strong> Dharma Quest does not predict death, disease, disaster, or guaranteed relationship and financial outcomes.</div></section>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-5">
          <section className="rounded-[2rem] border bg-card p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 size-5 shrink-0 text-emerald-600" /><div><h2 className="text-xl font-bold">Calculation record</h2><p className="mt-2 max-w-3xl leading-7 text-muted-foreground">These values make the chart reproducible. Interpretations are always downstream of the calculated positions.</p></div></div><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Engine" value={`Swiss Ephemeris ${chart.engineVersion} · browser WASM`} /><Detail label="Settings" value={chart.settingsNote} /><Detail label="Birth time in UTC" value={chart.utcBirthTime.replace(".000Z", "Z")} /><Detail label="Historical offset" value={chart.timezoneOffset} /><Detail label="Julian day" value={chart.julianDay.toFixed(6)} /><Detail label="Ayanamsha" value={chart.ayanamsa === null ? "Not used · tropical zodiac" : `${chart.ayanamsa.toFixed(6)}° · Lahiri`} /></dl>{chart.system === "vedic" && <div className="mt-5 grid gap-3 sm:grid-cols-3"><Detail label="Lahiri ayanamsha" value="A commonly used offset for converting tropical longitudes to the sidereal zodiac." /><Detail label="Whole-sign houses" value="Each zodiac sign forms one complete house, beginning with the Ascendant sign." /><Detail label="Mean lunar node" value="A smoothed mathematical position used here for Rahu and Ketu; other traditions may use the true node." /></div>}<p className="mt-6 text-xs leading-5 text-muted-foreground">The included Moshier ephemeris provides high-accuracy major-planet calculations without sending birth data to a remote chart service. Astrology itself is a traditional interpretive practice and is not scientifically validated as a predictive method.</p></section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BigThreeCard({ icon: Icon, label, placement }: { icon: typeof Sun; label: string; placement: ChartResult["ascendant"] | ChartResult["placements"][number] }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="size-4 text-primary" />{label}</div>{placement ? <><strong className="mt-3 block text-xl">{placement.sign}</strong><span className="mt-1 block text-sm text-muted-foreground">{formatExactPlacement(placement)}{placement.house ? ` · house ${placement.house}` : ""}</span></> : <><strong className="mt-3 block text-lg">Time needed</strong><span className="mt-1 block text-sm text-muted-foreground">Ascendant and houses require a birth time.</span></>}</div>;
}

function ReadingCard({ section }: { section: ChartResult["readings"][number] }) {
  return <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{section.eyebrow}</p><h2 className="mt-2 text-xl font-bold">{section.title}</h2><p className="mt-3 leading-7 text-muted-foreground">{section.body}</p><div className="mt-4 rounded-xl bg-muted/60 p-3 text-sm"><strong className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Based on</strong><span className="mt-1 block font-medium">{section.evidence}</span></div><div className="mt-4 flex items-start gap-2 text-sm leading-6"><Target className="mt-0.5 size-4 shrink-0 text-amber-500" /><span><strong>Try this:</strong> {section.practice}</span></div></article>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-muted/60 p-4"><dt className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">{label}</dt><dd className="mt-2 text-sm leading-6">{value}</dd></div>;
}

function ChartWheel({ chart, animate = false, selected, onSelect }: { chart: ChartResult; animate?: boolean; selected?: string | null; onSelect?: (name: string) => void }) {
  const center = 210;
  const outer = 184;
  const inner = 152;
  const plotRadii = [126, 108, 90];
  const zodiacSymbols = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const point = (longitude: number, radius: number) => {
    const angle = ((longitude - 90) * Math.PI) / 180;
    return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  };
  return (
    <svg className={`chart-wheel mx-auto h-auto w-full max-w-[31rem] text-foreground ${animate ? "is-revealing" : ""}`} viewBox="0 0 420 420" role="group" aria-label={`${chart.system} birth chart wheel with zodiac signs, houses, and planetary placements`}>
      <circle className="chart-outline" pathLength="1" cx={center} cy={center} r={outer} fill="color-mix(in srgb, var(--card) 96%, var(--primary) 4%)" stroke="var(--border)" strokeWidth="2" />
      <circle cx={center} cy={center} r={inner} fill="none" stroke="var(--border)" />
      {Array.from({ length: 12 }, (_, index) => {
        const from = point(index * 30, inner);
        const to = point(index * 30, outer);
        const label = point(index * 30 + 15, 168);
        return <g key={index}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border)" /><text x={label.x} y={label.y + 5} textAnchor="middle" fontSize="17">{zodiacSymbols[index]}</text></g>;
      })}
      {chart.cusps.slice(1).map((cusp, index) => {
        const to = point(cusp, inner);
        const label = point(cusp + 8, 141);
        return <g key={`house-${index}`} className="chart-house" style={{ animationDelay: `${180 + index * 25}ms` }}><line x1={center} y1={center} x2={to.x} y2={to.y} stroke="color-mix(in srgb, var(--primary) 45%, var(--border))" strokeWidth="1" /><text x={label.x} y={label.y + 4} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{index + 1}</text></g>;
      })}
      <circle cx={center} cy={center} r="74" fill="var(--card)" stroke="var(--border)" />
      <text x={center} y={center - 7} textAnchor="middle" fontSize="13" fontWeight="600">{chart.system === "vedic" ? "SIDEREAL" : "TROPICAL"}</text>
      <text x={center} y={center + 14} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">{chart.system === "vedic" ? "Lahiri · whole sign" : chart.settingsNote.split(" · ")[0]}</text>
      {chart.placements.map((placement, index) => {
        const location = point(placement.longitude, plotRadii[index % plotRadii.length]);
        return <g key={placement.name} className={`chart-placement ${selected === placement.name ? "is-selected" : ""}`} style={{ animationDelay: `${420 + Math.floor(index / 3) * 150}ms` }} role="button" tabIndex={0} aria-pressed={selected === placement.name} aria-label={`${placement.name}: ${formatExactPlacement(placement)}. Show reflection.`} onClick={() => onSelect?.(placement.name)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect?.(placement.name); } }}><circle cx={location.x} cy={location.y} r="18" fill="transparent" /><circle className="placement-disc" cx={location.x} cy={location.y} r="12" fill="var(--primary)" opacity={placement.name === "Rahu" || placement.name === "Ketu" ? ".72" : "1"} /><text x={location.x} y={location.y + 5} textAnchor="middle" fontSize="15" fill="var(--primary-foreground)">{placement.symbol}</text><title>{placement.name}: {formatExactPlacement(placement)}{placement.house ? `, house ${placement.house}` : ""}</title></g>;
      })}
    </svg>
  );
}

function ProfileView({ state, setState, setView }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; setView: (view: View) => void }) {
  const progress = Math.round((state.completedLessons.length / lessons.length) * 100);
  const achievements = [
    { label: "First step", detail: "Complete one lesson", earned: state.completedLessons.length >= 1 },
    { label: "Steady path", detail: "Complete three lessons", earned: state.completedLessons.length >= 3 },
    { label: "Gita keeper", detail: "Save a Gita teaching", earned: state.savedVerses.length >= 1 },
    { label: "Inner rhythm", detail: "Practice on three days", earned: state.activeDays.length >= 3 },
    { label: "Jyotisha explorer", detail: "Explore one optional chart", earned: Boolean(state.charts.vedic || state.charts.western) },
  ];
  return (
    <div className="page-view">
      <p className="section-kicker text-sm font-semibold text-primary">Your practice</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{state.name}’s journey</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-3"><div className="rounded-3xl border bg-card p-6"><Flame className="size-6 text-amber-500" /><strong className="mt-4 block text-3xl">{state.streak}</strong><span className="text-sm text-muted-foreground">day rhythm</span></div><div className="rounded-3xl border bg-card p-6"><Sparkles className="size-6 text-primary" /><strong className="mt-4 block text-3xl">{state.wisdom}</strong><span className="text-sm text-muted-foreground">activity points</span><p className="mt-2 text-xs leading-5 text-muted-foreground">A record of participation—not a score for spirituality or belief.</p></div><div className="rounded-3xl border bg-card p-6"><BookOpen className="size-6 text-emerald-600" /><strong className="mt-4 block text-3xl">{progress}%</strong><span className="text-sm text-muted-foreground">course progress</span></div></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border bg-card p-6">
          <h2 className="text-xl font-bold">Learning settings</h2>
          <div className="mt-5 space-y-5">
            <div><label className="text-sm font-semibold" htmlFor="profile-name">Display name <span className="font-normal text-muted-foreground">(optional)</span></label><Input id="profile-name" value={state.name === "Seeker" ? "" : state.name} onChange={(event) => setState((current) => ({ ...current, name: event.target.value.trimStart() || "Seeker" }))} placeholder="Seeker" className="mt-2 h-11 rounded-xl" /></div>
            <div><label className="text-sm font-semibold">Learning style</label><Select value={state.learningStyle} onValueChange={(learningStyle) => setState((current) => ({ ...current, learningStyle }))}><SelectTrigger className="mt-2 h-11 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{learningStyleOptions.map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-semibold">Daily path</label><Select value={String(state.minutes)} onValueChange={(value) => setState((current) => ({ ...current, minutes: Number(value) }))}><SelectTrigger className="mt-2 h-11 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[5, 10, 15].map((minutes) => <SelectItem key={minutes} value={String(minutes)}>{pathLabel(minutes).name} · {minutes} minutes</SelectItem>)}</SelectContent></Select></div>
            <div className="rounded-2xl border bg-muted/25 p-4"><label className="flex items-center justify-between gap-4"><span><strong className="flex items-center gap-2"><Bell className="size-4 text-primary" /> Daily reminder</strong><span className="mt-1 block text-sm leading-6 text-muted-foreground">Opt in to a gentle reminder inside the app.</span></span><Switch checked={state.reminderEnabled} onCheckedChange={(reminderEnabled) => setState((current) => ({ ...current, reminderEnabled }))} /></label><p className="mt-3 text-xs leading-5 text-muted-foreground">A reminder appears when this app is open at or after your preferred time. Saved in this browser; no email or background push notifications are sent.</p>{state.reminderEnabled && <div className="mt-4 border-t pt-4"><label className="text-sm font-semibold" htmlFor="profile-reminder">Preferred time</label><Input id="profile-reminder" type="time" value={state.reminderTime} onChange={(event) => setState((current) => ({ ...current, reminderTime: event.target.value }))} className="mt-2 h-11 rounded-xl" /></div>}</div>
            <div className="flex items-center justify-between gap-4 border-t pt-4"><div><p className="font-semibold">Appearance</p><p className="text-sm text-muted-foreground">Follow your device or choose a theme.</p></div><ThemeControl appearance={state.appearance} onChange={(appearance) => setState((current) => ({ ...current, appearance }))} showLabel /></div>
          </div>
          <Button variant="outline" onClick={() => setState((current) => ({ ...current, onboarded: false }))} className="mt-6 rounded-xl">Edit full onboarding</Button>
        </section>
        <section className="rounded-[2rem] border bg-card p-6">
          <div className="flex items-center gap-2"><Type className="size-5 text-primary" /><h2 className="text-xl font-bold">Accessibility</h2></div>
          <div className="mt-5 space-y-5">
            <label className="flex items-center justify-between gap-4"><span><strong className="block">Larger text</strong><span className="text-sm text-muted-foreground">Increase interface text throughout the app.</span></span><Switch checked={state.textScale === "large"} onCheckedChange={(checked) => setState((current) => ({ ...current, textScale: checked ? "large" : "default" }))} /></label>
            <label className="flex items-center justify-between gap-4 border-t pt-5"><span><strong className="block">Reduce motion</strong><span className="text-sm text-muted-foreground">Use calm static alternatives.</span></span><Switch checked={state.reducedMotion} onCheckedChange={(reducedMotion) => setState((current) => ({ ...current, reducedMotion }))} /></label>
            <label className="flex items-center justify-between gap-4 border-t pt-5"><span><strong className="block">Higher contrast</strong><span className="text-sm text-muted-foreground">Strengthen borders and text contrast.</span></span><Switch checked={state.highContrast} onCheckedChange={(highContrast) => setState((current) => ({ ...current, highContrast }))} /></label>
          </div>
        </section>
      </div>
      <section className="mt-6 rounded-[2rem] border bg-card p-6"><div className="flex items-center gap-2"><Award className="size-5 text-amber-500" /><h2 className="text-xl font-bold">Achievements</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{achievements.map((achievement) => <div key={achievement.label} className={`rounded-2xl border p-4 ${achievement.earned ? "border-amber-500/35 bg-amber-500/10" : "bg-muted/35 opacity-60"}`}><span className={`grid size-9 place-items-center rounded-xl ${achievement.earned ? "bg-amber-500 text-amber-950" : "bg-muted text-muted-foreground"}`}>{achievement.earned ? <Trophy className="size-4" /> : <Lock className="size-4" />}</span><strong className="mt-3 block text-sm">{achievement.label}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{achievement.detail}</span></div>)}</div></section>
      <section className="mt-6 flex flex-col gap-5 rounded-[2rem] border border-dashed bg-card p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-primary">Optional cultural exploration</p><h2 className="mt-1 text-xl font-bold">Explore Jyotisha</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Birth-chart traditions are presented with methods and caveats. They are not required for the course, do not add course progress, and are not scientifically validated.</p></div><Button type="button" variant="outline" onClick={() => setView("jyotisha")} className="shrink-0 rounded-xl"><Orbit /> Open Jyotisha</Button></section>
      <section className="mt-6 rounded-[2rem] border bg-card p-6"><h2 className="text-xl font-bold">Your intentions</h2><div className="mt-5 flex flex-wrap gap-2">{state.goals.map((goal) => { const item = goalOptions.find((option) => option.id === goal); return item ? <span key={goal} className="rounded-full bg-secondary px-3 py-2 text-sm font-medium">{item.label}</span> : null; })}</div><div className="mt-6 rounded-2xl bg-accent/70 p-4 text-sm leading-6 text-accent-foreground"><strong>Your path is still here. Begin again today.</strong> Rest days do not erase what you have learned.</div></section>
    </div>
  );
}

export default function HomePage() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dharma-quest-state-v1");
      if (stored) setState({ ...initialState, ...JSON.parse(stored) });
    } catch {
      // A private browser mode may block storage; the app remains usable in-session.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("dharma-quest-state-v1", JSON.stringify(state));
    } catch {
      // Keep the in-memory experience working when browser storage is unavailable.
    }
  }, [ready, state]);

  useEffect(() => {
    if (!ready || !state.onboarded || !state.reminderEnabled) return;
    const check = () => {
      const today = dayKey();
      const now = new Date();
      const [hours, minutes] = state.reminderTime.split(":").map(Number);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes) || state.lastActive === today || state.lastReminderDay === today || now.getHours() * 60 + now.getMinutes() < hours * 60 + minutes) return;
      setState((current) => ({ ...current, lastReminderDay: today }));
      toast("Your path is here when you’re ready", { description: "A small lesson or a quiet reflection is enough for today." });
    };
    check();
    const timer = window.setInterval(check, 60000);
    return () => window.clearInterval(timer);
  }, [ready, state.onboarded, state.reminderEnabled, state.reminderTime, state.lastActive, state.lastReminderDay]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyAppearance = () => {
      const resolved = state.appearance === "system" ? (media.matches ? "dark" : "light") : state.appearance;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    };
    applyAppearance();
    if (state.appearance !== "system") return;
    media.addEventListener("change", applyAppearance);
    return () => media.removeEventListener("change", applyAppearance);
  }, [state.appearance]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textScale = state.textScale;
    root.dataset.motion = state.reducedMotion ? "reduced" : "full";
    root.dataset.contrast = state.highContrast ? "high" : "standard";
  }, [state.textScale, state.reducedMotion, state.highContrast]);

  const finishOnboarding = (updates: Partial<AppState>) => setState((current) => ({ ...current, ...updates }));

  if (!ready) {
    return <main className="dharma-cosmos grid min-h-screen place-items-center" aria-busy="true"><div className="text-center" role="status"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><LoaderCircle className="size-8 animate-spin" aria-hidden="true" /></span><p className="mt-4 text-sm text-muted-foreground">Preparing your path…</p><div className="mx-auto mt-5 w-44 space-y-2" aria-hidden="true"><span className="block h-2 rounded-full bg-muted" /><span className="mx-auto block h-2 w-32 rounded-full bg-muted" /></div></div></main>;
  }

  return (
    <>
      {state.onboarded ? <AppShell state={state} setState={setState} /> : <Onboarding initial={state} onFinish={finishOnboarding} appearance={state.appearance} onAppearanceChange={(appearance) => setState((current) => ({ ...current, appearance }))} />}
      <Toaster position="top-center" richColors />
    </>
  );
}
