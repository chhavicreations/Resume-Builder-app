import { useState, useCallback, useRef } from "react";
import { extractText } from "../lib/extractor";
import { generateQuestions, scoreAnswer, InterviewQuestion, QuestionCategory } from "../lib/questionGenerator";

type Tab = "all" | QuestionCategory;
type Mode = "browse" | "mock";

const CAT_COLORS: Record<QuestionCategory, { bg: string; text: string; border: string }> = {
  HR: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Technical: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Behavioral: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

const DIFF_COLORS: Record<string, string> = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Hard: "text-red-600 bg-red-50",
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${circ * score / 100} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function QuestionCard({ q, expanded, onToggle }: { q: InterviewQuestion; expanded: boolean; onToggle: () => void }) {
  const colors = CAT_COLORS[q.category];
  return (
    <div className={`bg-white rounded-xl border ${expanded ? "border-indigo-300 shadow-md" : "border-gray-200"} transition-all overflow-hidden`}>
      <button className="w-full text-left p-4 flex items-start gap-3" onClick={onToggle}>
        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>{q.category}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{q.question}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">💡 Sample Answer</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{q.sampleAnswer}</p>
          </div>
          {q.followUp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-600 mb-1">Possible Follow-Up</p>
              <p className="text-sm text-blue-800">{q.followUp}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Key Keywords to Hit</p>
            <div className="flex flex-wrap gap-1.5">
              {q.keywords.map(k => <span key={k} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">{k}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    const color = avg >= 75 ? "#22c55e" : avg >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 py-10">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">{avg >= 75 ? "🎉" : avg >= 50 ? "👍" : "💪"}</div>
          <h2 className="text-2xl font-bold text-gray-900">Mock Interview Complete!</h2>
          <p className="text-gray-500">You answered {total} questions</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Overall Score</p>
          <p className="text-6xl font-bold" style={{ color }}>{avg}</p>
          <p className="text-gray-500 text-sm mt-1">/ 100</p>
          <div className="mt-4 space-y-1">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">Q{i + 1}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s}%`, background: s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444" }} />
                </div>
                <span className="text-xs font-semibold w-8 text-right">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onExit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors">
          Back to Questions
        </button>
      </div>
    );
  }

  const colors = CAT_COLORS[q.category];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(idx / total) * 100}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-500">{idx + 1} / {total}</span>
        <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-700">Exit</button>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>{q.category}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 leading-snug">{q.question}</h2>
        {q.followUp && <p className="text-sm text-gray-500 italic">Possible follow-up: {q.followUp}</p>}
      </div>

      {/* Answer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <label className="text-sm font-semibold text-gray-700">Your Answer</label>
        <textarea
          value={answer}
          onChange={e => { setAnswer(e.target.value); setResult(null); }}
          placeholder="Type your answer here… Use the STAR method: Situation, Task, Action, Result."
          className="w-full h-40 border-2 border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 resize-none"
          disabled={result !== null}
        />
        {!result && (
          <button onClick={handleScore} disabled={!answer.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors">
            Submit Answer
          </button>
        )}
      </div>

      {/* Feedback */}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-5">
            <ScoreRing score={result.score} />
            <div>
              <p className="font-bold text-gray-900">Answer Score</p>
              <p className="text-sm text-gray-500">Based on keyword coverage, length, and specificity</p>
            </div>
          </div>

          <div className="space-y-2">
            {result.feedback.map((f, i) => (
              <p key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-indigo-500 flex-shrink-0">→</span>{f}
              </p>
            ))}
          </div>

          {result.strong.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1.5">✓ Keywords you hit</p>
              <div className="flex flex-wrap gap-1.5">
                {result.strong.map(k => <span key={k} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs">{k}</span>)}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1.5">✗ Keywords to add next time</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map(k => <span key={k} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs">{k}</span>)}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sample Strong Answer</p>
            <p className="text-sm text-gray-700 leading-relaxed">{q.sampleAnswer}</p>
          </div>

          <button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
            {idx + 1 < total ? "Next Question →" : "See Final Results"}
          </button>
        </div>
      )}
    </div>
  );
}

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

  const tabs: Tab[] = ["all", "HR", "Technical", "Behavioral"];
  const filtered = activeTab === "all" ? questions : questions.filter(q => q.category === activeTab);

  const mockQuestions = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, questions.length));

  if (mode === "mock" && generated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">🎤 Mock Interview Mode</h1>
          <p className="text-sm text-gray-500">Answer each question out loud or type it — get scored instantly</p>
        </div>
        <MockInterview questions={mockQuestions} onExit={() => setMode("browse")} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-2">🎤 AI Interview Coach</div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Question Generator</h1>
          <p className="text-sm text-gray-500">Generate tailored HR, Technical & Behavioral questions from your resume and JD</p>
        </div>
        {generated && (
          <button
            onClick={() => setMode("mock")}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            🎤 Start Mock Interview
          </button>
        )}
      </div>

      {/* Input section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Step 1: Provide Your Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Resume (optional)</label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-all ${resumeFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-rose-400 hover:bg-rose-50/30"}`}
              onClick={() => resumeRef.current?.click()}
            >
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeFile(f); }} />
              {resumeFile
                ? <><p className="text-green-600 font-semibold text-sm">✓ {resumeFile.name}</p><p className="text-xs text-green-500 mt-0.5">Click to replace</p></>
                : <><p className="text-sm font-medium text-gray-500">Upload Resume</p><p className="text-xs text-gray-400 mt-1">PDF or DOCX • Generates role-specific questions</p></>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Job Description (optional)</label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste job description to generate role-specific technical questions…"
              className="w-full h-28 border-2 border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-rose-400 resize-none"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating…</> : "✨ Generate Interview Questions"}
        </button>
      </div>

      {/* Questions */}
      {generated && (
        <div className="space-y-4">
          {/* Stats + mode switch */}
          <div className="flex flex-wrap items-center gap-3">
            {(["all", "HR", "Technical", "Behavioral"] as Tab[]).map(t => {
              const count = t === "all" ? questions.length : questions.filter(q => q.category === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {t === "all" ? "All" : t}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
                </button>
              );
            })}
            <div className="flex-1" />
            <p className="text-xs text-gray-500">{filtered.length} questions shown</p>
          </div>

          {/* Category summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {(["HR", "Technical", "Behavioral"] as QuestionCategory[]).map(cat => {
              const count = questions.filter(q => q.category === cat).length;
              const colors = CAT_COLORS[cat];
              return (
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center transition-all hover:shadow-sm`}>
                  <p className="text-2xl font-bold mb-1" style={{ color: cat === "HR" ? "#1d4ed8" : cat === "Technical" ? "#7c3aed" : "#15803d" }}>{count}</p>
                  <p className={`text-xs font-semibold ${colors.text}`}>{cat} Questions</p>
                </button>
              );
            })}
          </div>

          {/* Question list */}
          <div className="space-y-2">
            {filtered.map(q => (
              <QuestionCard
                key={q.id}
                q={q}
                expanded={expandedId === q.id}
                onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
              />
            ))}
          </div>

          {/* Mock interview CTA */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-4xl">🎤</div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-bold text-gray-900">Ready to practice?</h3>
              <p className="text-sm text-gray-600 mt-0.5">Start mock interview mode — answer questions and get instant AI scoring with feedback.</p>
            </div>
            <button
              onClick={() => setMode("mock")}
              className="flex-shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Start Mock Interview →
            </button>
          </div>
        </div>
      )}

      {!generated && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "💼", title: "HR Questions", desc: "Career goals, salary, culture fit, motivations" },
            { icon: "⚙️", title: "Technical Questions", desc: "Role-specific skills from your resume & JD" },
            { icon: "🌟", title: "Behavioral Questions", desc: "STAR-format situational questions with sample answers" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-sm font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
