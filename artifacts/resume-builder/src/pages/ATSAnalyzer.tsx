import { useState, useCallback, useRef } from "react";
import { extractText } from "../lib/extractor";
import { analyzeResume, ATSResult } from "../lib/analyzer";

/* ── Score Gauge ────────────────────────────────────────── */
function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color}60)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-3 py-1 rounded-full border" style={{ background: color + "15", color, borderColor: color + "30" }}>{label}</span>
    </div>
  );
}

/* ── Category Bar ───────────────────────────────────────── */
function CategoryBar({ label, score, max, details }: { label: string; score: number; max: number; details: string[] }) {
  const [open, setOpen] = useState(false);
  const pct = (score / max) * 100;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mb-4">
      <button className="w-full text-left group" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color }}>{score}/{max}</span>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }} />
        </div>
      </button>
      {open && (
        <ul className="mt-3 ml-1 space-y-1.5 pb-1">
          {details.map((d, i) => (
            <li key={i} className="text-xs text-slate-500 flex gap-2 leading-relaxed">
              <span className="mt-0.5 text-slate-400 flex-shrink-0">•</span><span>{d}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Contact Badge ──────────────────────────────────────── */
function ContactBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
      ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-slate-300"}`} />
      {label}
    </span>
  );
}

/* ── Bullet List ────────────────────────────────────────── */
function BulletList({ items, variant }: { items: string[]; variant: "green" | "red" | "purple" }) {
  if (!items.length) return <p className="text-sm text-slate-400 italic">None detected</p>;
  const styles = {
    green:  { dot: "#10b981", bg: "bg-emerald-100" },
    red:    { dot: "#ef4444", bg: "bg-red-100" },
    purple: { dot: "#6C63FF", bg: "bg-violet-100" },
  }[variant];
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
          <span className={`flex-shrink-0 w-5 h-5 rounded-full ${styles.bg} flex items-center justify-center mt-0.5`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: styles.dot }} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ── Upload Zone ────────────────────────────────────────── */
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0]; if (file) onFile(file);
  }, [onFile]);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative group flex flex-col items-center justify-center gap-6 rounded-3xl p-14 cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
        dragging
          ? "border-[#6C63FF] bg-violet-50/80 scale-[1.01]"
          : "border-slate-200 bg-gradient-to-b from-white to-slate-50/80 hover:border-[#6C63FF]/60 hover:bg-violet-50/30 hover:scale-[1.005]"
      }`}
    >
      {/* Subtle glow backdrop */}
      <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${dragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.06) 0%, transparent 70%)" }} />

      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      {/* Icon */}
      <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
        dragging ? "bg-[#6C63FF] shadow-[0_8px_24px_rgba(108,99,255,0.4)] scale-110" : "bg-white border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_24px_rgba(108,99,255,0.2)] group-hover:border-[#6C63FF]/30 group-hover:scale-105"
      }`}>
        <svg className={`w-9 h-9 transition-colors duration-200 ${dragging ? "text-white" : "text-[#6C63FF]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      <div className="text-center relative">
        <p className="text-base font-semibold text-slate-800 mb-1">
          {dragging ? "Drop your resume here" : "Upload your resume"}
        </p>
        <p className="text-sm text-slate-400">Drag & drop or <span className="text-[#6C63FF] font-medium">browse files</span></p>
        <p className="text-xs text-slate-300 mt-2 font-medium tracking-wide uppercase">PDF · DOCX · DOC</p>
      </div>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color?: string }) {
  return (
    <div className="card-base card-hover p-5">
      <p className="section-label mb-2">{label}</p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: color ?? "#0f172a" }}>{value}</p>
      <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>
    </div>
  );
}

/* ── Insight Card ───────────────────────────────────────── */
function InsightCard({ title, icon, iconBg, children }: { title: string; icon: string; iconBg: string; children: React.ReactNode }) {
  return (
    <div className="card-base card-hover p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center text-sm`}>{icon}</span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────── */
