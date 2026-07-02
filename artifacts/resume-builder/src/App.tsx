import { useState } from "react";
import ATSAnalyzer from "./pages/ATSAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import InterviewCoach from "./pages/InterviewCoach";

type Tab = "ats" | "matcher" | "coach";

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: "ats", label: "ATS Analyzer", icon: "📊", desc: "Score your resume" },
  { id: "matcher", label: "Job Match", icon: "🎯", desc: "Match to a JD" },
  { id: "coach", label: "Interview Coach", icon: "🎤", desc: "Practice questions" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("ats");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Nav ──────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-2 h-14">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block mr-4">ResumeAI</span>

            <nav className="flex gap-1 overflow-x-auto flex-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    tab === t.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────── */}
      <div className="flex-1">
        {tab === "ats" && <ATSAnalyzer />}
        {tab === "matcher" && <JobMatcher />}
        {tab === "coach" && <InterviewCoach />}
      </div>
    </div>
  );
}
