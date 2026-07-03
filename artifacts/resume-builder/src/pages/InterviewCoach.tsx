import { useState, useCallback, useRef } from "react";
import {
  Upload, ChevronDown, CheckCircle2, Mic2, Sparkles,
  Briefcase, Code2, Star, ArrowRight, Lightbulb, Trophy,
  ThumbsUp, Dumbbell, Loader2,
} from "lucide-react";
import { extractText } from "../lib/extractor";
import { generateQuestions, scoreAnswer, InterviewQuestion, QuestionCategory } from "../lib/questionGenerator";

type Tab = "all" | QuestionCategory;
type Mode = "browse" | "mock";

const CAT_STYLES: Record<QuestionCategory, { bg: string; text: string; border: string; dot: string }> = {
  HR:         { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-400" },
  Technical:  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400" },
  Behavioral: { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-400" },
};

const DIFF_STYLES: Record<string, string> = {
  Easy:   "text-emerald-700 bg-emerald-50 border border-emerald-200",
  Medium: "text-amber-700 bg-amber-50 border border-amber-200",
  Hard:   "text-red-600 bg-red-50 border border-red-200",
};

/* ── Score Ring ─────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * score / 100} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 4px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

/* ── Question Card ──────────────────────────────────────── */
function QuestionCard({ q, expanded, onToggle }: { q: InterviewQuestion; expanded: boolean; onToggle: () => void }) {
  const cs = CAT_STYLES[q.category];
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
      expanded ? "border-[#6C63FF]/30 shadow-[0_4px_20px_rgba(108,99,255,0.1)]" : "border-slate-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-slate-300 hover:-translate-y-0.5"
    }`}>
      <button className="w-full text-left px-5 py-4 flex items-start gap-3" onClick={onToggle}>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${cs.bg} ${cs.text} ${cs.border}`}>
          {q.category}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug">{q.question}</p>
          <div className="mt-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[q.difficulty]}`}>{q.difficulty}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="section-label mb-2 flex items-center gap-1.5"><Lightbulb className="w-3 h-3 text-amber-500" />Sample Answer</p>
            <p className="text-sm text-slate-700 leading-relaxed">{q.sampleAnswer}</p>
          </div>
          {q.followUp && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-blue-600 mb-1">Possible Follow-Up</p>
              <p className="text-sm text-blue-800">{q.followUp}</p>
            </div>
          )}
          <div>
            <p className="section-label mb-2">Key Keywords to Hit</p>
            <div className="flex flex-wrap gap-1.5">
              {q.keywords.map(k => (
                <span key={k} className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-medium">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mock Interview ─────────────────────────────────────── */
function MockInterview({ questions, onExit }: { questions: InterviewQuestion[]; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | ReturnType<typeof scoreAnswer>>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const total = questions.length;

  const handleScore = useCallback(() => {
    if (!answer.trim()) return;
    const r = scoreAnswer(answer, q.sampleAnswer, q.keywords);
    setResult(r);
    setScores(prev => [...prev, r.score]);
  }, [answer, q]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= total) { setDone(true); return; }
    setIdx(i => i + 1);
    setAnswer("");
    setResult(null);
  }, [idx, total]);

  if (done) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const color = avg >= 75 ? "#10b981" : avg >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md"
          style={{ background: avg >= 75 ? "#d1fae5" : avg >= 50 ? "#fef9c3" : "#fee2e2" }}>
          {avg >= 75
            ? <Trophy className="w-8 h-8 text-emerald-500" />
            : avg >= 50
            ? <ThumbsUp className="w-8 h-8 text-amber-500" />
            : <Dumbbell className="w-8 h-8 text-red-400" />}
        </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mock Interview Complete!</h2>
          <p className="text-slate-400">You answered {total} questions</p>
        </div>
        <div className="card-base p-8 text-center w-full max-w-sm">
          <p className="section-label mb-3">Overall Score</p>
          <p className="text-6xl font-bold tracking-tight" style={{ color }}>{avg}</p>
          <p className="text-slate-400 text-sm mt-1">/ 100</p>
          <div className="mt-6 space-y-2">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-8 text-right">Q{i + 1}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${s}%`, background: s >= 75 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444" }} />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color: s >= 75 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onExit} className="btn-primary px-8">Back to Questions</button>
      </div>
    );
  }

  const cs = CAT_STYLES[q.category];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] transition-all duration-500"
            style={{ width: `${(idx / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">{idx + 1} / {total}</span>
        <button onClick={onExit} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Exit</button>
      </div>

      {/* Question */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cs.bg} ${cs.text} ${cs.border}`}>{q.category}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[q.difficulty]}`}>{q.difficulty}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 leading-snug">{q.question}</h2>
        {q.followUp && <p className="text-sm text-slate-400 italic">Possible follow-up: {q.followUp}</p>}
      </div>

      {/* Answer */}
      <div className="card-base p-6 space-y-4">
        <label className="text-sm font-semibold text-slate-800">Your Answer</label>
        <textarea
          value={answer}
          onChange={e => { setAnswer(e.target.value); setResult(null); }}
          placeholder="Type your answer here… Use the STAR method: Situation, Task, Action, Result."
          className="input-base h-44 resize-none"
          disabled={result !== null}
        />
        {!result && (
          <button onClick={handleScore} disabled={!answer.trim()} className="btn-primary w-full justify-center py-3">
            Submit Answer
          </button>
        )}
      </div>

      {/* Feedback */}
      {result && (
        <div className="card-base p-6 space-y-5">
          <div className="flex items-center gap-5">
            <ScoreRing score={result.score} />
            <div>
              <p className="font-bold text-slate-900">Answer Score</p>
              <p className="text-sm text-slate-400 mt-0.5">Based on keyword coverage, length, and specificity</p>
            </div>
          </div>

          <div className="space-y-2">
            {result.feedback.map((f, i) => (
              <p key={i} className="text-sm text-slate-700 flex gap-2.5 leading-relaxed">
                <ArrowRight className="w-4 h-4 text-[#6C63FF] flex-shrink-0 mt-0.5" />{f}
              </p>
            ))}
          </div>

          {result.strong.length > 0 && (
            <div>
              <p className="section-label text-emerald-600 mb-2">Keywords you hit</p>
              <div className="flex flex-wrap gap-1.5">
                {result.strong.map(k => <span key={k} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">{k}</span>)}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <p className="section-label text-red-500 mb-2">Keywords to add next time</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map(k => <span key={k} className="px-2.5 py-1 bg-red-50 text-red-500 border border-red-200 rounded-full text-xs font-medium">{k}</span>)}
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="section-label mb-2">Sample Strong Answer</p>
            <p className="text-sm text-slate-700 leading-relaxed">{q.sampleAnswer}</p>
          </div>

          <button onClick={handleNext} className="btn-primary w-full justify-center py-3">
            {idx + 1 < total ? "Next Question →" : "See Final Results"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function InterviewCoach() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("browse");
  const resumeRef = useRef<HTMLInputElement>(null);

  const handleResumeFile = useCallback(async (f: File) => {
    setResumeFile(f);
    try { const text = await extractText(f); setResumeText(text); } catch { setResumeText(""); }
  }, []);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const qs = generateQuestions(resumeText, jdText);
    setQuestions(qs);
    setGenerated(true);
    setLoading(false);
    setActiveTab("all");
    setExpandedId(null);
  }, [resumeText, jdText]);

  const filtered = activeTab === "all" ? questions : questions.filter(q => q.category === activeTab);
  const mockQuestions = questions.sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length));

  if (mode === "mock" && generated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-semibold px-4 py-2 rounded-full border border-rose-200 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Mock Interview Mode
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Answer each question and get scored instantly</h1>
        </div>
        <MockInterview questions={mockQuestions} onExit={() => setMode("browse")} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-7">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-semibold px-4 py-2 rounded-full border border-rose-200 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />AI Interview Coach
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Question Generator</h1>
          <p className="text-sm text-slate-400 mt-1">Generate tailored HR, Technical & Behavioral questions from your resume and JD</p>
        </div>
        {generated && (
          <button onClick={() => setMode("mock")} className="btn-primary bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_4px_14px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.45)]">
            <Mic2 className="w-4 h-4" />Start Mock Interview
          </button>
        )}
      </div>

      {/* Input card */}
      <div className="card-base p-6 space-y-5">
        <p className="text-sm font-semibold text-slate-700">Provide Your Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="section-label">Resume (optional)</label>
            <div
              className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer text-center transition-all duration-200 ${
                resumeFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-[#6C63FF]/50 hover:bg-violet-50/20"
              }`}
              onClick={() => resumeRef.current?.click()}
            >
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeFile(f); }} />
              {resumeFile ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700 font-semibold text-sm truncate">{resumeFile.name}</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Click to replace</p>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-4 h-4 text-slate-400" strokeWidth={1.8} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Upload Resume</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF or DOCX • Generates role-specific questions</p>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="section-label">Job Description (optional)</label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste job description to generate role-specific technical questions…"
              className="input-base h-36 resize-none"
            />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
            : <><Sparkles className="w-4 h-4" />Generate Interview Questions</>}
        </button>
      </div>

      {/* Questions section */}
      {generated && (
        <div className="space-y-5">
          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "HR", "Technical", "Behavioral"] as Tab[]).map(t => {
              const count = t === "all" ? questions.length : questions.filter(q => q.category === t).length;
              return (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === t
                      ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-[0_2px_10px_rgba(108,99,255,0.3)]"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}>
                  {t === "all" ? "All" : t}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>{count}</span>
                </button>
              );
            })}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} questions</span>
          </div>

          {/* Category summary */}
          <div className="grid grid-cols-3 gap-3">
            {(["HR", "Technical", "Behavioral"] as QuestionCategory[]).map(cat => {
              const count = questions.filter(q => q.category === cat).length;
              const cs = CAT_STYLES[cat];
              const color = cat === "HR" ? "#1d4ed8" : cat === "Technical" ? "#7c3aed" : "#059669";
              return (
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className={`${cs.bg} border ${cs.border} rounded-2xl p-5 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
                  <p className="text-3xl font-bold mb-1" style={{ color }}>{count}</p>
                  <p className={`text-xs font-semibold ${cs.text}`}>{cat} Questions</p>
                </button>
              );
            })}
          </div>

          {/* Question cards */}
          <div className="space-y-2.5">
            {filtered.map(q => (
              <QuestionCard
                key={q.id} q={q}
                expanded={expandedId === q.id}
                onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
              />
            ))}
          </div>

          {/* Mock interview CTA */}
          <div className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 border border-rose-200/60">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Mic2 className="w-6 h-6 text-rose-500" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-bold text-slate-900 text-base">Ready to practice?</h3>
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">Start mock interview mode — answer questions and get instant scoring with detailed feedback.</p>
            </div>
            <button onClick={() => setMode("mock")}
              className="flex-shrink-0 inline-flex items-center gap-2 font-semibold text-white rounded-full px-6 py-2.5 text-sm bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_4px_14px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.45)] hover:scale-[1.02] transition-all duration-200">
              Start Mock Interview →
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!generated && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { Icon: Briefcase, title: "HR Questions",         desc: "Career goals, salary, culture fit, motivations",        bg: "bg-blue-50",    ic: "text-blue-500"    },
            { Icon: Code2,     title: "Technical Questions",  desc: "Role-specific skills from your resume & JD",            bg: "bg-violet-50",  ic: "text-violet-500"  },
            { Icon: Star,      title: "Behavioral Questions", desc: "STAR-format situational questions with sample answers",  bg: "bg-emerald-50", ic: "text-emerald-500" },
          ] as const).map(({ Icon, title, desc, bg, ic }) => (
            <div key={title} className="card-base card-hover p-6 text-center">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${ic}`} />
              </div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
