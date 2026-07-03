import { useState } from "react";
import { BarChart2, Target, Mic2, Sparkles, FileText, Zap } from "lucide-react";
import ATSAnalyzer from "./pages/ATSAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import InterviewCoach from "./pages/InterviewCoach";
import ResumeRedesign from "./pages/ResumeRedesign";

type Tab = "ats" | "matcher" | "coach" | "redesign";

interface TabDef { id: Tab; label: string; Icon: React.FC<{ className?: string }> }

const TABS: TabDef[] = [
  { id: "ats",      label: "ATS Analyzer",   Icon: BarChart2 },
  { id: "matcher",  label: "Job Match",       Icon: Target    },
  { id: "coach",    label: "Interview Coach", Icon: Mic2      },
  { id: "redesign", label: "Resume Redesign", Icon: Sparkles  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("ats");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative">

      {/* ── Decorative background ─────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute -top-48 -right-48 w-[520px] h-[520px] rounded-full bg-violet-100/60 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-indigo-100/50 blur-3xl animate-blob delay-2000" />
        <div className="absolute -bottom-40 right-1/4 w-[380px] h-[380px] rounded-full bg-purple-100/40 blur-3xl animate-blob delay-4000" />
        {/* Dot grid */}
        <div className="absolute inset-0 text-slate-400 bg-dots opacity-[0.025]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center h-16 gap-3">

            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0 mr-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center shadow-[0_3px_10px_rgba(108,99,255,0.4)]">
                <FileText className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900 text-[15px] tracking-tight">Resume</span>
                <span className="font-bold text-[15px] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]">AI</span>
              </div>
            </div>

            {/* Tab nav */}
            <nav className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    tab === t.id
                      ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-[0_2px_10px_rgba(108,99,255,0.35)]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <t.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>

            {/* AI badge */}
            <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#6C63FF] bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3" />
              AI Powered
            </div>
          </div>
        </div>
      </header>

      {/* ── Page ───────────────────────────────────────────── */}
      <main className="flex-1 animate-fade-in">
        {tab === "ats"      && <ATSAnalyzer />}
        {tab === "matcher"  && <JobMatcher />}
        {tab === "coach"    && <InterviewCoach />}
        {tab === "redesign" && <ResumeRedesign />}
      </main>
    </div>
  );
}