function Dashboard({ result, fileName, onReset }: { result: ATSResult; fileName: string; onReset: () => void }) {
  const { contact, sections, categories, strengths, weaknesses, improvements, wordCount, pageEstimate, totalScore } = result;
  const sectionRows: [string, boolean][] = [
    ["Summary", sections.hasSummary], ["Skills", sections.hasSkills],
    ["Experience", sections.hasExperience], ["Education", sections.hasEducation],
    ["Projects", sections.hasProjects], ["Certifications", sections.hasCertifications],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ATS Analysis Results</h1>
          <p className="text-sm text-slate-400 mt-1 truncate max-w-sm">{fileName}</p>
        </div>
        <button onClick={onReset}
          className="btn-secondary text-[13px] flex-shrink-0">
          ↑ Analyze Another
        </button>
      </div>

      {/* Top row: score + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-base p-6 flex flex-col items-center gap-4 sm:row-span-1">
          <p className="section-label">ATS Score</p>
          <ScoreGauge score={totalScore} />
          <p className="text-[11px] text-center text-slate-400 leading-relaxed max-w-[160px]">Contact · Sections · Content · Length · ATS Friendliness</p>
        </div>
        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Word Count" value={wordCount} sub="total words" />
          <StatCard label="Pages" value={`~${pageEstimate}`} sub={pageEstimate === 1 ? "ideal length" : "pages long"} />
          <StatCard label="Email" value={contact.emails.length > 0 ? "✓" : "✗"} sub={contact.emails[0]?.slice(0, 22) || "not found"} color={contact.emails.length > 0 ? "#10b981" : "#ef4444"} />
          <StatCard label="Phone" value={contact.phones.length > 0 ? "✓" : "✗"} sub={contact.phones[0] || "not found"} color={contact.phones.length > 0 ? "#10b981" : "#ef4444"} />
          <StatCard label="Sections" value={Object.values(sections).filter(Boolean).length} sub="of 6 detected" />
          <StatCard label="LinkedIn" value={contact.hasLinkedIn ? "✓" : "✗"} sub={contact.hasLinkedIn ? "detected" : "not found"} color={contact.hasLinkedIn ? "#10b981" : "#ef4444"} />
        </div>
      </div>

      {/* Contact + Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Contact Information</h3>
          <div className="flex flex-wrap gap-2">
            <ContactBadge ok={contact.emails.length > 0} label="Email" />
            <ContactBadge ok={contact.phones.length > 0} label="Phone" />
            <ContactBadge ok={contact.hasLinkedIn} label="LinkedIn" />
            <ContactBadge ok={contact.hasGitHub} label="GitHub" />
            <ContactBadge ok={contact.hasWebsite} label="Website" />
          </div>
          {contact.emails[0] && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <span className="text-slate-300">✉</span>{contact.emails[0]}
            </p>
          )}
          {contact.phones[0] && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="text-slate-300">📞</span>{contact.phones[0]}
            </p>
          )}
        </div>

        <div className="card-base p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Detected Sections</h3>
          <div className="grid grid-cols-2 gap-2">
            {sectionRows.map(([label, present]) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                present ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${present ? "bg-emerald-500" : "bg-slate-300"}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-800">Score Breakdown</h3>
          <span className="text-xs text-slate-400">Click any bar to expand details</span>
        </div>
        {categories.map(cat => <CategoryBar key={cat.label} {...cat} />)}
      </div>

      {/* Strengths / Weaknesses / Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InsightCard title="Strengths" icon="✦" iconBg="bg-emerald-100">
          <BulletList items={strengths} variant="green" />
        </InsightCard>
        <InsightCard title="Weaknesses" icon="✗" iconBg="bg-red-100">
          <BulletList items={weaknesses} variant="red" />
        </InsightCard>
        <InsightCard title="Improvements" icon="→" iconBg="bg-violet-100">
          <BulletList items={improvements} variant="purple" />
        </InsightCard>
      </div>

      {/* Raw text */}
      <details className="card-base group">
        <summary className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer select-none hover:text-slate-900 flex items-center gap-2 transition-colors rounded-2xl">
          <svg className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          Extracted Resume Text
        </summary>
        <div className="px-6 pb-6 pt-2">
          <pre className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto bg-slate-50 rounded-xl p-4 border border-slate-100">
            {result.rawText.slice(0, 2000)}{result.rawText.length > 2000 ? "\n…(truncated)" : ""}
          </pre>
        </div>
      </details>
    </div>
  );
}

type State =
  | { phase: "upload" }
  | { phase: "loading"; fileName: string; step: string }
  | { phase: "done"; result: ATSResult; fileName: string }
  | { phase: "error"; message: string };

export default function ATSAnalyzer() {
  const [state, setState] = useState<State>({ phase: "upload" });

  const handleFile = useCallback(async (file: File) => {
    const name = file.name;
    const lower = name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".doc")) {
      setState({ phase: "error", message: "Please upload a PDF or DOCX file." });
      return;
    }
    setState({ phase: "loading", fileName: name, step: "Extracting text…" });
    try {
      const text = await extractText(file);
      setState({ phase: "loading", fileName: name, step: "Running ATS analysis…" });
      await new Promise(r => setTimeout(r, 350));
      setState({ phase: "done", result: analyzeResume(text), fileName: name });
    } catch (err: any) {
      setState({ phase: "error", message: err?.message ?? "Failed to process the file." });
    }
  }, []);

  if (state.phase === "done")
    return <Dashboard result={state.result} fileName={state.fileName} onReset={() => setState({ phase: "upload" })} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-16">
      <div className="w-full max-w-xl space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-[#6C63FF] text-xs font-semibold px-4 py-2 rounded-full border border-violet-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]" />
            ATS Compatibility Analyzer
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Is your resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]">ATS‑ready?</span>
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">Upload your resume and get an instant compatibility score with detailed, actionable feedback.</p>
        </div>

        {/* Upload / Loading / Error */}
        {state.phase === "upload" && <UploadZone onFile={handleFile} />}

        {state.phase === "loading" && (
          <div className="card-base p-12 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-[3px] border-violet-100 border-t-[#6C63FF] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] opacity-20 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800">{state.step}</p>
              <p className="text-sm text-slate-400 mt-1">{state.fileName}</p>
            </div>
          </div>
        )}

        {state.phase === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-red-500 text-lg">✗</span>
            </div>
            <p className="text-red-700 font-medium">{state.message}</p>
            <button onClick={() => setState({ phase: "upload" })} className="btn-primary text-xs px-5 py-2">
              Try again
            </button>
          </div>
        )}

        {/* Feature pills */}
        {state.phase === "upload" && (
          <div className="flex flex-wrap justify-center gap-2">
            {["Contact Detection", "Section Analysis", "ATS Score", "Strengths & Weaknesses", "Actionable Tips"].map(f => (
              <span key={f} className="text-xs bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full font-medium shadow-sm hover:border-[#6C63FF]/40 hover:text-[#6C63FF] transition-colors cursor-default">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
