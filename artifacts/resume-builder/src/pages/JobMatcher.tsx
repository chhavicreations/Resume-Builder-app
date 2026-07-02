import { useState, useCallback, useRef } from "react";
import { extractText } from "../lib/extractor";
import { analyzeJobMatch, JDAnalysisResult } from "../lib/jdAnalyzer";

/* ── Radial Score Ring ──────────────────────────────────── */
function RadialScore({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${circ * score / 100} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 4px ${color}50)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500 text-center">{label}</span>
    </div>
  );
}

/* ── Bar Chart Row ──────────────────────────────────────── */
function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
      </div>
    </div>
  );
}

/* ── Keyword Tag ────────────────────────────────────────── */
function KeywordTag({ word, matched }: { word: string; matched: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
      matched ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-500 border-red-200"
    }`}>
      <span className={`w-1 h-1 rounded-full ${matched ? "bg-emerald-500" : "bg-red-400"}`} />
      {word}
    </span>
  );
}

/* ── Small Upload Zone ──────────────────────────────────── */
function UploadZoneSmall({ label, onFile, fileName }: { label: string; onFile: (f: File) => void; fileName?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer text-center transition-all duration-200 ${
        drag ? "border-[#6C63FF] bg-violet-50 scale-[1.01]"
        : fileName ? "border-emerald-300 bg-emerald-50"
        : "border-slate-200 bg-white hover:border-[#6C63FF]/50 hover:bg-violet-50/30"
      }`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {fileName ? (
        <>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
            <span className="text-emerald-600 text-sm font-bold">✓</span>
          </div>
          <p className="text-emerald-700 font-semibold text-sm truncate">{fileName}</p>
          <p className="text-xs text-emerald-500 mt-0.5">Click to replace</p>
        </>
      ) : (
        <>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">PDF or DOCX</p>
        </>
      )}
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────── */
function Dashboard({ result, onReset }: { result: JDAnalysisResult; onReset: () => void }) {
  const sc = result.overallMatch;
  const scoreColor = sc >= 70 ? "#10b981" : sc >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = sc >= 70 ? "Strong Match" : sc >= 50 ? "Moderate Match" : "Low Match";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Match Analysis</h1>
          <p className="text-sm text-slate-400 mt-1">How well your resume matches the job description</p>
        </div>
        <button onClick={onReset} className="btn-secondary text-[13px] flex-shrink-0">↑ Analyze Again</button>
      </div>

      {/* Overall score card */}
      <div className="card-base p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="65" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="80" cy="80" r="65" fill="none" stroke={scoreColor} strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 65 * sc / 100} ${2 * Math.PI * 65}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 8px ${scoreColor}60)` }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tight" style={{ color: scoreColor }}>{sc}%</span>
                <span className="text-xs text-slate-400 font-medium">Match Score</span>
              </div>
            </div>
            <span className="text-sm font-semibold px-4 py-1.5 rounded-full border"
              style={{ background: scoreColor + "15", color: scoreColor, borderColor: scoreColor + "30" }}>
              {scoreLabel}
            </span>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <BarRow label="Keyword Match"    value={result.keywordMatch}    color="#6C63FF" />
            <BarRow label="Skill Match"      value={result.skillMatch}      color="#0ea5e9" />
            <BarRow label="Experience Match" value={result.experienceMatch} color="#8B5CF6" />
            <BarRow label="ATS Compatibility" value={result.atsCompatibility} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Sub-score rings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { score: result.keywordMatch,    label: "Keyword Match",  color: "#6C63FF" },
          { score: result.skillMatch,      label: "Skill Match",    color: "#0ea5e9" },
          { score: result.experienceMatch, label: "Experience",     color: "#8B5CF6" },
          { score: result.atsCompatibility,label: "ATS Friendly",   color: "#10b981" },
        ].map(p => (
          <div key={p.label} className="card-base card-hover p-5 flex items-center justify-center">
            <RadialScore {...p} />
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-base p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Keyword Match Analysis</h3>
          <p className="text-xs text-slate-400">{result.matchedKeywords.length} of {result.jdKeywords.length} JD keywords found in your resume</p>
          <div className="flex flex-wrap gap-2">
            {result.jdKeywords.map(kw => <KeywordTag key={kw} word={kw} matched={result.matchedKeywords.includes(kw)} />)}
          </div>
        </div>
        <div className="card-base p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length > 0
                ? result.missingKeywords.map(k => (
                    <span key={k} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">{k}</span>
                  ))
                : <span className="text-xs text-slate-400 italic">No critical keywords missing</span>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Recommended Skills to Add
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.recommendedSkills.map(s => (
                <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resume changes */}
      <div className="card-base p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recommended Resume Changes</h3>
        <ul className="space-y-3">
          {result.resumeChanges.map((change, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center shadow-sm">{i + 1}</span>
              {change}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills comparison */}
      {(result.skillsInJD.length > 0 || result.skillsInResume.length > 0) && (
        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Technical Skills Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="section-label mb-3">Skills in Job Description</p>
              <div className="flex flex-wrap gap-2">
                {result.skillsInJD.map(s => (
                  <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    result.skillsInResume.includes(s)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="section-label mb-3">Skills in Your Resume</p>
              <div className="flex flex-wrap gap-2">
                {result.skillsInResume.map(s => (
                  <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    result.skillsInJD.includes(s)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type State =
  | { phase: "input" }
  | { phase: "loading" }
  | { phase: "done"; result: JDAnalysisResult }
  | { phase: "error"; message: string };

export default function JobMatcher() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [state, setState] = useState<State>({ phase: "input" });

  const handleResumeFile = useCallback(async (f: File) => {
    setResumeFile(f);
    try { const text = await extractText(f); setResumeText(text); } catch { setResumeText(""); }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText) { setState({ phase: "error", message: "Please upload your resume first." }); return; }
    if (!jdText.trim()) { setState({ phase: "error", message: "Please paste the job description." }); return; }
    setState({ phase: "loading" });
    await new Promise(r => setTimeout(r, 500));
    try { setState({ phase: "done", result: analyzeJobMatch(resumeText, jdText) }); }
    catch (err: any) { setState({ phase: "error", message: err?.message ?? "Analysis failed." }); }
  }, [resumeText, jdText]);

  if (state.phase === "done")
    return <Dashboard result={state.result} onReset={() => setState({ phase: "input" })} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-10">

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold px-4 py-2 rounded-full border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Job Match Analyzer
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          How well does your resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">match the job?</span>
        </h1>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">Upload your resume and paste the job description to get keyword, skill, and ATS match scores.</p>
      </div>

      {/* Input panel */}
      <div className="card-base p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="section-label">Your Resume</label>
            <UploadZoneSmall label="Upload Resume (PDF or DOCX)" onFile={handleResumeFile} fileName={resumeFile?.name} />
            {resumeText && <p className="text-xs text-emerald-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500" />{resumeText.split(/\s+/).length} words extracted</p>}
          </div>
          <div className="space-y-2">
            <label className="section-label">Job Description</label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here…"
              className="input-base h-40 resize-none"
            />
            {jdText && <p className="text-xs text-blue-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-400" />{jdText.split(/\s+/).filter(Boolean).length} words in JD</p>}
          </div>
        </div>

        {state.phase === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 text-sm font-medium">
            {state.message}
          </div>
        )}

        <div className="flex justify-center pt-1">
          <button onClick={handleAnalyze} disabled={state.phase === "loading"} className="btn-primary px-10 py-3 text-[15px]">
            {state.phase === "loading"
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analyzing…</>
              : "Analyze Match"}
          </button>
        </div>
      </div>

      {/* Feature hints */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🔑", label: "Keyword Match",    desc: "Find JD keywords in your resume" },
          { icon: "🛠",  label: "Skill Match",      desc: "Compare technical skills" },
          { icon: "📅", label: "Experience Match",  desc: "Years of experience alignment" },
          { icon: "🤖", label: "ATS Score",         desc: "Parser compatibility check" },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="card-base card-hover p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
