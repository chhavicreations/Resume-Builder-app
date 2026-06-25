import { useState, useCallback, useRef } from "react";
import { extractText } from "../lib/extractor";
import { parseResumeText, ParsedResume } from "../lib/parser";

/* ── Template type ─────────────────────────────────────── */
type TemplateId = "ats" | "modern" | "minimal" | "executive" | "creative";

const TEMPLATES: { id: TemplateId; name: string; desc: string; palette: string }[] = [
  { id: "ats", name: "ATS Professional", desc: "Clean, parser-friendly, single-column", palette: "bg-slate-700" },
  { id: "modern", name: "Modern Corporate", desc: "Two-column, blue accent, bold headers", palette: "bg-blue-600" },
  { id: "minimal", name: "Minimal Clean", desc: "Whitespace-focused, serif headings", palette: "bg-stone-500" },
  { id: "executive", name: "Executive", desc: "Dark header, strong typography", palette: "bg-gray-900" },
  { id: "creative", name: "Creative Designer", desc: "Sidebar with color accent, creative layout", palette: "bg-violet-600" },
];

/* ── Shared print helper ────────────────────────────────── */
function downloadResumePDF(name: string) {
  const el = document.getElementById("resume-template-render");
  if (!el) return;
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', sans-serif; background: #fff; }
      @page { size: A4; margin: 0; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
  </head><body>${el.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 600);
  if (name) void name;
}

/* ── Section title component ───────────────────────────── */
function SectionDivider({ title, color = "#4f46e5" }: { title: string; color?: string }) {
  return (
    <div style={{ borderBottom: `2px solid ${color}`, paddingBottom: 4, marginBottom: 10, marginTop: 16 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color }}>{title}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TEMPLATE 1: ATS PROFESSIONAL
════════════════════════════════════════════════════════ */
function ATSProfessional({ r }: { r: ParsedResume }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", padding: "40px 48px", minHeight: 960, color: "#1a1d2e", fontSize: 12 }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #1e293b", paddingBottom: 16, marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: -0.5 }}>{r.name || "Your Name"}</h1>
        {r.jobTitle && <p style={{ fontSize: 13, color: "#475569", marginTop: 3, fontWeight: 500 }}>{r.jobTitle}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: 8, fontSize: 11, color: "#64748b" }}>
          {r.email && <span>✉ {r.email}</span>}
          {r.phone && <span>📞 {r.phone}</span>}
          {r.address && <span>📍 {r.address}</span>}
          {r.linkedin && <span>🔗 {r.linkedin}</span>}
        </div>
      </div>

      {r.summary && (
        <>
          <SectionDivider title="Professional Summary" color="#1e293b" />
          <p style={{ lineHeight: 1.7, color: "#374151" }}>{r.summary}</p>
        </>
      )}

      {r.experience.length > 0 && (
        <>
          <SectionDivider title="Work Experience" color="#1e293b" />
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{e.dates}</span>
              </div>
              {e.company && <p style={{ color: "#4f46e5", fontWeight: 500, fontSize: 11, marginTop: 1 }}>{e.company}</p>}
              {e.bullets.length > 0 && (
                <ul style={{ marginTop: 5, paddingLeft: 16, color: "#374151", lineHeight: 1.6 }}>
                  {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {r.education.length > 0 && (
        <>
          <SectionDivider title="Education" color="#1e293b" />
          {r.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.degree}</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{e.year}</span>
              </div>
              {e.school && <p style={{ color: "#374151", fontSize: 11 }}>{e.school}</p>}
              {e.gpa && <p style={{ fontSize: 11, color: "#6b7280" }}>GPA: {e.gpa}</p>}
            </div>
          ))}
        </>
      )}

      {r.skills.length > 0 && (
        <>
          <SectionDivider title="Skills" color="#1e293b" />
          <p style={{ color: "#374151", lineHeight: 1.8 }}>{r.skills.join(" • ")}</p>
        </>
      )}

      {r.certifications.length > 0 && (
        <>
          <SectionDivider title="Certifications" color="#1e293b" />
          <ul style={{ paddingLeft: 16, color: "#374151", lineHeight: 1.8 }}>
            {r.certifications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TEMPLATE 2: MODERN CORPORATE
════════════════════════════════════════════════════════ */
function ModernCorporate({ r }: { r: ParsedResume }) {
  const accent = "#2563eb";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: 960, color: "#1a1d2e", display: "flex", fontSize: 12 }}>
      {/* Sidebar */}
      <div style={{ width: 210, background: "#eff6ff", padding: "36px 20px", flexShrink: 0, borderRight: "2px solid #bfdbfe" }}>
        <div style={{ background: accent, color: "#fff", borderRadius: 8, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, marginBottom: 14 }}>
          {(r.name || "?")[0]}
        </div>
        <h1 style={{ fontSize: 15, fontWeight: 800, color: "#1e3a8a", lineHeight: 1.2 }}>{r.name || "Your Name"}</h1>
        {r.jobTitle && <p style={{ fontSize: 11, color: accent, fontWeight: 600, marginTop: 4 }}>{r.jobTitle}</p>}

        <div style={{ marginTop: 20, fontSize: 10.5, color: "#374151", lineHeight: 2 }}>
          {r.email && <p>✉ {r.email}</p>}
          {r.phone && <p>📞 {r.phone}</p>}
          {r.address && <p>📍 {r.address}</p>}
          {r.linkedin && <p style={{ wordBreak: "break-all" }}>🔗 {r.linkedin}</p>}
        </div>

        {r.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 4, marginBottom: 8 }}>Skills</p>
            {r.skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <p style={{ fontSize: 10.5, color: "#1e3a8a", fontWeight: 500 }}>{s}</p>
                <div style={{ height: 3, background: "#dbeafe", borderRadius: 2, marginTop: 2 }}>
                  <div style={{ height: "100%", background: accent, borderRadius: 2, width: `${70 + (i % 3) * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {r.certifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 4, marginBottom: 8 }}>Certifications</p>
            {r.certifications.map((c, i) => <p key={i} style={{ fontSize: 10, color: "#374151", marginBottom: 4 }}>• {c}</p>)}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "36px 32px" }}>
        {r.summary && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: 10 }}>About Me</div>
            <p style={{ color: "#374151", lineHeight: 1.7, marginBottom: 18 }}>{r.summary}</p>
          </>
        )}

        {r.experience.length > 0 && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: 12 }}>Experience</div>
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: `3px solid ${accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1e3a8a" }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, color: "#6b7280", background: "#eff6ff", padding: "2px 8px", borderRadius: 20 }}>{e.dates}</span>
                </div>
                {e.company && <p style={{ color: accent, fontWeight: 600, fontSize: 11, marginTop: 1 }}>{e.company}</p>}
                {e.bullets.length > 0 && (
                  <ul style={{ marginTop: 5, paddingLeft: 14, color: "#374151", lineHeight: 1.6 }}>
                    {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {r.education.length > 0 && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: 12, marginTop: 20 }}>Education</div>
            {r.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{e.degree}</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{e.year}</span>
                </div>
                {e.school && <p style={{ color: accent, fontSize: 11, fontWeight: 500 }}>{e.school}</p>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TEMPLATE 3: MINIMAL CLEAN
════════════════════════════════════════════════════════ */
function MinimalClean({ r }: { r: ParsedResume }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", padding: "52px 56px", minHeight: 960, color: "#1c1c1c", fontSize: 12 }}>
      <div style={{ textAlign: "center", marginBottom: 32, borderBottom: "1px solid #e5e7eb", paddingBottom: 24 }}>
        <h1 style={{ fontFamily: "'Merriweather', Georgia, serif", fontSize: 30, fontWeight: 700, letterSpacing: -0.5, color: "#111" }}>{r.name || "Your Name"}</h1>
        {r.jobTitle && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>{r.jobTitle}</p>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, marginTop: 12, fontSize: 11, color: "#9ca3af" }}>
          {r.email && <span>{r.email}</span>}
          {r.phone && <><span>·</span><span>{r.phone}</span></>}
          {r.address && <><span>·</span><span>{r.address}</span></>}
          {r.linkedin && <><span>·</span><span>{r.linkedin}</span></>}
        </div>
      </div>

      {r.summary && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", marginBottom: 10, fontWeight: 600 }}>Profile</p>
          <p style={{ lineHeight: 1.9, color: "#4b5563", fontStyle: "italic" }}>{r.summary}</p>
        </div>
      )}

      {r.experience.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", marginBottom: 14, fontWeight: 600 }}>Experience</p>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 18, display: "grid", gridTemplateColumns: "110px 1fr", gap: 16 }}>
              <div style={{ color: "#9ca3af", fontSize: 11, paddingTop: 1 }}>{e.dates}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{e.title}</p>
                {e.company && <p style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{e.company}</p>}
                {e.bullets.length > 0 && (
                  <ul style={{ marginTop: 6, paddingLeft: 14, color: "#4b5563", lineHeight: 1.7 }}>
                    {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {r.education.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", marginBottom: 14, fontWeight: 600 }}>Education</p>
          {r.education.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 16, marginBottom: 10 }}>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>{e.year}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{e.degree}</p>
                {e.school && <p style={{ color: "#6b7280", fontSize: 11 }}>{e.school}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {r.skills.length > 0 && (
        <div>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", marginBottom: 10, fontWeight: 600 }}>Skills</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {r.skills.map((s, i) => (
              <span key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "3px 10px", fontSize: 11, color: "#374151" }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TEMPLATE 4: EXECUTIVE
════════════════════════════════════════════════════════ */
function Executive({ r }: { r: ParsedResume }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: 960, color: "#111", fontSize: 12 }}>
      <div style={{ background: "#0f172a", color: "#fff", padding: "36px 48px 28px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>{r.name || "Your Name"}</h1>
        {r.jobTitle && <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6, fontWeight: 400, letterSpacing: 1 }}>{r.jobTitle.toUpperCase()}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 14, fontSize: 11, color: "#cbd5e1", borderTop: "1px solid #334155", paddingTop: 14 }}>
          {r.email && <span>✉ {r.email}</span>}
          {r.phone && <span>📞 {r.phone}</span>}
          {r.address && <span>📍 {r.address}</span>}
          {r.linkedin && <span>🔗 {r.linkedin}</span>}
        </div>
      </div>

      <div style={{ padding: "32px 48px" }}>
        {r.summary && (
          <div style={{ borderLeft: "4px solid #0f172a", paddingLeft: 16, marginBottom: 28 }}>
            <p style={{ lineHeight: 1.8, color: "#374151", fontSize: 13 }}>{r.summary}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 40 }}>
          <div>
            {r.experience.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: "2px solid #0f172a", paddingBottom: 6, marginBottom: 14 }}>Career History</div>
                {r.experience.map((e, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{e.title}</span>
                      <span style={{ fontSize: 10, color: "#6b7280", background: "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>{e.dates}</span>
                    </div>
                    {e.company && <p style={{ color: "#475569", fontWeight: 600, fontSize: 12, marginTop: 2 }}>{e.company}</p>}
                    {e.bullets.length > 0 && (
                      <ul style={{ marginTop: 6, paddingLeft: 16, color: "#374151", lineHeight: 1.7 }}>
                        {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 3 }}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <div>
            {r.skills.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: "2px solid #0f172a", paddingBottom: 6, marginBottom: 12 }}>Core Skills</div>
                {r.skills.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, background: "#0f172a", borderRadius: "50%", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#374151" }}>{s}</span>
                  </div>
                ))}
              </>
            )}

            {r.education.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: "2px solid #0f172a", paddingBottom: 6, marginBottom: 12 }}>Education</div>
                {r.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <p style={{ fontWeight: 700, fontSize: 12 }}>{e.degree}</p>
                    {e.school && <p style={{ color: "#6b7280", fontSize: 11 }}>{e.school}</p>}
                    {e.year && <p style={{ fontSize: 10, color: "#94a3b8" }}>{e.year}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TEMPLATE 5: CREATIVE DESIGNER
════════════════════════════════════════════════════════ */
function CreativeDesigner({ r }: { r: ParsedResume }) {
  const accent = "#7c3aed";
  const light = "#f5f3ff";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: 960, color: "#1a1a2e", display: "flex", fontSize: 12 }}>
      {/* Left sidebar */}
      <div style={{ width: 220, background: accent, color: "#fff", padding: "40px 22px", flexShrink: 0 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, marginBottom: 16 }}>
          {(r.name || "?")[0]}
        </div>
        <h1 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{r.name || "Your Name"}</h1>
        {r.jobTitle && <p style={{ fontSize: 11, opacity: 0.8, marginTop: 4, fontWeight: 400 }}>{r.jobTitle}</p>}

        <div style={{ marginTop: 20, fontSize: 10, lineHeight: 2, opacity: 0.85 }}>
          {r.email && <p>✉ {r.email}</p>}
          {r.phone && <p>📞 {r.phone}</p>}
          {r.address && <p>📍 {r.address}</p>}
          {r.linkedin && <p style={{ wordBreak: "break-all" }}>🔗 {r.linkedin}</p>}
        </div>

        {r.skills.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 6, marginBottom: 10 }}>Skills</p>
            {r.skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <p style={{ fontSize: 10.5, marginBottom: 3 }}>{s}</p>
                <div style={{ height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 3 }}>
                  <div style={{ height: "100%", background: "#fff", borderRadius: 3, width: `${60 + (i * 13) % 40}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {r.certifications.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 6, marginBottom: 10 }}>Certifications</p>
            {r.certifications.map((c, i) => <p key={i} style={{ fontSize: 10, opacity: 0.85, marginBottom: 5 }}>● {c}</p>)}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "40px 36px" }}>
        {r.summary && (
          <div style={{ background: light, borderRadius: 10, padding: "14px 18px", marginBottom: 24, borderLeft: `4px solid ${accent}` }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, marginBottom: 6 }}>About Me</p>
            <p style={{ lineHeight: 1.8, color: "#374151" }}>{r.summary}</p>
          </div>
        )}

        {r.experience.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 2, background: accent, borderRadius: 1 }} />Experience<div style={{ flex: 1, height: 2, background: accent, borderRadius: 1 }} />
            </div>
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 18, position: "relative", paddingLeft: 20 }}>
                <div style={{ position: "absolute", left: 0, top: 5, width: 10, height: 10, borderRadius: "50%", background: accent }} />
                {i < r.experience.length - 1 && <div style={{ position: "absolute", left: 4.5, top: 15, width: 1, height: "calc(100% + 6px)", background: `${accent}40` }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: "#1a1a2e" }}>{e.title}</span>
                  <span style={{ fontSize: 10, color: "#6b7280", background: light, padding: "2px 8px", borderRadius: 20 }}>{e.dates}</span>
                </div>
                {e.company && <p style={{ color: accent, fontWeight: 600, fontSize: 11, marginTop: 1 }}>{e.company}</p>}
                {e.bullets.length > 0 && (
                  <ul style={{ marginTop: 5, paddingLeft: 14, color: "#374151", lineHeight: 1.6 }}>
                    {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {r.education.length > 0 && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 2, background: accent, borderRadius: 1 }} />Education<div style={{ flex: 1, height: 2, background: accent, borderRadius: 1 }} />
            </div>
            {r.education.map((e, i) => (
              <div key={i} style={{ background: light, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{e.degree}</p>
                {e.school && <p style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{e.school}</p>}
                {e.year && <p style={{ fontSize: 10, color: accent, fontWeight: 600, marginTop: 2 }}>{e.year}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Template renderer ──────────────────────────────────── */
function ResumeTemplate({ id, resume }: { id: TemplateId; resume: ParsedResume }) {
  switch (id) {
    case "ats": return <ATSProfessional r={resume} />;
    case "modern": return <ModernCorporate r={resume} />;
    case "minimal": return <MinimalClean r={resume} />;
    case "executive": return <Executive r={resume} />;
    case "creative": return <CreativeDesigner r={resume} />;
  }
}

/* ── Upload zone ────────────────────────────────────────── */
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`flex flex-col items-center gap-4 border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${drag ? "border-violet-500 bg-violet-50" : "border-gray-300 bg-white hover:border-violet-400 hover:bg-violet-50/30"}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl">🎨</div>
      <div className="text-center">
        <p className="text-base font-semibold text-gray-800">Upload your resume</p>
        <p className="text-sm text-gray-500 mt-1">We'll generate 5 beautiful templates instantly</p>
        <p className="text-xs text-gray-400 mt-2">PDF or DOCX</p>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
type State = { phase: "upload" } | { phase: "loading" } | { phase: "done"; resume: ParsedResume; fileName: string } | { phase: "error"; message: string };

export default function ResumeDesigner() {
  const [state, setState] = useState<State>({ phase: "upload" });
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("ats");

  const handleFile = useCallback(async (file: File) => {
    setState({ phase: "loading" });
    try {
      const text = await extractText(file);
      await new Promise(r => setTimeout(r, 300));
      const resume = parseResumeText(text);
      setState({ phase: "done", resume, fileName: file.name });
    } catch (err: any) {
      setState({ phase: "error", message: err?.message ?? "Failed to process file." });
    }
  }, []);

  if (state.phase !== "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">🎨 Resume Design Generator</div>
            <h1 className="text-3xl font-bold text-gray-900">Transform your resume <span className="text-violet-600">into 5 styles</span></h1>
            <p className="text-gray-500 text-sm">Upload your resume — we parse the content and apply 5 professional templates instantly.</p>
          </div>
          {state.phase === "upload" && <UploadZone onFile={handleFile} />}
          {state.phase === "loading" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center gap-5">
              <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
              <p className="font-semibold text-gray-800">Generating templates…</p>
            </div>
          )}
          {state.phase === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
              <p className="text-red-600">{state.message}</p>
              <button onClick={() => setState({ phase: "upload" })} className="text-indigo-600 underline text-sm">Try again</button>
            </div>
          )}
          {state.phase === "upload" && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TEMPLATES.map(t => (
                <div key={t.id} className="text-center">
                  <div className={`w-full aspect-[3/4] rounded-lg ${t.palette} opacity-80`} />
                  <p className="text-xs text-gray-600 mt-1.5 font-medium leading-tight">{t.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { resume, fileName } = state;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Resume Design Generator</h1>
          <p className="text-sm text-gray-500 truncate max-w-sm">{fileName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setState({ phase: "upload" })} className="text-sm text-gray-500 hover:text-gray-800 font-medium border border-gray-300 px-3 py-1.5 rounded-lg">
            ↑ Upload New
          </button>
          <button
            onClick={() => downloadResumePDF(resume.name)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            ↓ Download PDF
          </button>
        </div>
      </div>

      {/* Template picker */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={`flex-shrink-0 border-2 rounded-xl p-3 text-left transition-all w-40 ${activeTemplate === t.id ? "border-violet-500 shadow-md bg-white" : "border-gray-200 bg-white hover:border-gray-300"}`}
          >
            <div className={`w-full h-16 rounded-lg ${t.palette} mb-2 opacity-80`} />
            <p className={`text-xs font-semibold leading-tight ${activeTemplate === t.id ? "text-violet-700" : "text-gray-700"}`}>{t.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Template render */}
      <div className="bg-gray-200 rounded-2xl p-6 flex justify-center overflow-x-auto">
        <div
          id="resume-template-render"
          className="bg-white shadow-xl"
          style={{ width: 780, minHeight: 960, borderRadius: 4, overflow: "hidden" }}
        >
          <ResumeTemplate id={activeTemplate} resume={resume} />
        </div>
      </div>

      {/* Info hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>💡 Tip:</strong> Click <strong>Download PDF</strong> to open the print dialog. Use your browser's "Save as PDF" option for the best results. Content is preserved across all templates.
      </div>
    </div>
  );
}
