import { useState, useCallback, useRef, useMemo } from "react";
import { Upload, LayoutTemplate, Zap, Download, Settings2, Check, Sparkles } from "lucide-react";
import { extractText } from "../lib/extractor";
import { parseResume, ParsedResume } from "../lib/resumeParser";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
type TemplateRenderer = "modern" | "classic" | "creative" | "minimal" | "professional" | "executive";

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  renderer: TemplateRenderer;
  accent: string;
}

interface Customization {
  font: string;
  accent: string;
  margins: "compact" | "normal" | "wide";
  showIcons: boolean;
  fontSize: "sm" | "md" | "lg";
}

/* ─────────────────────────────────────────────────────────
   TEMPLATE DEFINITIONS
───────────────────────────────────────────────────────── */
const TEMPLATES: TemplateConfig[] = [
  { id: "sw-dev",    name: "Software Developer",   description: "Two-column modern layout with sidebar skills",  category: "Software Developer",   renderer: "modern",       accent: "#6C63FF" },
  { id: "gfx",       name: "Graphic Designer",      description: "Bold creative header with vibrant accents",     category: "Graphic Designer",     renderer: "creative",     accent: "#FF6B6B" },
  { id: "ux",        name: "UI/UX Designer",        description: "Clean two-column with teal accents",            category: "UI/UX Designer",       renderer: "creative",     accent: "#14B8A6" },
  { id: "mkt",       name: "Marketing",             description: "Professional layout with warm orange accents",  category: "Marketing",            renderer: "professional", accent: "#F97316" },
  { id: "sales",     name: "Sales",                 description: "Result-focused layout with green accents",      category: "Sales",                renderer: "professional", accent: "#10B981" },
  { id: "hr",        name: "Human Resources",       description: "Structured professional layout",                category: "Human Resources",      renderer: "professional", accent: "#8B5CF6" },
  { id: "finance",   name: "Finance",               description: "Authoritative single-column classic style",     category: "Finance",              renderer: "classic",      accent: "#1E40AF" },
  { id: "acct",      name: "Accounting",            description: "Precise and structured classic layout",         category: "Accounting",           renderer: "classic",      accent: "#065F46" },
  { id: "data",      name: "Data Analyst",          description: "Modern two-column with sky-blue accents",       category: "Data Analyst",         renderer: "modern",       accent: "#0EA5E9" },
  { id: "ba",        name: "Business Analyst",      description: "Executive single-column, refined and clean",    category: "Business Analyst",     renderer: "executive",    accent: "#334155" },
  { id: "health",    name: "Healthcare",            description: "Clean clinical layout with trustworthy colors", category: "Healthcare",           renderer: "professional", accent: "#0284C7" },
  { id: "teacher",   name: "Teacher",               description: "Warm professional layout for educators",        category: "Teacher",              renderer: "professional", accent: "#7C3AED" },
  { id: "lawyer",    name: "Lawyer",                description: "Authoritative classic layout in deep navy",     category: "Lawyer",               renderer: "classic",      accent: "#1E293B" },
  { id: "support",   name: "Customer Support",      description: "Friendly and clear professional layout",        category: "Customer Support",     renderer: "professional", accent: "#EC4899" },
  { id: "fresher",   name: "Fresher / Student",     description: "Clean minimal layout perfect for new grads",    category: "Fresher / Student",    renderer: "minimal",      accent: "#6C63FF" },
  { id: "exec",      name: "Executive",             description: "Premium executive layout with dark elegance",   category: "Executive",            renderer: "executive",    accent: "#0F172A" },
  { id: "creative",  name: "Creative",              description: "Expressive layout with purple gradient header", category: "Creative",             renderer: "creative",     accent: "#8B5CF6" },
  { id: "ats",       name: "Minimal ATS Friendly",  description: "Ultra-clean single-column, 100% ATS safe",      category: "Minimal ATS Friendly", renderer: "minimal",      accent: "#374151" },
];

const FONTS = ["Inter", "Georgia", "Roboto", "Merriweather", "Helvetica Neue"];
const ACCENT_PRESETS = ["#6C63FF", "#0EA5E9", "#10B981", "#F97316", "#EC4899", "#8B5CF6", "#EF4444", "#0F172A"];
const MARGIN_VALUES = { compact: "16px 20px", normal: "28px 32px", wide: "40px 48px" };

