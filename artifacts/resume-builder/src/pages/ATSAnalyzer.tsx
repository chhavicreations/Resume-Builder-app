import { useState, useCallback, useRef } from "react";
import { extractText } from "../lib/extractor";
import { analyzeResume, ATSResult } from "../lib/analyzer";

function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-500 font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold px-3 py-0.5 rounded-full" style={{ background: color + "20", color }}>{label}</span>
    </div>
  );
}

function CategoryBar({ label, score, max, details }: { label: string; score: number; max: number; details: string[] }) {
  const [open, setOpen] = useState(false);
  const pct = (score / max) * 100;
  const color = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mb-3">
      <button className="w-full text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold" style={{ color }}>{score}/{max}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
      </button>
      {open && (
        <ul className="mt-2 ml-1 space-y-1">
          {details.map((d, i) => (
            <li key={i} className="text-xs text-gray-500 flex gap-2"><span className="mt-0.5">•</span><span>{d}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  if (!items.length) return <p className="text-sm text-gray-400 italic">None detected</p>;
  const icon = color === "#22c55e" ? "✦" : color === "#ef4444" ? "✗" : "→";
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-gray-700">
          <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color }}>{icon}</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0]; if (file) onFile(file);
  }, [onFile]);
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-5 border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40"}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-gray-800">{dragging ? "Drop your resume here" : "Upload your resume"}</p>
        <p className="text-sm text-gray-500 mt-1">Drag & drop or click • PDF or DOCX</p>
      </div>
    </div>
  );
}

function Dashboard({ result, fileName, onReset }: { result: ATSResult; fileName: string; onReset: () => void }) {
  const { contact, sections, categories, strengths, weaknesses, improvements, wordCount, pageEstimate, totalScore } = result;
  const sectionRows: [string, boolean][] = [
    ["Summary", sections.hasSummary], ["Skills", sections.hasSkills],
    ["Experience", sections.hasExperience], ["Education", sections.hasEducation],
    ["Projects", sections.hasProjects], ["Certifications", sections.hasCertifications],
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">ATS Analysis Results</h1>
          <p className="text-sm text-gray-500 truncate max-w-xs">{fileName}</p>
        </div>
        <button onClick={onReset} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
          ↑ Analyze Another
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center gap-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ATS Score</h2>
          <ScoreGauge score={totalScore} />
          <p className="text-xs text-center text-gray-400 leading-relaxed max-w-[160px]">Contact · Sections · Content · Length · ATS Friendliness</p>
        </div>
        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Word Count", value: wordCount, sub: "total words" },
            { label: "Pages", value: `~${pageEstimate}`, sub: pageEstimate === 1 ? "ideal" : "pages" },
            { label: "Email", value: contact.emails.length > 0 ? "✓" : "✗", sub: contact.emails[0]?.slice(0,20) || "not found", color: contact.emails.length > 0 ? "#22c55e" : "#ef4444" },
            { label: "Phone", value: contact.phones.length > 0 ? "✓" : "✗", sub: contact.phones[0] || "not found", color: contact.phones.length > 0 ? "#22c55e" : "#ef4444" },
            { label: "Sections", value: Object.values(sections).filter(Boolean).length, sub: "of 6 found" },
            { label: "LinkedIn", value: contact.hasLinkedIn ? "✓" : "✗", sub: contact.hasLinkedIn ? "detected" : "not found", color: contact.hasLinkedIn ? "#22c55e" : "#ef4444" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: color ?? "#111827" }}>{value}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
          <div className="flex flex-wrap gap-2">
            <Badge ok={contact.emails.length > 0} label="Email" />
            <Badge ok={contact.phones.length > 0} label="Phone" />
            <Badge ok={contact.hasLinkedIn} label="LinkedIn" />
            <Badge ok={contact.hasGitHub} label="GitHub" />
            <Badge ok={contact.hasWebsite} label="Website" />
          </div>
          {contact.emails[0] && <p className="text-xs text-gray-500 mt-3 truncate">📧 {contact.emails[0]}</p>}
          {contact.phones[0] && <p className="text-xs text-gray-500 mt-1">📞 {contact.phones[0]}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Detected Sections</h3>
          <div className="grid grid-cols-2 gap-2">
            {sectionRows.map(([label, present]) => (
              <div key={label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${present ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}>
                <span>{present ? "✓" : "○"}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Score Breakdown <span className="text-xs text-gray-400 font-normal">(click to expand)</span></h3>
        {categories.map(cat => <CategoryBar key={cat.label} {...cat} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-4">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">✦</span>Strengths
          </h3>
          <BulletList items={strengths} color="#22c55e" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 mb-4">
            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-600">✗</span>Weaknesses
          </h3>
          <BulletList items={weaknesses} color="#ef4444" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-700 mb-4">
            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">→</span>Improvements
          </h3>
          <BulletList items={improvements} color="#6366f1" />
        </div>
      </div>

      <details className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <summary className="px-5 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-50 rounded-2xl">
          Extracted Resume Text (preview)
        </summary>
        <div className="px-5 pb-5 pt-2">
          <pre className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {result.rawText.slice(0, 2000)}{result.rawText.length > 2000 ? "\n…(truncated)" : ""}
          </pre>
        </div>
      </details>
    </div>
  );
}

type State = { phase: "upload" } | { phase: "loading"; fileName: string; step: string } | { phase: "done"; result: ATSResult; fileName: string } | { phase: "error"; message: string };

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

  if (state.phase === "done") return <Dashboard result={state.result} fileName={state.fileName} onReset={() => setState({ phase: "upload" })} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">📊 ATS Compatibility Analyzer</div>
          <h1 className="text-3xl font-bold text-gray-900">Is your resume <span className="text-indigo-600">ATS-ready?</span></h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">Upload your resume and get an instant score with detailed feedback.</p>
        </div>
        {state.phase === "upload" && <UploadZone onFile={handleFile} />}
        {state.phase === "loading" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center gap-5">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-gray-800">{state.step}</p>
              <p className="text-sm text-gray-400 mt-1">{state.fileName}</p>
            </div>
          </div>
        )}
        {state.phase === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
            <p className="text-red-600 font-medium">{state.message}</p>
            <button onClick={() => setState({ phase: "upload" })} className="text-sm text-indigo-600 underline font-medium">Try again</button>
          </div>
        )}
        {state.phase === "upload" && (
          <div className="flex flex-wrap justify-center gap-2">
            {["Contact Detection","Section Analysis","ATS Score","Strengths & Weaknesses","Actionable Tips"].map(f => (
              <span key={f} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium shadow-sm">{f}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
