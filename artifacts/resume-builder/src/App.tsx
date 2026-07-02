import { useState } from "react";
import ATSAnalyzer from "./pages/ATSAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import InterviewCoach from "./pages/InterviewCoach";

type Tab = "ats" | "matcher" | "coach";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "ats",     label: "ATS Analyzer",     icon: "📊" },
  { id: "matcher", label: "Job Match",         icon: "🎯" },
  { id: "coach",   label: "Interview Coach",   icon: "🎤" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("ats");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center h-16 gap-3">

            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0 mr-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center shadow-[0_2px_8px_rgba(108,99,255,0.4)]">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-[15px] tracking-tight hidden sm:block">ResumeAI</span>
            </div>

            {/* Tab nav */}
            <nav className="flex gap-1 flex-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    tab === t.id
                      ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-[0_2px_10px_rgba(108,99,255,0.35)]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base leading-none">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>

            {/* Right badge */}
            <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              AI Powered
            </div>
          </div>
        </div>
      </header>

      {/* ── Page ───────────────────────────────────────────── */}
      <main className="flex-1">
        {tab === "ats"     && <ATSAnalyzer />}
        {tab === "matcher" && <JobMatcher />}
        {tab === "coach"   && <InterviewCoach />}
      </main>
    </div>
  );
}