/* ─────────────────────────────────────────────────────────
   RESUME RENDERERS  (return an HTML string for PDF/preview)
───────────────────────────────────────────────────────── */
function ResumeModern({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 12 : cust.fontSize === "lg" ? 15 : 13;
  const pad = MARGIN_VALUES[cust.margins];
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100%", background: "#fff" }}>
      {/* Sidebar */}
      <div style={{ background: a, color: "#fff", padding: pad, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{data.name || "Your Name"}</div>
          {data.experience[0]?.title && <div style={{ fontSize: 12, opacity: 0.85 }}>{data.experience[0].title}</div>}
        </div>
        {/* Contact */}
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, marginBottom: 4 }}>Contact</div>
          {data.contact.email && <div>✉ {data.contact.email}</div>}
          {data.contact.phone && <div>📞 {data.contact.phone}</div>}
          {data.contact.location && <div>📍 {data.contact.location}</div>}
          {data.contact.linkedin && <div>in {data.contact.linkedin}</div>}
          {data.contact.github && <div>⌥ {data.contact.github}</div>}
        </div>
        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, fontSize: 11, marginBottom: 8 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {data.skills.slice(0, 16).map((s, i) => (
                <span key={i} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 4, padding: "2px 8px", fontSize: 10 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {/* Education sidebar */}
        {data.education.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, fontSize: 11, marginBottom: 8 }}>Education</div>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{e.degree}</div>
                <div style={{ opacity: 0.8, fontSize: 11 }}>{e.school}</div>
                <div style={{ opacity: 0.65, fontSize: 10 }}>{e.dates}</div>
              </div>
            ))}
          </div>
        )}
        {data.certifications.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, fontSize: 11, marginBottom: 6 }}>Certifications</div>
            {data.certifications.map((c, i) => <div key={i} style={{ fontSize: 10, opacity: 0.85, marginBottom: 3 }}>• {c}</div>)}
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: 20 }}>
        {data.summary && (
          <div>
            <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, color: a, marginBottom: 6, paddingBottom: 4, borderBottom: `2px solid ${a}` }}>Profile</div>
            <div style={{ fontSize: fs, lineHeight: 1.65, color: "#475569" }}>{data.summary}</div>
          </div>
        )}
        {data.experience.length > 0 && (
          <div>
            <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, color: a, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}` }}>Experience</div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</div>
                </div>
                <div style={{ color: a, fontSize: 12, fontWeight: 500, marginTop: 1 }}>{exp.company}</div>
                <ul style={{ margin: "6px 0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.5 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        {data.projects.length > 0 && (
          <div>
            <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, color: a, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}` }}>Projects</div>
            {data.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: fs }}>{p.name}</div>
                {p.tech && <div style={{ fontSize: 10, color: a, fontWeight: 500 }}>{p.tech}</div>}
                <div style={{ fontSize: fs - 1, color: "#475569", marginTop: 2 }}>{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeClassic({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 12 : cust.fontSize === "lg" ? 15 : 13;
  const pad = MARGIN_VALUES[cust.margins];
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${a}` }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: a }}>{data.name || "Your Name"}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          {data.contact.email && <span>✉ {data.contact.email}</span>}
          {data.contact.phone && <span>📞 {data.contact.phone}</span>}
          {data.contact.location && <span>📍 {data.contact.location}</span>}
          {data.contact.linkedin && <span>in {data.contact.linkedin}</span>}
        </div>
      </div>
      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, fontSize: 10, color: a, marginBottom: 6 }}>Professional Summary</div>
          <div style={{ lineHeight: 1.7, color: "#374151" }}>{data.summary}</div>
        </div>
      )}
      {/* Experience */}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, fontSize: 10, color: a, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid #e2e8f0` }}>Professional Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{exp.dates}</span>
              </div>
              <div style={{ fontStyle: "italic", color: "#475569", marginBottom: 4, fontSize: 12 }}>{exp.company}</div>
              <ul style={{ margin: "4px 0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.55, color: "#374151" }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* Education */}
      {data.education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, fontSize: 10, color: a, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid #e2e8f0` }}>Education</div>
          {data.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{e.degree}</div>
                <div style={{ color: "#475569", fontSize: 12 }}>{e.school}</div>
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{e.dates}</div>
            </div>
          ))}
        </div>
      )}
      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, fontSize: 10, color: a, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid #e2e8f0` }}>Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.skills.slice(0, 20).map((s, i) => (
              <span key={i} style={{ border: `1px solid ${a}33`, borderRadius: 4, padding: "2px 10px", fontSize: 11, color: a }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeCreative({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 12 : cust.fontSize === "lg" ? 15 : 13;
  const pad = MARGIN_VALUES[cust.margins];
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", background: "#fff" }}>
      {/* Bold Header */}
      <div style={{ background: `linear-gradient(135deg, ${a} 0%, ${a}cc 100%)`, color: "#fff", padding: "32px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4, fontWeight: 300 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, opacity: 0.85 }}>
          {data.contact.email && <span>✉ {data.contact.email}</span>}
          {data.contact.phone && <span>📞 {data.contact.phone}</span>}
          {data.contact.location && <span>📍 {data.contact.location}</span>}
          {data.contact.linkedin && <span>in {data.contact.linkedin}</span>}
        </div>
      </div>
      {/* Body grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 0 }}>
        {/* Main content */}
        <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: 20 }}>
          {data.summary && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: a, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>About Me</div>
              <div style={{ lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: a, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: `3px solid ${a}40` }}>
                  <div style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</div>
                  <div style={{ color: a, fontWeight: 600, fontSize: 12 }}>{exp.company}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{exp.dates}</div>
                  {exp.bullets.slice(0, 3).map((b, j) => (
                    <div key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.5, paddingLeft: 8 }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: a, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `3px solid ${a}40` }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  {p.tech && <div style={{ fontSize: 10, color: a }}>{p.tech}</div>}
                  <div style={{ fontSize: fs - 1, color: "#475569" }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div style={{ background: "#f8fafc", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 18, borderLeft: `1px solid #e2e8f0` }}>
          {data.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: a, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.skills.slice(0, 12).map((s, i) => (
                  <div key={i} style={{ fontSize: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span>{s}</span>
                    </div>
                    <div style={{ height: 3, background: "#e2e8f0", borderRadius: 2 }}>
                      <div style={{ height: "100%", background: a, borderRadius: 2, width: `${70 + ((i * 13) % 30)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: a, marginBottom: 8 }}>Education</div>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{e.degree}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{e.school}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.dates}</div>
                </div>
              ))}
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: a, marginBottom: 6 }}>Certs</div>
              {data.certifications.slice(0, 4).map((c, i) => <div key={i} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>• {c}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumeMinimal({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 12 : cust.fontSize === "lg" ? 15 : 13;
  const pad = MARGIN_VALUES[cust.margins];
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", display: "flex", flexWrap: "wrap", gap: 10 }}>
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
        </div>
      </div>
      <hr style={{ border: "none", borderTop: `1px solid #e2e8f0`, marginBottom: 16 }} />
      {data.summary && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 6 }}>Summary</div>
          <div style={{ lineHeight: 1.7, color: "#374151" }}>{data.summary}</div>
        </div>
      )}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8 }}>Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{exp.title} — {exp.company}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{exp.dates}</span>
              </div>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.6, color: "#475569" }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {data.education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8 }}>Education</div>
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span><span style={{ fontWeight: 600 }}>{e.degree}</span>, {e.school}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{e.dates}</span>
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8 }}>Skills</div>
          <div style={{ lineHeight: 1.9, color: "#374151" }}>{data.skills.slice(0, 24).join(" · ")}</div>
        </div>
      )}
    </div>
  );
}

