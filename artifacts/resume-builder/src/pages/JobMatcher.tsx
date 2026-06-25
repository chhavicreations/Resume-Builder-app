import { useState, useCallback, useRef } from "react";
import { extractText } from "../lib/extractor";
import { analyzeJobMatch, JDAnalysisResult } from "../lib/jdAnalyzer";

function RadialScore({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${circ * score / 100} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
    </div>
  );
}

function BarChart({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-gray-700">
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function KeywordTag({ word, matched }: { word: string; matched: boolean }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
      matched ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
    }`}>
      {matched ? "✓" : "✗"} {word}
    </span>
  );
}

function UploadZoneSmall({ label, onFile, fileName }: { label: string; onFile: (f: File) => void; fileName?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all text-center ${drag ? "border-indigo-500 bg-indigo-50" : fileName ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-indigo-400 bg-white"}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {fileName
        ? <><p className="text-green-600 font-semibold text-sm">✓ {fileName}</p><p className="text-xs text-green-500 mt-0.5">Click to replace</p></>
        : <><p className="text-sm font-medium text-gray-600">{label}</p><p className="text-xs text-gray-400 mt-1">PDF or DOCX</p></>}
    </div>
  );
}

function Dashboard({ result, onReset }: { result: JDAnalysisResult; onReset: () => void }) {
  const scoreColor = result.overallMatch >= 70 ? "#22c55e" : result.overallMatch >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Job Match Analysis</h1>
          <p className="text-sm text-gray-500">How well your resume matches the job description</p>
        </div>
        <button onClick={onReset} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">↑ Analyze Again</button>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="65" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                <circle cx="80" cy="80" r="65" fill="none" stroke={scoreColor} strokeWidth="14"
                  strokeDasharray={`${2 * Math.PI * 65 * result.overallMatch / 100} ${2 * Math.PI * 65}`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: scoreColor }}>{result.overallMatch}%</span>
                <span className="text-xs text-gray-500 font-medium">Match Score</span>
              </div>
            </div>
            <span className="text-sm font-semibold px-4 py-1 rounded-full" style={{ background: scoreColor + "20", color: scoreColor }}>
              {result.overallMatch >= 70 ? "Strong Match" : result.overallMatch >= 50 ? "Moderate Match" : "Low Match"}
            </span>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <BarChart label="Keyword Match" value={result.keywordMatch} color="#6366f1" />
            <BarChart label="Skill Match" value={result.skillMatch} color="#0ea5e9" />
            <BarChart label="Experience Match" value={result.experienceMatch} color="#8b5cf6" />
            <BarChart label="ATS Compatibility" value={result.atsCompatibility} color="#22c55e" />
          </div>
        </div>
      </div>

      {/* Sub scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center">
          <RadialScore score={result.keywordMatch} label="Keyword Match" color="#6366f1" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center">
          <RadialScore score={result.skillMatch} label="Skill Match" color="#0ea5e9" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center">
          <RadialScore score={result.experienceMatch} label="Experience" color="#8b5cf6" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center">
          <RadialScore score={result.atsCompatibility} label="ATS Friendly" color="#22c55e" />
        </div>
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Keyword Match Analysis</h3>
          <p className="text-xs text-gray-500 mb-3">{result.matchedKeywords.length} of {result.jdKeywords.length} JD keywords found in resume</p>
          <div className="flex flex-wrap gap-2">
            {result.jdKeywords.map(kw => (
              <KeywordTag key={kw} word={kw} matched={result.matchedKeywords.includes(kw)} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-2">❌ Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length > 0
                ? result.missingKeywords.map(k => <span key={k} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">{k}</span>)
                : <span className="text-xs text-gray-400 italic">Great — no critical keywords missing!</span>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-700 mb-2">⭐ Recommended Skills to Add</h3>
            <div className="flex flex-wrap gap-2">
              {result.recommendedSkills.map(s => <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">{s}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-indigo-700 mb-4">📋 Recommended Resume Changes</h3>
        <ul className="space-y-2.5">
          {result.resumeChanges.map((change, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              {change}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills comparison */}
      {(result.skillsInJD.length > 0 || result.skillsInResume.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">🛠 Technical Skills Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills in Job Description</p>
              <div className="flex flex-wrap gap-2">
                {result.skillsInJD.map(s => (
                  <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${result.skillsInResume.includes(s) ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                    {result.skillsInResume.includes(s) ? "✓" : "!"} {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills in Your Resume</p>
              <div className="flex flex-wrap gap-2">
                {result.skillsInResume.map(s => (
                  <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${result.skillsInJD.includes(s) ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {s}
                  </span>
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
    try {
      const text = await extractText(f);
      setResumeText(text);
    } catch { setResumeText(""); }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText) { setState({ phase: "error", message: "Please upload your resume first." }); return; }
    if (!jdText.trim()) { setState({ phase: "error", message: "Please paste the job description." }); return; }
    setState({ phase: "loading" });
    await new Promise(r => setTimeout(r, 500));
    try {
      const result = analyzeJobMatch(resumeText, jdText);
      setState({ phase: "done", result });
    } catch (err: any) {
      setState({ phase: "error", message: err?.message ?? "Analysis failed." });
    }
  }, [resumeText, jdText]);

  if (state.phase === "done") return <Dashboard result={state.result} onReset={() => { setState({ phase: "input" }); }} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">🎯 Job Match Analyzer</div>
        <h1 className="text-3xl font-bold text-gray-900">How well does your resume <span className="text-orange-600">match the job?</span></h1>
        <p className="text-gray-500 text-sm">Upload your resume and paste the job description to get keyword, skill, and ATS match scores.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Your Resume</label>
          <UploadZoneSmall label="Upload Resume (PDF or DOCX)" onFile={handleResumeFile} fileName={resumeFile?.name} />
          {resumeText && <p className="text-xs text-green-600">✓ {resumeText.split(/\s+/).length} words extracted</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Job Description</label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste the full job description here…"
            className="w-full h-40 border-2 border-gray-300 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 resize-none bg-white"
          />
          {jdText && <p className="text-xs text-blue-600">✓ {jdText.split(/\s+/).filter(Boolean).length} words in JD</p>}
        </div>
      </div>

      {state.phase === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 text-sm">
          {state.message}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={state.phase === "loading"}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
        >
          {state.phase === "loading" ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing…</>
          ) : "🎯 Analyze Match"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {[
          { icon: "🔑", label: "Keyword Match", desc: "Find JD keywords in your resume" },
          { icon: "🛠", label: "Skill Match", desc: "Compare technical skills" },
          { icon: "📅", label: "Experience Match", desc: "Years of experience alignment" },
          { icon: "🤖", label: "ATS Score", desc: "Parser compatibility check" },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xs font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
