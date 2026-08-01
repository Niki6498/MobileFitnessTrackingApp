import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home, BarChart2, Heart, Target, Users,
  Play, Pause, Square, ChevronDown, X,
  Flame, Activity, Zap, Brain, Moon, Footprints,
  Trophy, ThumbsUp, MessageCircle,
  Waves, Bike, Dumbbell, Music,
  Star, Share2, ChevronRight, Check,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "home" | "summary" | "health" | "progress" | "social";
type AID = "running" | "cycling" | "hiit" | "swimming" | "strength" | "dancing";

interface ActDef {
  id: AID;
  label: string;
  icon: React.ElementType;
  color: string;
  speedFactor: number;
  calFactor: number;
}

interface PastAct {
  id: number;
  type: AID;
  label: string;
  date: string;
  km: number;
  min: number;
  cal: number;
  bpm: number;
  pace: string;
  feel: number;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ACTS: ActDef[] = [
  { id: "running",  label: "Running",       icon: Footprints, color: "#2563EB", speedFactor: 0.18, calFactor: 11 },
  { id: "cycling",  label: "Cycling",       icon: Bike,       color: "#16A34A", speedFactor: 0.45, calFactor: 8  },
  { id: "hiit",     label: "HIIT",          icon: Zap,        color: "#EA580C", speedFactor: 0,    calFactor: 14 },
  { id: "swimming", label: "Swimming",      icon: Waves,      color: "#0284C7", speedFactor: 0.05, calFactor: 10 },
  { id: "strength", label: "Krafttraining", icon: Dumbbell,   color: "#7C3AED", speedFactor: 0,    calFactor: 7  },
  { id: "dancing",  label: "Tanzen",        icon: Music,      color: "#DB2777", speedFactor: 0,    calFactor: 6  },
];

const WEEKLY = [
  { day: "Mo", km: 5.2,  cal: 410 },
  { day: "Di", km: 0,    cal: 0   },
  { day: "Mi", km: 8.1,  cal: 620 },
  { day: "Do", km: 3.5,  cal: 290 },
  { day: "Fr", km: 6.8,  cal: 530 },
  { day: "Sa", km: 12.4, cal: 890 },
  { day: "So", km: 4.2,  cal: 340 },
];

const MONTHLY = [
  { week: "KW 24", km: 28.4, cal: 2100 },
  { week: "KW 25", km: 35.1, cal: 2650 },
  { week: "KW 26", km: 22.0, cal: 1680 },
  { week: "KW 27", km: 40.2, cal: 3010 },
];

const PAST: PastAct[] = [
  { id: 1, type: "running",  label: "Morgen-Lauf",   date: "Heute, 07:15",   km: 5.2,  min: 28, cal: 312, bpm: 156, pace: "5:23", feel: 4 },
  { id: 2, type: "cycling",  label: "Rennrad Tour",  date: "Gestern, 17:30", km: 28.4, min: 68, cal: 720, bpm: 148, pace: "2:24", feel: 5 },
  { id: 3, type: "hiit",     label: "HIIT Kurs",     date: "Sa, 09:00",      km: 0,    min: 45, cal: 580, bpm: 172, pace: "–",    feel: 3 },
  { id: 4, type: "strength", label: "Upper Body",    date: "Fr, 18:45",      km: 0,    min: 55, cal: 320, bpm: 138, pace: "–",    feel: 4 },
  { id: 5, type: "swimming", label: "Bahnen",        date: "Do, 07:00",      km: 2.4,  min: 40, cal: 410, bpm: 142, pace: "1:40", feel: 5 },
];

const FRIENDS = [
  { id: 1, name: "Lena M.",  ini: "LM", online: true,  km: 42.1, streak: 12, chal: true  },
  { id: 2, name: "Tom B.",   ini: "TB", online: false, km: 38.5, streak: 8,  chal: false },
  { id: 3, name: "Sara K.",  ini: "SK", online: true,  km: 51.2, streak: 21, chal: true  },
  { id: 4, name: "Nico P.",  ini: "NP", online: false, km: 29.8, streak: 4,  chal: false },
];

const FEED = [
  { id: 1, user: "Lena M.", ini: "LM", type: "running"  as AID, text: "10km PB – 48:32 min! Neue Bestzeit 🎉",           time: "vor 2h",  km: 10.0, cal: 620,  likes: 14, comments: 3 },
  { id: 2, user: "Sara K.", ini: "SK", type: "cycling"  as AID, text: "Samstagstour durchs Tal. Absolutes Traumwetter!", time: "vor 5h",  km: 45.2, cal: 1100, likes: 22, comments: 7 },
  { id: 3, user: "Tom B.",  ini: "TB", type: "strength" as AID, text: "Neues Max beim Bankdrücken – 100 kg! 💪",         time: "gestern", km: 0,    cal: 290,  likes: 9,  comments: 2 },
];

const SUGGESTED = [
  { id: 1, title: "5K Tempo Run",    type: "running"  as AID, dur: "28 min", cal: 310, lvl: "Mittel" },
  { id: 2, title: "Core Blast HIIT", type: "hiit"     as AID, dur: "20 min", cal: 240, lvl: "Hart"   },
  { id: 3, title: "Easy Ride",       type: "cycling"  as AID, dur: "45 min", cal: 380, lvl: "Leicht" },
];

const GOALS = [
  { id: 1, label: "Wöchentliche Distanz",  cur: 36.2, max: 50,   unit: "km",        color: "#2563EB" },
  { id: 2, label: "Kalorien",              cur: 2480, max: 3500, unit: "kcal",       color: "#EA580C" },
  { id: 3, label: "Trainingseinheiten",    cur: 4,    max: 5,    unit: "Einheiten",  color: "#16A34A" },
  { id: 4, label: "Aktive Minuten",        cur: 186,  max: 250,  unit: "min",        color: "#7C3AED" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const p2 = (n: number) => String(Math.floor(n)).padStart(2, "0");
const fmtT = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${p2(h)}:${p2(m)}:${p2(sec)}` : `${p2(m)}:${p2(sec)}`;
};
const getA = (id: string) => ACTS.find(a => a.id === id) ?? ACTS[0];

// ─── Shared primitives ────────────────────────────────────────────────────────

const MONO = "'JetBrains Mono', monospace";

function Glass({
  children, className = "", glow = false, style = {}, onClick,
}: { children: React.ReactNode; className?: string; glow?: boolean; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.82)",
        borderColor: "rgba(99,102,241,0.12)",
        boxShadow: glow
          ? "0 0 32px rgba(37,99,235,0.14), 0 2px 20px rgba(0,0,0,0.06)"
          : "0 2px 20px rgba(0,0,0,0.06)",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Avi({ ini, online, size = 10 }: { ini: string; online?: boolean; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size * 4, height: size * 4 }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-bold text-white select-none"
        style={{ fontSize: size * 1.2, background: "linear-gradient(135deg,#003EBF,#2563EB)" }}
      >
        {ini}
      </div>
      {online && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{ width: 11, height: 11, background: "#16A34A", borderColor: "#EDF2FF" }}
        />
      )}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 mt-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={9} fill={i<=n?"#D97706":"none"} stroke={i<=n?"#D97706":"#CBD5E1"} />
      ))}
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{ background: color + "1A", color }}>
      {label}
    </span>
  );
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs"
      style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderColor: "rgba(0,0,0,0.09)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <p className="mb-1" style={{ color: "#94A3B8" }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.value} {p.name}</p>)}
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home"     as Page, Icon: Home,     label: "Home"    },
  { id: "summary"  as Page, Icon: BarChart2, label: "Summary" },
  { id: "health"   as Page, Icon: Heart,    label: "Health"  },
  { id: "progress" as Page, Icon: Target,   label: "Ziele"   },
  { id: "social"   as Page, Icon: Users,    label: "Social"  },
];

function NavBar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <div className="flex items-center justify-around px-1 py-2 border-t shrink-0"
      style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderColor: "rgba(0,0,0,0.07)" }}>
      {NAV_ITEMS.map(({ id, Icon, label }) => {
        const on = id === page;
        return (
          <button key={id} onClick={() => setPage(id)} className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl">
            {on && (
              <motion.div layoutId="nb" className="absolute inset-0 rounded-xl"
                style={{ background: "rgba(37,99,235,0.09)" }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }} />
            )}
            <Icon size={21} style={{ color: on ? "#2563EB" : "#94A3B8", filter: on ? "drop-shadow(0 0 6px rgba(37,99,235,0.45))" : "none", transition: "all .2s" }} />
            <span className="text-[10px] font-semibold" style={{ color: on ? "#2563EB" : "#94A3B8", transition: "color .2s" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function HomePage({ onStart }: { onStart: (t: AID) => void }) {
  const [sel, setSel] = useState<AID>("running");
  const [open, setOpen] = useState(false);
  const act = getA(sel);
  const AI = act.icon;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#64748B" }}>Samstag, 26. Juli</p>
          <h1 className="text-[22px] font-black mt-0.5" style={{ color: "#0F172A" }}>Hey, Max 👋</h1>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white border-2"
          style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)", borderColor: "#2563EB", boxShadow: "0 0 14px rgba(37,99,235,0.30)" }}>
          MK
        </div>
      </div>

      {/* ── Activity starter ── */}
      <Glass glow className="p-4">
        <p className="text-[10px] uppercase tracking-[.13em] font-semibold mb-3" style={{ color: "#94A3B8" }}>Training starten</p>

        {/* Dropdown */}
        <div className="relative mb-3">
          <button onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
            style={{ background: "rgba(248,250,252,1)", borderColor: "rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: act.color + "1E" }}>
                <AI size={18} style={{ color: act.color }} />
              </div>
              <span className="font-bold text-[15px]" style={{ color: "#0F172A" }}>{act.label}</span>
            </div>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
              <ChevronDown size={17} style={{ color: "#94A3B8" }} />
            </motion.span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, y: -6, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: .97 }} transition={{ duration: 0.13 }}
                className="absolute z-20 w-full top-full mt-2 rounded-2xl border overflow-hidden"
                style={{ background: "rgba(255,255,255,0.99)", borderColor: "rgba(0,0,0,0.09)", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}>
                {ACTS.map(a => {
                  const BI = a.icon;
                  return (
                    <button key={a.id} onClick={() => { setSel(a.id); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                      style={{ background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: a.color + "1A" }}>
                        <BI size={15} style={{ color: a.color }} />
                      </div>
                      <span className="text-[13px] font-medium flex-1 text-left" style={{ color: "#334155" }}>{a.label}</span>
                      {a.id === sel && <Check size={13} style={{ color: "#2563EB" }} />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Start button */}
        <motion.button whileTap={{ scale: .96 }} onClick={() => onStart(sel)}
          className="w-full py-4 rounded-2xl font-extrabold text-[15px] text-white flex items-center justify-center gap-2 relative overflow-hidden tracking-wide"
          style={{ background: "linear-gradient(130deg,#1D4ED8,#7C3AED 55%,#EC4899)", boxShadow: "0 0 32px rgba(37,99,235,0.35),0 4px 20px rgba(0,0,0,0.12)" }}>
          <div className="absolute inset-0 opacity-25"
            style={{ background: "radial-gradient(ellipse at 75% 40%,rgba(255,255,255,.40) 0%,transparent 65%)" }} />
          <Play size={17} fill="white" />
          TRAINING STARTEN
        </motion.button>
      </Glass>

      {/* Readiness */}
      <Glass className="p-4 flex items-center gap-4">
        <div className="relative w-[88px] h-[88px] shrink-0">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r="34" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8"/>
            <circle cx="44" cy="44" r="34" fill="none" stroke="url(#rdg)" strokeWidth="8"
              strokeDasharray={`${2*Math.PI*34*0.82} ${2*Math.PI*34}`} strokeLinecap="round"/>
            <defs>
              <linearGradient id="rdg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1D4ED8"/><stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black leading-none" style={{ color: "#2563EB", fontFamily: MONO }}>82</span>
            <span className="text-[9px] mt-0.5" style={{ color: "#94A3B8" }}>/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-[14px]" style={{ color: "#0F172A" }}>Trainingsbereitschaft</p>
          <p className="text-xs mt-1 leading-snug" style={{ color: "#64748B" }}>Guter Tag für intensives Training</p>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
            <div className="h-full rounded-full" style={{ width:"82%", background:"linear-gradient(90deg,#1D4ED8,#3B82F6)" }}/>
          </div>
          <p className="text-[10px] mt-1.5 font-semibold" style={{ color:"#2563EB" }}>Sehr gut ↑ vs. gestern</p>
        </div>
      </Glass>

      {/* Suggested */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[14px]" style={{ color: "#0F172A" }}>Vorgeschlagene Trainings</p>
          <button className="text-xs font-semibold" style={{ color:"#2563EB" }}>Alle</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
          {SUGGESTED.map(s => {
            const sa = getA(s.type); const SI = sa.icon;
            return (
              <Glass key={s.id} className="shrink-0 w-44 p-3 cursor-pointer">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: sa.color + "1A" }}>
                  <SI size={18} style={{ color: sa.color }} />
                </div>
                <p className="font-bold text-[13px] leading-tight" style={{ color: "#0F172A" }}>{s.title}</p>
                <p className="text-[11px] mt-1" style={{ color: "#64748B" }}>{s.dur} · {s.cal} kcal</p>
                <Pill label={s.lvl} color={sa.color} />
              </Glass>
            );
          })}
        </div>
      </div>

      {/* Recent */}
      <div>
        <p className="font-bold text-[14px] mb-3" style={{ color: "#0F172A" }}>Letzte Aktivitäten</p>
        <div className="flex flex-col gap-2.5">
          {PAST.slice(0,3).map(p => {
            const pa = getA(p.type); const PI = pa.icon;
            return (
              <Glass key={p.id} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: pa.color + "1A" }}>
                  <PI size={17} style={{ color: pa.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "#0F172A" }}>{p.label}</p>
                  <p className="text-[11px]" style={{ color: "#64748B" }}>{p.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold" style={{ color: "#0F172A", fontFamily:MONO }}>{p.min} min</p>
                  <p className="text-[11px]" style={{ color: "#64748B" }}>{p.cal} kcal</p>
                </div>
              </Glass>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVE WORKOUT ───────────────────────────────────────────────────────────

function WorkoutScreen({ type, onStop }: { type: AID; onStop: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const act = getA(type); const WI = act.icon;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const km = parseFloat((elapsed / 60 * act.speedFactor).toFixed(2));
  const cal = Math.floor(elapsed / 60 * act.calFactor);
  const bpm = Math.min(192, 130 + Math.floor(elapsed / 10) + Math.floor(Math.sin(elapsed * .07) * 5));
  const paceStr = km > 0.01 ? `${Math.floor((elapsed/60)/km)}:${p2(Math.floor(((elapsed/60)/km%1)*60))}` : "–";

  const metrics = [
    { label:"Distanz",      val: act.speedFactor > 0 ? `${km.toFixed(2)}` : "–", unit:"km",     col:"#2563EB" },
    { label:"Pace",         val: paceStr,                                          unit:"min/km", col:"#16A34A" },
    { label:"Herzfrequenz", val: `${bpm}`,                                         unit:"bpm",    col:"#EA580C" },
    { label:"Kalorien",     val: `${cal}`,                                         unit:"kcal",   col:"#7C3AED" },
  ];

  return (
    <div className="flex flex-col h-full"
      style={{ background:"linear-gradient(160deg,rgba(37,99,235,0.08) 0%,#F5F8FF 45%)" }}>
      {/* Top */}
      <div className="flex items-center justify-between px-5 pt-10 pb-3">
        <button onClick={onStop} className="w-9 h-9 rounded-full flex items-center justify-center border"
          style={{ background:"rgba(0,0,0,0.04)", borderColor:"rgba(0,0,0,0.10)" }}>
          <X size={16} style={{ color: "#64748B" }} />
        </button>
        <div className="flex items-center gap-2">
          <motion.div animate={{ opacity:[1,.3,1] }} transition={{ duration:1.4,repeat:Infinity }}
            className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#94A3B8" }}>Live</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Activity icon */}
      <div className="flex flex-col items-center py-4">
        <motion.div
          animate={{ boxShadow:[`0 0 20px ${act.color}40`,`0 0 44px ${act.color}60`,`0 0 20px ${act.color}40`] }}
          transition={{ duration:2.2,repeat:Infinity }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{ background: act.color + "1E" }}>
          <WI size={26} style={{ color: act.color }} />
        </motion.div>
        <p className="text-sm font-semibold" style={{ color: "#64748B" }}>{act.label}</p>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center mb-8">
        <p className="text-[10px] uppercase tracking-[.18em] font-semibold mb-2" style={{ color: "#94A3B8" }}>Aktive Zeit</p>
        <motion.div key={Math.floor(elapsed/60)} initial={{ scale:1.05 }} animate={{ scale:1 }} transition={{ duration:.28 }}
          className="text-[72px] font-black tracking-tight leading-none tabular-nums"
          style={{ color: "#0F172A", fontFamily:MONO }}>
          {fmtT(elapsed)}
        </motion.div>
        <p className="text-xs mt-2" style={{ color: paused ? "#94A3B8" : "#CBD5E1" }}>{paused ? "⏸ Pausiert" : "Läuft…"}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-8">
        {metrics.map(m => (
          <Glass key={m.label} className="p-3.5 text-center">
            <p className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "#64748B" }}>{m.label}</p>
            <p className="text-[26px] font-black leading-none" style={{ color:m.col, fontFamily:MONO }}>{m.val}</p>
            <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{m.unit}</p>
          </Glass>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-auto mb-12">
        <motion.button whileTap={{ scale:.91 }} onClick={() => setPaused(!paused)}
          className="w-16 h-16 rounded-full flex items-center justify-center border"
          style={{ background:"rgba(0,0,0,0.05)", borderColor:"rgba(0,0,0,0.10)" }}>
          {paused
            ? <Play size={22} fill="#0F172A" style={{ color: "#0F172A" }}/>
            : <Pause size={22} style={{ color: "#0F172A" }}/>}
        </motion.button>
        <motion.button whileTap={{ scale:.91 }} onClick={onStop}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background:"linear-gradient(135deg,#B80040,#FF1155)", boxShadow:"0 0 28px rgba(255,30,80,0.40)" }}>
          <Square size={22} fill="white" className="text-white"/>
        </motion.button>
        <div className="w-16 h-16"/>
      </div>
    </div>
  );
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

function SummaryPage() {
  const [period, setPeriod] = useState<"week"|"month">("week");
  const [metric, setMetric] = useState<"km"|"cal">("km");
  const [detail, setDetail] = useState<PastAct|null>(null);

  const data = period === "week" ? WEEKLY : MONTHLY;
  const xKey = period === "week" ? "day" : "week";
  const totKm   = PAST.reduce((s,a) => s + a.km, 0).toFixed(1);
  const totCal  = PAST.reduce((s,a) => s + a.cal, 0);
  const totMin  = PAST.reduce((s,a) => s + a.min, 0);

  return (
    <>
      <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-black" style={{ color: "#0F172A" }}>Aktivitäten</h1>
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:"rgba(0,0,0,0.08)" }}>
            {(["week","month"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3.5 py-1.5 text-xs font-bold transition-colors"
                style={{ background: period===p ? "rgba(37,99,235,0.10)" : "transparent", color: period===p ? "#2563EB" : "#94A3B8" }}>
                {p==="week" ? "Woche" : "Monat"}
              </button>
            ))}
          </div>
        </div>

        {/* Totals row */}
        <div className="grid grid-cols-3 gap-2">
          {[{l:"Distanz",v:totKm,u:"km"},{l:"Kalorien",v:totCal,u:"kcal"},{l:"Zeit",v:totMin,u:"min"}].map(s => (
            <Glass key={s.l} className="p-3 text-center">
              <p className="font-black text-[16px] leading-tight" style={{ color: "#0F172A", fontFamily:MONO }}>{s.v}</p>
              <p className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: "#94A3B8" }}>{s.u}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{s.l}</p>
            </Glass>
          ))}
        </div>

        {/* Chart */}
        <Glass className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[.12em] font-semibold" style={{ color: "#94A3B8" }}>
              {period==="week" ? "Diese Woche" : "Diesen Monat"}
            </p>
            <div className="flex gap-1.5">
              {(["km","cal"] as const).map(m => (
                <button key={m} onClick={() => setMetric(m)}
                  className="text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors"
                  style={{ background: metric===m ? "rgba(37,99,235,0.10)" : "transparent", color: metric===m ? "#2563EB" : "#94A3B8" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={data} margin={{ top:4,right:4,left:-22,bottom:0 }}>
              <defs>
                <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.20}/>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey={xKey} tick={{ fill:"#94A3B8",fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#94A3B8",fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey={metric} stroke="#2563EB" strokeWidth={2} fill="url(#bg1)"
                name={metric==="km"?"km":"kcal"} dot={false}
                activeDot={{ r:4,fill:"#2563EB",stroke:"#EDF2FF" }}/>
            </AreaChart>
          </ResponsiveContainer>
        </Glass>

        {/* List */}
        <div>
          <p className="font-bold text-[14px] mb-3" style={{ color: "#0F172A" }}>Alle Aktivitäten</p>
          <div className="flex flex-col gap-2.5">
            {PAST.map(p => {
              const pa = getA(p.type); const PI = pa.icon;
              return (
                <motion.button key={p.id} whileTap={{ scale:.985 }} onClick={() => setDetail(p)} className="w-full text-left">
                  <Glass className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: pa.color+"1A" }}>
                      <PI size={17} style={{ color:pa.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: "#0F172A" }}>{p.label}</p>
                      <p className="text-[10px]" style={{ color: "#64748B" }}>{p.date}</p>
                      <Stars n={p.feel}/>
                    </div>
                    <div className="text-right shrink-0 mr-1">
                      <p className="text-[13px] font-bold" style={{ color: "#0F172A", fontFamily:MONO }}>{p.min} min</p>
                      <p className="text-[11px]" style={{ color: "#64748B" }}>{p.cal} kcal</p>
                    </div>
                    <ChevronRight size={13} style={{ color: "#CBD5E1" }} className="shrink-0"/>
                  </Glass>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end max-w-[390px] mx-auto"
            style={{ background:"rgba(15,23,42,0.40)", backdropFilter:"blur(8px)" }}
            onClick={() => setDetail(null)}>
            <motion.div initial={{ y:320 }} animate={{ y:0 }} exit={{ y:320 }}
              transition={{ type:"spring",damping:30,stiffness:320 }}
              className="rounded-t-3xl border-t p-5 pb-9"
              style={{ background:"rgba(255,255,255,0.99)", backdropFilter:"blur(28px)", borderColor:"rgba(0,0,0,0.08)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(0,0,0,0.10)" }}/>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {(() => { const da = getA(detail.type); const DI = da.icon; return (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:da.color+"1E" }}>
                      <DI size={20} style={{ color:da.color }}/>
                    </div>
                  ); })()}
                  <div>
                    <p className="font-bold text-[15px]" style={{ color: "#0F172A" }}>{detail.label}</p>
                    <p className="text-[11px]" style={{ color: "#64748B" }}>{detail.date}</p>
                  </div>
                </div>
                <button onClick={() => setDetail(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border"
                  style={{ background:"rgba(0,0,0,0.04)", borderColor:"rgba(0,0,0,0.08)" }}>
                  <X size={14} style={{ color: "#94A3B8" }}/>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { l:"Dauer",       v:`${detail.min} min`,                      c:"#2563EB" },
                  { l:"Distanz",     v:detail.km>0?`${detail.km} km`:"–",        c:"#16A34A" },
                  { l:"Herzfreq.",   v:`${detail.bpm} bpm`,                      c:"#EA580C" },
                  { l:"Kalorien",    v:`${detail.cal} kcal`,                     c:"#7C3AED" },
                  { l:"Pace",        v:detail.pace,                              c:"#0284C7" },
                  { l:"Wertung",     v:`${detail.feel} / 5`,                     c:"#D97706" },
                ].map(m => (
                  <div key={m.l} className="rounded-xl p-3 border"
                    style={{ background:"rgba(241,245,249,0.80)", borderColor:"rgba(0,0,0,0.06)" }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "#94A3B8" }}>{m.l}</p>
                    <p className="text-[18px] font-black leading-none" style={{ color:m.c, fontFamily:MONO }}>{m.v}</p>
                  </div>
                ))}
              </div>

              {/* Mini HR chart */}
              <div className="rounded-xl border p-3" style={{ background:"rgba(241,245,249,0.80)", borderColor:"rgba(0,0,0,0.06)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-2.5 font-medium" style={{ color: "#94A3B8" }}>Herzfrequenz-Verlauf</p>
                <ResponsiveContainer width="100%" height={58}>
                  <AreaChart
                    data={[{t:"0",v:95},{t:"5",v:detail.bpm-22},{t:"10",v:detail.bpm-8},
                           {t:"15",v:detail.bpm+2},{t:"20",v:detail.bpm+10},{t:"25",v:detail.bpm-5},{t:"30",v:108}]
                      .slice(0, Math.ceil(detail.min/4)+1)}
                    margin={{ top:2,right:4,left:-36,bottom:0 }}>
                    <defs>
                      <linearGradient id="hrg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EA580C" stopOpacity={0.22}/>
                        <stop offset="100%" stopColor="#EA580C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#EA580C" strokeWidth={1.5} fill="url(#hrg)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────

function HealthPage() {
  const steps = 7842, stepsGoal = 10000, pct = steps / stepsGoal;
  const circ = 2 * Math.PI * 34;
  const sleep = [
    { n:"Leicht", h:1.5, c:"#3B82F6" },
    { n:"Tief",   h:2.2, c:"#1D4ED8" },
    { n:"REM",    h:1.8, c:"#7C3AED" },
    { n:"Wach",   h:0.5, c:"#CBD5E1" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
      <h1 className="text-[22px] font-black" style={{ color: "#0F172A" }}>Gesundheit</h1>

      {/* Steps */}
      <Glass className="p-4 flex items-center gap-4">
        <div className="relative w-[88px] h-[88px] shrink-0">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r="34" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8"/>
            <circle cx="44" cy="44" r="34" fill="none" stroke="url(#sg)" strokeWidth="8"
              strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round"/>
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1D4ED8"/><stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Footprints size={13} style={{ color:"#2563EB" }}/>
            <span className="font-black text-[11px] leading-none mt-0.5" style={{ color: "#0F172A", fontFamily:MONO }}>
              {steps.toLocaleString("de")}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-[14px]" style={{ color: "#0F172A" }}>Schritte heute</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Ziel: {stepsGoal.toLocaleString("de")}</p>
          <div className="mt-2.5">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span style={{ color: "#64748B" }}>Fortschritt</span>
              <span style={{ color:"#2563EB" }}>{Math.round(pct*100)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
              <div className="h-full rounded-full" style={{ width:`${pct*100}%`, background:"linear-gradient(90deg,#1D4ED8,#3B82F6)" }}/>
            </div>
          </div>
          <p className="text-[10px] mt-2" style={{ color: "#94A3B8" }}>≈ {(steps*0.000762).toFixed(1)} km · {Math.floor(steps*0.04)} kcal</p>
        </div>
      </Glass>

      {/* Sleep */}
      <Glass className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon size={15} style={{ color:"#7C3AED" }}/>
            <p className="font-bold text-[14px]" style={{ color: "#0F172A" }}>Schlaf</p>
          </div>
          <Pill label="Gut" color="#16A34A"/>
        </div>
        <div className="flex items-baseline gap-0.5 mb-4">
          <span className="text-4xl font-black" style={{ color: "#0F172A", fontFamily:MONO }}>6</span>
          <span className="text-sm mb-0.5" style={{ color: "#64748B" }}>h </span>
          <span className="text-4xl font-black" style={{ color: "#0F172A", fontFamily:MONO }}>00</span>
          <span className="text-sm mb-0.5" style={{ color: "#64748B" }}> min</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {sleep.map(s => (
            <div key={s.n} className="rounded-full" style={{ flex:s.h, background:s.c }}/>
          ))}
        </div>
        <div className="flex gap-3 mt-2.5 flex-wrap">
          {sleep.map(s => (
            <div key={s.n} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background:s.c }}/>
              <span className="text-[10px]" style={{ color: "#64748B" }}>{s.n}</span>
            </div>
          ))}
        </div>
      </Glass>

      {/* Activity + Stress */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:"Aktivitätslevel", val:74, text:"Aktiv",    Icon:Activity, col:"#16A34A", grad:"#059669,#16A34A" },
          { label:"Stresslevel",     val:32, text:"Niedrig",  Icon:Brain,    col:"#DB2777", grad:"#9D174D,#DB2777" },
        ].map(c => {
          const CI = c.Icon;
          return (
            <Glass key={c.label} className="p-3.5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <CI size={13} style={{ color:c.col }}/>
                <p className="text-[11px] font-semibold" style={{ color: "#64748B" }}>{c.label}</p>
              </div>
              <p className="text-3xl font-black mb-0.5 leading-none" style={{ color: "#0F172A", fontFamily:MONO }}>{c.val}</p>
              <p className="text-xs font-semibold mb-2.5" style={{ color:c.col }}>{c.text}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                <div className="h-full rounded-full" style={{ width:`${c.val}%`, background:`linear-gradient(90deg,${c.grad})` }}/>
              </div>
            </Glass>
          );
        })}
      </div>

      {/* Calories */}
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={15} style={{ color:"#EA580C" }}/>
          <p className="font-bold text-[14px]" style={{ color: "#0F172A" }}>Kalorien heute</p>
        </div>
        <div className="flex justify-around text-center">
          {[{l:"Verbrannt",v:1840,c:"#EA580C"},{l:"Aufgenommen",v:2200,c:"#0284C7"},{l:"Netto",v:360,c:"#16A34A"}].map(c => (
            <div key={c.l}>
              <p className="text-[22px] font-black leading-none" style={{ color:c.c, fontFamily:MONO }}>{c.v}</p>
              <p className="text-[9px] mt-1.5 uppercase tracking-wide" style={{ color: "#94A3B8" }}>{c.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
          <div className="h-full rounded-full" style={{ width:`${(1840/2200)*100}%`, background:"linear-gradient(90deg,#C2410C,#EA580C)" }}/>
        </div>
      </Glass>

      {/* HRV */}
      <Glass className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background:"rgba(239,68,68,0.12)" }}>
          <Heart size={22} style={{ color:"#EF4444" }} fill="rgba(239,68,68,0.28)"/>
        </div>
        <div className="flex-1">
          <p className="font-bold text-[13px]" style={{ color: "#0F172A" }}>Herzratenvariabilität</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Ruhezustand · Heute Nacht</p>
        </div>
        <div className="text-right">
          <p className="text-[26px] font-black leading-none" style={{ color: "#0F172A", fontFamily:MONO }}>58</p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>ms</p>
        </div>
      </Glass>
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

function ProgressPage() {
  const days = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  const today = 4;
  const done  = [true,false,true,true,true,false,false];

  const trend = [
    { w:"KW 24",km:28 },{ w:"KW 25",km:35 },
    { w:"KW 26",km:22 },{ w:"KW 27",km:40 },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
      <h1 className="text-[22px] font-black" style={{ color: "#0F172A" }}>Fortschritt</h1>

      {/* Streak */}
      <Glass glow className="p-4 flex items-center gap-4"
        style={{ boxShadow:"0 0 32px rgba(249,115,22,0.12),0 2px 20px rgba(0,0,0,0.06)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-center"
          style={{ background:"linear-gradient(135deg,rgba(249,115,22,0.20),rgba(239,68,68,0.15))", boxShadow:"0 0 20px rgba(249,115,22,0.22)" }}>
          <div>
            <p className="text-[28px] font-black leading-none" style={{ color: "#0F172A", fontFamily:MONO }}>21</p>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color:"#EA580C" }}>Tage</p>
          </div>
        </div>
        <div>
          <p className="font-bold text-[15px]" style={{ color: "#0F172A" }}>Aktive Serie 🔥</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>21 Tage in Folge trainiert</p>
          <p className="text-[11px] font-semibold mt-1.5" style={{ color:"#EA580C" }}>Persönlicher Rekord!</p>
        </div>
      </Glass>

      {/* Week dots */}
      <Glass className="p-4">
        <p className="text-[10px] uppercase tracking-[.12em] font-semibold mb-3" style={{ color: "#94A3B8" }}>Diese Woche</p>
        <div className="flex justify-between">
          {days.map((d,i) => {
            const hit = done[i] && i <= today;
            const miss = !done[i] && i <= today;
            return (
              <div key={d} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>{d}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: hit ? "linear-gradient(135deg,#1D4ED8,#3B82F6)" : "rgba(0,0,0,0.05)",
                    border: i === today ? "2px solid #2563EB" : "none",
                    boxShadow: hit ? "0 0 12px rgba(37,99,235,0.35)" : "none",
                  }}>
                  {hit && <Check size={13} className="text-white"/>}
                  {miss && <X size={11} style={{ color: "#94A3B8" }}/>}
                </div>
              </div>
            );
          })}
        </div>
      </Glass>

      {/* Goals */}
      <div>
        <p className="font-bold text-[14px] mb-3" style={{ color: "#0F172A" }}>Wochenziele</p>
        <div className="flex flex-col gap-2.5">
          {GOALS.map(g => {
            const p = Math.min(g.cur / g.max, 1);
            return (
              <Glass key={g.id} className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[13px] font-semibold" style={{ color: "#0F172A" }}>{g.label}</p>
                  <span className="text-[11px] font-bold" style={{ color:g.color }}>{Math.round(p*100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${p*100}%` }}
                      transition={{ duration:0.9,ease:"easeOut",delay:0.1 }}
                      className="h-full rounded-full"
                      style={{ background:`linear-gradient(90deg,${g.color}55,${g.color})` }}/>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: "#94A3B8", fontFamily:MONO }}>
                    {g.cur}/{g.max}
                  </span>
                </div>
                <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{g.unit}</p>
              </Glass>
            );
          })}
        </div>
      </div>

      {/* Trend chart */}
      <Glass className="p-4">
        <p className="text-[10px] uppercase tracking-[.12em] font-semibold mb-3" style={{ color: "#94A3B8" }}>4-Wochen Trend · Distanz</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={trend} margin={{ top:4,right:4,left:-24,bottom:0 }}>
            <XAxis dataKey="w" tick={{ fill:"#94A3B8",fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:"#94A3B8",fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTip/>}/>
            <Bar dataKey="km" radius={[5,5,0,0]} name="km" fill="#2563EB" opacity={0.65}/>
          </BarChart>
        </ResponsiveContainer>
      </Glass>

      {/* Records */}
      <div>
        <p className="font-bold text-[14px] mb-3" style={{ color: "#0F172A" }}>Persönliche Rekorde</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { l:"Längster Lauf",   v:"14.2 km",    I:Footprints, c:"#2563EB" },
            { l:"Schnellste Pace", v:"4:38 /km",   I:Zap,        c:"#EA580C" },
            { l:"Max. Kalorien",   v:"1.140 kcal", I:Flame,      c:"#16A34A" },
            { l:"Längste Serie",   v:"21 Tage",    I:Trophy,     c:"#D97706" },
          ].map(r => {
            const RI = r.I;
            return (
              <Glass key={r.l} className="p-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background:r.c+"1A" }}>
                  <RI size={15} style={{ color:r.c }}/>
                </div>
                <p className="font-black text-[14px] leading-none" style={{ color: "#0F172A", fontFamily:MONO }}>{r.v}</p>
                <p className="text-[10px] mt-1" style={{ color: "#64748B" }}>{r.l}</p>
              </Glass>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SOCIAL ───────────────────────────────────────────────────────────────────

function SocialPage() {
  const [view, setView] = useState<"friends"|"feed">("friends");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const toggle = (id: number) => setLiked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-black" style={{ color: "#0F172A" }}>Social</h1>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:"rgba(0,0,0,0.08)" }}>
          {(["friends","feed"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3.5 py-1.5 text-xs font-bold transition-colors"
              style={{ background:view===v?"rgba(37,99,235,0.10)":"transparent", color:view===v?"#2563EB":"#94A3B8" }}>
              {v==="friends" ? "Freunde" : "Feed"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "friends" ? (
          <motion.div key="f" initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:10 }}
            transition={{ duration:0.16 }} className="flex flex-col gap-3">

            {/* Challenge card */}
            <Glass glow className="p-4"
              style={{ boxShadow:"0 0 28px rgba(217,119,6,0.10),0 2px 20px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <Trophy size={16} style={{ color:"#D97706" }}/>
                <p className="font-bold text-[14px]" style={{ color: "#0F172A" }}>Weekly Challenge</p>
                <Pill label="Aktiv" color="#D97706"/>
              </div>
              <p className="text-xs mb-3" style={{ color: "#64748B" }}>Wer läuft diese Woche die meisten Kilometer?</p>
              <div className="flex flex-col gap-2.5">
                {[
                  ...FRIENDS.filter(f => f.chal).map(f => ({ name:f.name, ini:f.ini, km:f.km })),
                  { name:"Du", ini:"MK", km:36.2 },
                ].map((r,i) => (
                  <div key={r.name} className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold w-4 text-center"
                      style={{ color:i===0?"#D97706":"#94A3B8" }}>{i+1}.</span>
                    <Avi ini={r.ini} size={9}/>
                    <p className="text-[12px] font-medium flex-1" style={{ color: "#0F172A" }}>{r.name}</p>
                    <p className="text-[12px] font-bold" style={{ color:"#2563EB", fontFamily:MONO }}>{r.km} km</p>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Friends list */}
            {FRIENDS.map(f => (
              <Glass key={f.id} className="flex items-center gap-3 p-3">
                <Avi ini={f.ini} online={f.online}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "#0F172A" }}>{f.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>🔥 {f.streak} Tage · {f.km} km diese Woche</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {f.online && <span className="text-[10px] font-semibold text-emerald-600">● Online</span>}
                  {f.chal && <Pill label="Challenge" color="#D97706"/>}
                </div>
              </Glass>
            ))}
          </motion.div>
        ) : (
          <motion.div key="d" initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-10 }}
            transition={{ duration:0.16 }} className="flex flex-col gap-4">
            {FEED.map(item => {
              const fa = getA(item.type); const FI = fa.icon;
              const isLiked = liked.has(item.id);
              return (
                <Glass key={item.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avi ini={item.ini}/>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold" style={{ color: "#0F172A" }}>{item.user}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background:fa.color+"1A", color:fa.color }}>
                          <FI size={9}/> {fa.label}
                        </div>
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>{item.time}</span>
                      </div>
                    </div>
                    <button className="w-7 h-7 rounded-full flex items-center justify-center border"
                      style={{ background:"rgba(0,0,0,0.03)", borderColor:"rgba(0,0,0,0.07)" }}>
                      <Share2 size={11} style={{ color: "#94A3B8" }}/>
                    </button>
                  </div>

                  <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#334155" }}>{item.text}</p>

                  {(item.km > 0 || item.cal > 0) && (
                    <div className="flex gap-5 mb-3 py-2.5 border-y" style={{ borderColor:"rgba(0,0,0,0.06)" }}>
                      {item.km > 0 && (
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: "#0F172A", fontFamily:MONO }}>{item.km}</p>
                          <p className="text-[9px] uppercase tracking-wide" style={{ color: "#94A3B8" }}>km</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-bold" style={{ color: "#0F172A", fontFamily:MONO }}>{item.cal}</p>
                        <p className="text-[9px] uppercase tracking-wide" style={{ color: "#94A3B8" }}>kcal</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    <button onClick={() => toggle(item.id)} className="flex items-center gap-1.5 transition-all">
                      <ThumbsUp size={15} fill={isLiked?"#2563EB":"none"} style={{ color:isLiked?"#2563EB":"#94A3B8" }}/>
                      <span className="text-xs font-semibold" style={{ color:isLiked?"#2563EB":"#94A3B8" }}>
                        {item.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                    <button className="flex items-center gap-1.5">
                      <MessageCircle size={15} style={{ color: "#94A3B8" }}/>
                      <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>{item.comments}</span>
                    </button>
                  </div>
                </Glass>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [workout, setWorkout] = useState<AID|null>(null);

  if (workout) {
    return (
      <div className="w-full max-w-[390px] mx-auto h-screen flex flex-col overflow-hidden"
        style={{ background:"#F5F8FF" }}>
        <WorkoutScreen type={workout} onStop={() => setWorkout(null)}/>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[390px] mx-auto h-screen flex flex-col overflow-hidden relative"
      style={{ background:"linear-gradient(160deg,#EDF2FF 0%,#FAF5FF 100%)" }}>
      {/* Ambient glow blobs */}
      <div className="absolute top-[-100px] left-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background:"rgba(37,99,235,0.06)", filter:"blur(70px)" }}/>
      <div className="absolute bottom-[60px] right-[-70px] w-[220px] h-[220px] rounded-full pointer-events-none"
        style={{ background:"rgba(236,72,153,0.07)", filter:"blur(55px)" }}/>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth:"none" }}>
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-10 }} transition={{ duration:0.16 }} className="min-h-full">
            {page==="home"     && <HomePage onStart={setWorkout}/>}
            {page==="summary"  && <SummaryPage/>}
            {page==="health"   && <HealthPage/>}
            {page==="progress" && <ProgressPage/>}
            {page==="social"   && <SocialPage/>}
          </motion.div>
        </AnimatePresence>
      </div>

      <NavBar page={page} setPage={setPage}/>
    </div>
  );
}