function ResumeProfessional({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 12 : cust.fontSize === "lg" ? 15 : 13;
  const pad = MARGIN_VALUES[cust.margins];
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", background: "#fff" }}>
      {/* Header bar */}
      <div style={{ background: a, color: "#fff", padding: "24px 32px" }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ opacity: 0.85, marginTop: 3, fontSize: 13 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 14, fontSize: 11, opacity: 0.85 }}>
          {data.contact.email && <span>✉ {data.contact.email}</span>}
          {data.contact.phone && <span>📞 {data.contact.phone}</span>}
          {data.contact.location && <span>📍 {data.contact.location}</span>}
          {data.contact.linkedin && <span>in {data.contact.linkedin}</span>}
        </div>
      </div>
      <div style={{ padding: pad }}>
        {data.summary && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ flex: 1, height: 1, background: `${a}30` }} />
              Professional Summary
              <span style={{ flex: 1, height: 1, background: `${a}30` }} />
            </div>
            <div style={{ lineHeight: 1.7, color: "#475569", textAlign: "center" }}>{data.summary}</div>
          </div>
        )}
        {/* Two-column body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 24 }}>
          <div>
            {data.experience.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 10, paddingBottom: 5, borderBottom: `2px solid ${a}30` }}>Work Experience</div>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{exp.dates}</span>
                    </div>
                    <div style={{ color: a, fontWeight: 500, fontSize: 12, marginBottom: 4 }}>{exp.company}</div>
                    {exp.bullets.slice(0, 3).map((b, j) => (
                      <div key={j} style={{ fontSize: fs - 1, color: "#475569", paddingLeft: 10, lineHeight: 1.55 }}>• {b}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {data.projects.length > 0 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 10, paddingBottom: 5, borderBottom: `2px solid ${a}30` }}>Projects</div>
                {data.projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: fs - 1, color: "#475569" }}>{p.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.skills.length > 0 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8, paddingBottom: 5, borderBottom: `2px solid ${a}30` }}>Skills</div>
                {data.skills.slice(0, 14).map((s, i) => (
                  <div key={i} style={{ fontSize: 11, padding: "3px 0", borderBottom: "1px solid #f1f5f9", color: "#374151" }}>{s}</div>
                ))}
              </div>
            )}
            {data.education.length > 0 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8, paddingBottom: 5, borderBottom: `2px solid ${a}30` }}>Education</div>
                {data.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 11 }}>{e.degree}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{e.school}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.dates}</div>
                  </div>
                ))}
              </div>
            )}
            {data.certifications.length > 0 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 6, paddingBottom: 5, borderBottom: `2px solid ${a}30` }}>Certs</div>
                {data.certifications.slice(0, 4).map((c, i) => <div key={i} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>• {c}</div>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeExecutive({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 12 : cust.fontSize === "lg" ? 15 : 13;
  const pad = MARGIN_VALUES[cust.margins];
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff" }}>
      {/* Elegant header */}
      <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid #e2e8f0` }}>
        <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: 4, textTransform: "uppercase", color: "#0f172a" }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 12, letterSpacing: 3, color: a, marginTop: 4, textTransform: "uppercase", fontWeight: 600 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 10, fontSize: 11, color: "#64748b", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <div style={{ lineHeight: 1.8, color: "#475569", fontStyle: "italic", maxWidth: 600, margin: "0 auto" }}>{data.summary}</div>
        </div>
      )}
      {/* Horizontal rule */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: `${a}40` }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: a }} />
        <div style={{ flex: 1, height: 1, background: `${a}40` }} />
      </div>
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 3, color: a, marginBottom: 12 }}>Career History</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "140px 1fr", gap: 12 }}>
              <div style={{ textAlign: "right", paddingRight: 16, borderRight: `2px solid ${a}30` }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{exp.dates}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: a, marginTop: 2 }}>{exp.company}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</div>
                <ul style={{ margin: "4px 0 0 14px", padding: 0 }}>
                  {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.6, color: "#475569", fontSize: fs - 1 }}>{b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {data.education.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 3, color: a, marginBottom: 8 }}>Education</div>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{e.school} · {e.dates}</div>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 3, color: a, marginBottom: 8 }}>Core Competencies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {data.skills.slice(0, 16).map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: "#374151", borderBottom: `1px solid ${a}40`, paddingBottom: 1 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER DISPATCHER
───────────────────────────────────────────────────────── */
function ResumeRenderer({ data, template, cust }: { data: ParsedResume; template: TemplateConfig; cust: Customization }) {
  const effectiveCust: Customization = { ...cust, accent: cust.accent };
  switch (template.renderer) {
    case "modern":       return <ResumeModern data={data} cust={effectiveCust} />;
    case "classic":      return <ResumeClassic data={data} cust={effectiveCust} />;
    case "creative":     return <ResumeCreative data={data} cust={effectiveCust} />;
    case "minimal":      return <ResumeMinimal data={data} cust={effectiveCust} />;
    case "professional": return <ResumeProfessional data={data} cust={effectiveCust} />;
    case "executive":    return <ResumeExecutive data={data} cust={effectiveCust} />;
  }
}

/* ─────────────────────────────────────────────────────────
   MINI TEMPLATE PREVIEW (thumbnail)
───────────────────────────────────────────────────────── */
function TemplateThumbnail({ template }: { template: TemplateConfig }) {
  const dummyData: ParsedResume = {
    name: "Alexandra Chen",
    contact: { email: "alex@email.com", phone: "+1 555 0123", location: "San Francisco, CA", linkedin: "linkedin.com/in/alex", github: "github.com/alex", website: "" },
    summary: "Experienced professional with proven track record of delivering results. Strong communication and problem-solving skills.",
    experience: [
      { title: "Senior Manager", company: "TechCorp Inc.", dates: "2021 – Present", bullets: ["Led cross-functional team of 12 engineers", "Increased revenue by 40% year over year", "Delivered 3 major product launches"] },
      { title: "Manager", company: "StartUp Co.", dates: "2019 – 2021", bullets: ["Managed product roadmap", "Built partner relationships"] },
    ],
    education: [{ degree: "B.S. Computer Science", school: "Stanford University", dates: "2015 – 2019", details: [] }],
    skills: ["Leadership", "Strategy", "Python", "SQL", "React", "Communication", "Analytics", "Project Mgmt"],
    projects: [{ name: "Analytics Dashboard", description: "Built real-time dashboard", tech: "React, D3.js" }],
    certifications: ["AWS Solutions Architect", "PMP Certified"],
    languages: ["English", "Mandarin"],
    rawSections: [],
  };
  const cust: Customization = { font: "Inter", accent: template.accent, margins: "compact", showIcons: true, fontSize: "sm" };

  return (
    <div style={{ width: 280, height: 370, overflow: "hidden", position: "relative", borderRadius: 8, background: "#fff" }}>
      <div style={{ transform: "scale(0.57)", transformOrigin: "top left", width: `${280 / 0.57}px`, height: `${370 / 0.57}px`, pointerEvents: "none" }}>
        <ResumeRenderer data={dummyData} template={template} cust={cust} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TEMPLATE GALLERY
───────────────────────────────────────────────────────── */
const CATEGORIES = ["All", ...TEMPLATES.map(t => t.category)];

function TemplateGallery({ onSelect }: { onSelect: (t: TemplateConfig) => void }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="space-y-6">
      {/* Category filter — scrollable pill row */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              filter === c
                ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-[0_2px_8px_rgba(108,99,255,0.3)]"
                : "bg-white border border-slate-200 text-slate-600 hover:border-[#6C63FF]/40 hover:text-[#6C63FF]"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(template => (
          <div key={template.id}
            className="card-base card-hover group overflow-hidden cursor-pointer"
            onClick={() => onSelect(template)}>
            {/* Thumbnail */}
            <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
              <TemplateThumbnail template={template} />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(template); }}
                  className="w-full btn-primary text-sm py-2.5 justify-center">
                  Use This Template
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
                </div>
                <div className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 border-white shadow-sm" style={{ background: template.accent }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CUSTOMIZATION PANEL
───────────────────────────────────────────────────────── */
function CustomizationPanel({ cust, onChange }: { cust: Customization; onChange: (c: Customization) => void }) {
  return (
    <div className="space-y-5">
      {/* Accent color */}
      <div>
        <p className="section-label mb-3">Accent Color</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map(color => (
            <button key={color} onClick={() => onChange({ ...cust, accent: color })}
              className={`w-7 h-7 rounded-full border-2 transition-all ${cust.accent === color ? "border-slate-800 scale-110" : "border-transparent hover:scale-105"}`}
              style={{ background: color }} />
          ))}
          <input type="color" value={cust.accent} onChange={e => onChange({ ...cust, accent: e.target.value })}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent" title="Custom color" />
        </div>
      </div>

      {/* Font */}
      <div>
        <p className="section-label mb-2">Font Family</p>
        <select value={cust.font} onChange={e => onChange({ ...cust, font: e.target.value })}
          className="input-base text-sm">
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Font size */}
      <div>
        <p className="section-label mb-2">Font Size</p>
        <div className="flex gap-2">
          {(["sm", "md", "lg"] as const).map(sz => (
            <button key={sz} onClick={() => onChange({ ...cust, fontSize: sz })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                cust.fontSize === sz ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C63FF]/40"
              }`}>
              {sz === "sm" ? "Small" : sz === "md" ? "Medium" : "Large"}
            </button>
          ))}
        </div>
      </div>

      {/* Margins */}
      <div>
        <p className="section-label mb-2">Page Margins</p>
        <div className="flex gap-2">
          {(["compact", "normal", "wide"] as const).map(m => (
            <button key={m} onClick={() => onChange({ ...cust, margins: m })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                cust.margins === m ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C63FF]/40"
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between py-3 border-t border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-700">Show Icons</p>
          <p className="text-xs text-slate-400">Contact & section icons</p>
        </div>
        <button onClick={() => onChange({ ...cust, showIcons: !cust.showIcons })}
          className={`relative w-10 h-6 rounded-full transition-colors ${cust.showIcons ? "bg-[#6C63FF]" : "bg-slate-200"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${cust.showIcons ? "left-5" : "left-1"}`} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   EXPORT HELPERS
───────────────────────────────────────────────────────── */
function getResumeHtml(container: HTMLElement | null): string {
  return container?.innerHTML ?? "";
}

function exportPDF(containerRef: React.RefObject<HTMLDivElement | null>, name: string) {
  const content = containerRef.current?.innerHTML ?? "";
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name} - Resume</title>
    <style>@page{size:A4;margin:0}body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    *{box-sizing:border-box}</style></head><body>${content}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

function exportDOCX(containerRef: React.RefObject<HTMLDivElement | null>, name: string) {
  const content = containerRef.current?.innerHTML ?? "";
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${name}</title>
    <style>body{font-family:Calibri,sans-serif;font-size:11pt}
    table{border-collapse:collapse}td,th{padding:4pt}</style></head>
    <body>${content}</body></html>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name.replace(/\s+/g, "_")}_Resume.doc`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
type Step = "upload" | "template" | "customize";

export default function ResumeRedesign() {
  const [step, setStep] = useState<Step>("upload");
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(TEMPLATES[0]);
  const [cust, setCust] = useState<Customization>({ font: "Inter", accent: "#6C63FF", margins: "normal", showIcons: true, fontSize: "md" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".doc")) {
      setError("Please upload a PDF or DOCX file."); return;
    }
    setLoading(true); setError("");
    try {
      const text = await extractText(file);
      const parsed = parseResume(text);
      setRawText(text);
      setFileName(file.name);
      setParsedData(parsed);
      if (parsed.experience.length > 0 || parsed.skills.length > 0) {
        setStep("template");
      } else {
        setStep("template");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to read file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  }, [handleFile]);

  const handleTemplateSelect = (t: TemplateConfig) => {
    setSelectedTemplate(t);
    setCust(c => ({ ...c, accent: t.accent }));
    setStep("customize");
  };

  const STEP_LABELS = ["Upload Resume", "Choose Template", "Preview & Export"];
  const stepIdx = step === "upload" ? 0 : step === "template" ? 1 : 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-50 text-[#6C63FF] text-xs font-semibold px-4 py-2 rounded-full border border-violet-200 mb-3">
            <Sparkles className="w-3 h-3" />AI Resume Redesign
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transform your resume layout</h1>
          <p className="text-sm text-slate-400 mt-1">Upload your existing resume, pick a template, and get a professionally redesigned version.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < stepIdx ? "bg-emerald-500 text-white"
                : i === stepIdx ? "bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white shadow-[0_2px_8px_rgba(108,99,255,0.35)]"
                : "bg-slate-100 text-slate-400"
              }`}>
                {i < stepIdx ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === stepIdx ? "text-slate-900" : i < stepIdx ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 rounded-full ${i < stepIdx ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Upload ── */}
      {step === "upload" && (
        <div className="max-w-xl mx-auto space-y-8 py-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Upload your existing resume</h2>
            <p className="text-sm text-slate-400">We'll extract all your information and apply a beautiful new design.</p>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative group flex flex-col items-center justify-center gap-6 rounded-3xl p-14 cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
              dragging ? "border-[#6C63FF] bg-violet-50/80 scale-[1.01]" : "border-slate-200 bg-gradient-to-b from-white to-slate-50/80 hover:border-[#6C63FF]/60 hover:bg-violet-50/30 hover:scale-[1.005]"
            }`}
          >
            <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${dragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.06) 0%, transparent 70%)" }} />
            <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              dragging ? "bg-[#6C63FF] scale-110 shadow-[0_8px_24px_rgba(108,99,255,0.4)]" : "bg-white border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_24px_rgba(108,99,255,0.2)] group-hover:scale-105"
            }`}>
              <Upload className={`w-9 h-9 transition-colors duration-200 ${dragging ? "text-white" : "text-[#6C63FF]"}`} strokeWidth={1.5} />
            </div>
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-violet-100 border-t-[#6C63FF] rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-600">Extracting resume content…</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-base font-semibold text-slate-800">{dragging ? "Drop your resume here" : "Upload your resume"}</p>
                <p className="text-sm text-slate-400 mt-1">Drag & drop or <span className="text-[#6C63FF] font-medium">browse files</span></p>
                <p className="text-xs text-slate-300 mt-2 font-medium tracking-wide uppercase">PDF · DOCX · DOC</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-600 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {([
              { Icon: LayoutTemplate, title: "18 Templates",    desc: "Professional designs for every field", bg: "bg-violet-50", ic: "text-[#6C63FF]" },
              { Icon: Zap,            title: "Instant Redesign", desc: "Layout applied in seconds",           bg: "bg-amber-50",  ic: "text-amber-500" },
              { Icon: Download,       title: "PDF & DOCX",      desc: "Download in your preferred format",   bg: "bg-emerald-50",ic: "text-emerald-600" },
            ] as const).map(({ Icon, title, desc, bg, ic }) => (
              <div key={title} className="card-base card-hover p-4 text-center">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-4.5 h-4.5 ${ic}`} />
                </div>
                <p className="text-xs font-bold text-slate-800">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Template Gallery ── */}
      {step === "template" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Choose a template</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {parsedData?.name ? `Resume for ${parsedData.name}` : fileName} — {parsedData?.experience.length ?? 0} jobs, {parsedData?.skills.length ?? 0} skills extracted
              </p>
            </div>
            <button onClick={() => setStep("upload")} className="btn-secondary text-xs">← Re-upload</button>
          </div>
          <TemplateGallery onSelect={handleTemplateSelect} />
        </div>
      )}

      {/* ── STEP 3: Preview & Customize ── */}
      {step === "customize" && parsedData && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setStep("template")} className="btn-secondary text-xs">← Back to Templates</button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-700">
              <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: cust.accent }} />
              {selectedTemplate.name}
            </div>
            <div className="flex-1" />
            <button
              onClick={() => setShowCustomize(s => !s)}
              className={`btn-secondary text-xs gap-1.5 ${showCustomize ? "border-[#6C63FF] text-[#6C63FF]" : ""}`}>
              <Settings2 className="w-3.5 h-3.5" />Customize
            </button>
            <button onClick={() => exportPDF(rendererRef, parsedData.name || "resume")}
              className="btn-primary text-xs px-5 py-2.5 gap-1.5">
              <Download className="w-3.5 h-3.5" />PDF
            </button>
            <button onClick={() => exportDOCX(rendererRef, parsedData.name || "resume")}
              className="btn-secondary text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />DOCX
            </button>
          </div>

          <div className={`grid gap-5 ${showCustomize ? "grid-cols-1 lg:grid-cols-[1fr_1fr_280px]" : "grid-cols-1 md:grid-cols-2"}`}>
            {/* Original */}
            <div className="card-base overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-slate-500">Original Resume</span>
              </div>
              <div className="p-4 h-[600px] overflow-y-auto">
                <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">{rawText.slice(0, 4000)}{rawText.length > 4000 ? "\n…" : ""}</pre>
              </div>
            </div>

            {/* Redesigned */}
            <div className="card-base overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: cust.accent }} />
                <span className="text-xs font-semibold text-slate-700">Redesigned — {selectedTemplate.name}</span>
              </div>
              <div className="h-[600px] overflow-y-auto" ref={rendererRef}>
                <ResumeRenderer data={parsedData} template={selectedTemplate} cust={cust} />
              </div>
            </div>

            {/* Customization panel */}
            {showCustomize && (
              <div className="card-base p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-5">Customization</h3>
                <CustomizationPanel cust={cust} onChange={setCust} />

                {/* Template switcher */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="section-label mb-3">Switch Template</p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => { setSelectedTemplate(t); setCust(c => ({ ...c, accent: t.accent })); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                          selectedTemplate.id === t.id ? "bg-violet-50 text-[#6C63FF] border border-violet-200" : "hover:bg-slate-50 text-slate-600"
                        }`}>
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.accent }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Parsed data summary */}
          <div className="card-base p-5">
            <p className="text-sm font-bold text-slate-900 mb-3">Extracted Content Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Name", value: parsedData.name || "—" },
                { label: "Experience", value: `${parsedData.experience.length} jobs` },
                { label: "Skills", value: `${parsedData.skills.length} skills` },
                { label: "Education", value: `${parsedData.education.length} degrees` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="section-label">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
