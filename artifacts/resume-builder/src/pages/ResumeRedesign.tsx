import { useState, useCallback, useRef } from "react";
import { Upload, LayoutTemplate, Zap, Download, Settings2, Check, Sparkles, Heart } from "lucide-react";
import { extractText } from "../lib/extractor";
import { parseResume, ParsedResume } from "../lib/resumeParser";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
type TemplateRenderer =
  | "ats" | "sidebar" | "google" | "dark-header"
  | "swiss" | "timeline" | "deloitte" | "executive"
  | "split" | "editorial" | "microsoft" | "minimal";

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  renderer: TemplateRenderer;
  accent: string;
  atsScore: number;
  isPremium?: boolean;
  columns: 1 | 2;
  style: string;
}

interface Customization {
  font: string;
  accent: string;
  margins: "compact" | "normal" | "wide";
  showIcons: boolean;
  fontSize: "sm" | "md" | "lg";
}

/* ─────────────────────────────────────────────────────────
   TEMPLATE DEFINITIONS  (51 templates · 8 categories)
───────────────────────────────────────────────────────── */
const TEMPLATES: TemplateConfig[] = [
  /* ── Software Developer (15) ── */
  { id:"sw-ats",       name:"Modern ATS",           description:"Clean ATS-optimized single-column layout",         category:"Software Developer", renderer:"ats",         accent:"#1e293b", atsScore:98,            columns:1, style:"ATS Pro · Single Column"         },
  { id:"sw-google",    name:"Google Style",          description:"Tech company two-column, spacious whitespace",     category:"Software Developer", renderer:"google",      accent:"#1a73e8", atsScore:92, isPremium:true, columns:2, style:"Google Inspired · Two Column"    },
  { id:"sw-microsoft", name:"Microsoft Style",       description:"Corporate tech with accent strip",                 category:"Software Developer", renderer:"microsoft",   accent:"#0078d4", atsScore:90, isPremium:true, columns:2, style:"Microsoft Style · Two Column"    },
  { id:"sw-minimal",   name:"Minimal Engineer",      description:"Ultra-clean, zero distraction",                    category:"Software Developer", renderer:"minimal",     accent:"#334155", atsScore:96,            columns:1, style:"Minimal · Single Column"         },
  { id:"sw-startup",   name:"Startup Resume",        description:"Bold dark header, modern identity",               category:"Software Developer", renderer:"dark-header", accent:"#6366f1", atsScore:85, isPremium:true, columns:1, style:"Dark Header · Single Column"     },
  { id:"sw-exec",      name:"Executive Tech Lead",   description:"Senior executive with career timeline",           category:"Software Developer", renderer:"executive",   accent:"#0f172a", atsScore:88, isPremium:true, columns:1, style:"Executive · Single Column"       },
  { id:"sw-onecol",    name:"One Column ATS",        description:"100% ATS-safe, pure semantic text",               category:"Software Developer", renderer:"ats",         accent:"#374151", atsScore:99,            columns:1, style:"ATS Safe · Single Column"        },
  { id:"sw-split",     name:"Two Column Pro",        description:"Balanced split-panel, professional polish",        category:"Software Developer", renderer:"split",       accent:"#1e3a5f", atsScore:87, isPremium:true, columns:2, style:"Split Panel · Two Column"        },
  { id:"sw-swiss",     name:"Clean Developer",       description:"Swiss grid system, structured precision",          category:"Software Developer", renderer:"swiss",       accent:"#2563eb", atsScore:91,            columns:1, style:"Swiss Grid · Single Column"      },
  { id:"sw-sidebar",   name:"Dark Sidebar",          description:"Navy sidebar, premium two-column layout",          category:"Software Developer", renderer:"sidebar",     accent:"#1e293b", atsScore:86, isPremium:true, columns:2, style:"Sidebar · Two Column"            },
  { id:"sw-silicon",   name:"Silicon Valley",        description:"Startup-ready, Google-style refinement",           category:"Software Developer", renderer:"google",      accent:"#4f46e5", atsScore:89, isPremium:true, columns:2, style:"Tech Inspired · Two Column"      },
  { id:"sw-fullstack", name:"Full Stack",            description:"Timeline experience, tech-forward layout",         category:"Software Developer", renderer:"timeline",    accent:"#0ea5e9", atsScore:88, isPremium:true, columns:1, style:"Timeline · Single Column"         },
  { id:"sw-backend",   name:"Backend Engineer",      description:"Conservative corporate-grade precision",           category:"Software Developer", renderer:"deloitte",    accent:"#1e3a5f", atsScore:93,            columns:1, style:"Corporate · Single Column"       },
  { id:"sw-frontend",  name:"Frontend Engineer",     description:"Editorial layout with color accents",              category:"Software Developer", renderer:"editorial",   accent:"#7c3aed", atsScore:84, isPremium:true, columns:2, style:"Editorial · Two Column"          },
  { id:"sw-ai",        name:"AI / ML Engineer",      description:"Microsoft-style, skills and tech stack forward",   category:"Software Developer", renderer:"microsoft",   accent:"#0284c7", atsScore:90, isPremium:true, columns:2, style:"Microsoft Style · Two Column"    },

  /* ── Graphic Designer (6) ── */
  { id:"gfx-editorial",name:"Portfolio Creative",   description:"Editorial two-column, portfolio-ready",            category:"Graphic Designer",   renderer:"editorial",   accent:"#dc2626", atsScore:75, isPremium:true, columns:2, style:"Editorial · Two Column"          },
  { id:"gfx-swiss",    name:"Swiss Grid",            description:"Bauhaus-inspired structured grid",                 category:"Graphic Designer",   renderer:"swiss",       accent:"#000000", atsScore:82, isPremium:true, columns:1, style:"Swiss Grid · Single Column"      },
  { id:"gfx-minimal",  name:"Minimal Editorial",     description:"Clean editorial, generous white space",            category:"Graphic Designer",   renderer:"minimal",     accent:"#e11d48", atsScore:80,            columns:1, style:"Minimal · Single Column"         },
  { id:"gfx-dark",     name:"Bold Creative",         description:"Dark header, bold typographic identity",           category:"Graphic Designer",   renderer:"dark-header", accent:"#7c3aed", atsScore:72, isPremium:true, columns:1, style:"Dark Header · Single Column"     },
  { id:"gfx-split",    name:"Creative Split",        description:"Split-panel layout, ideal for portfolios",         category:"Graphic Designer",   renderer:"split",       accent:"#db2777", atsScore:78, isPremium:true, columns:2, style:"Split Panel · Two Column"        },
  { id:"gfx-timeline", name:"Timeline Portfolio",    description:"Career timeline, creative history",                category:"Graphic Designer",   renderer:"timeline",    accent:"#f97316", atsScore:76,            columns:1, style:"Timeline · Single Column"         },

  /* ── UI/UX Designer (5) ── */
  { id:"ux-apple",     name:"Apple Inspired",        description:"Ultra-minimal, Cupertino aesthetic",              category:"UI/UX Designer",     renderer:"swiss",       accent:"#1d1d1f", atsScore:85, isPremium:true, columns:1, style:"Swiss Grid · Single Column"      },
  { id:"ux-figma",     name:"Figma Style",           description:"Two-column, design-systems layout",               category:"UI/UX Designer",     renderer:"split",       accent:"#ff7262", atsScore:80, isPremium:true, columns:2, style:"Split Panel · Two Column"        },
  { id:"ux-minimal",   name:"Design Minimal",        description:"Clean single-column, ATS-safe",                   category:"UI/UX Designer",     renderer:"minimal",     accent:"#0ea5e9", atsScore:88,            columns:1, style:"Minimal · Single Column"         },
  { id:"ux-case",      name:"Case Study Layout",     description:"Editorial format, process-focused",               category:"UI/UX Designer",     renderer:"editorial",   accent:"#14b8a6", atsScore:78, isPremium:true, columns:2, style:"Editorial · Two Column"          },
  { id:"ux-google",    name:"Design Systems Pro",    description:"Google-style, component skills forward",           category:"UI/UX Designer",     renderer:"google",      accent:"#6366f1", atsScore:82, isPremium:true, columns:2, style:"Google Inspired · Two Column"    },

  /* ── Marketing (5) ── */
  { id:"mkt-deloitte", name:"Marketing Pro",         description:"Corporate, ROI and results-focused",              category:"Marketing",          renderer:"deloitte",    accent:"#b45309", atsScore:90,            columns:1, style:"Corporate · Single Column"       },
  { id:"mkt-dark",     name:"Growth Marketer",       description:"Dark header, metrics and KPIs forward",           category:"Marketing",          renderer:"dark-header", accent:"#ef4444", atsScore:85, isPremium:true, columns:1, style:"Dark Header · Single Column"     },
  { id:"mkt-google",   name:"Data-Driven",           description:"Analytics-focused two-column layout",             category:"Marketing",          renderer:"google",      accent:"#0ea5e9", atsScore:88, isPremium:true, columns:2, style:"Google Inspired · Two Column"    },
  { id:"mkt-split",    name:"Digital Marketing",     description:"Split panel, skills and campaigns on left",        category:"Marketing",          renderer:"split",       accent:"#7c3aed", atsScore:86, isPremium:true, columns:2, style:"Split Panel · Two Column"        },
  { id:"mkt-editorial",name:"Creative Marketing",    description:"Editorial layout, standout personal brand",        category:"Marketing",          renderer:"editorial",   accent:"#db2777", atsScore:80, isPremium:true, columns:2, style:"Editorial · Two Column"          },

  /* ── Sales (5) ── */
  { id:"sales-deloitte",name:"Sales Professional",   description:"Conservative results and revenue-focused",         category:"Sales",              renderer:"deloitte",    accent:"#16a34a", atsScore:92,            columns:1, style:"Corporate · Single Column"       },
  { id:"sales-exec",   name:"Sales Executive",       description:"Premium executive, career milestones",             category:"Sales",              renderer:"executive",   accent:"#0f172a", atsScore:88, isPremium:true, columns:1, style:"Executive · Single Column"       },
  { id:"sales-dark",   name:"Target Achiever",       description:"Dark header, achievement and quota focus",          category:"Sales",              renderer:"dark-header", accent:"#059669", atsScore:86, isPremium:true, columns:1, style:"Dark Header · Single Column"     },
  { id:"sales-google", name:"KPI Results",           description:"Google-style, metrics and performance forward",     category:"Sales",              renderer:"google",      accent:"#0284c7", atsScore:87, isPremium:true, columns:2, style:"Google Inspired · Two Column"    },
  { id:"sales-split",  name:"Sales Leadership",      description:"Split panel, leadership and territory skills",      category:"Sales",              renderer:"split",       accent:"#1e3a5f", atsScore:89, isPremium:true, columns:2, style:"Split Panel · Two Column"        },

  /* ── Human Resources (5) ── */
  { id:"hr-deloitte",  name:"HR Professional",       description:"Conservative, corporate-grade compliance",          category:"Human Resources",    renderer:"deloitte",    accent:"#7c3aed", atsScore:92,            columns:1, style:"Corporate · Single Column"       },
  { id:"hr-exec",      name:"Strategic HR",          description:"Executive timeline, people operations leader",      category:"Human Resources",    renderer:"executive",   accent:"#1e293b", atsScore:88, isPremium:true, columns:1, style:"Executive · Single Column"       },
  { id:"hr-editorial", name:"Talent Acquisition",    description:"Editorial, people and culture focused",             category:"Human Resources",    renderer:"editorial",   accent:"#0284c7", atsScore:85, isPremium:true, columns:2, style:"Editorial · Two Column"          },
  { id:"hr-ats",       name:"HR ATS Friendly",       description:"Pure ATS, recruiter-optimized format",             category:"Human Resources",    renderer:"ats",         accent:"#374151", atsScore:96,            columns:1, style:"ATS Pro · Single Column"         },
  { id:"hr-google",    name:"Modern HR",             description:"Google-style, skills and impact forward",           category:"Human Resources",    renderer:"google",      accent:"#8b5cf6", atsScore:87, isPremium:true, columns:2, style:"Google Inspired · Two Column"    },

  /* ── Finance (5) ── */
  { id:"fin-exec",     name:"Corporate Finance",     description:"Premium executive, board-level gravitas",           category:"Finance",            renderer:"executive",   accent:"#1e40af", atsScore:91,            columns:1, style:"Executive · Single Column"       },
  { id:"fin-deloitte", name:"Financial Analyst",     description:"Big 4 style, analytical precision",                category:"Finance",            renderer:"deloitte",    accent:"#0f172a", atsScore:93,            columns:1, style:"Corporate · Single Column"       },
  { id:"fin-swiss",    name:"CFO Executive",         description:"Swiss grid, strategic financial leadership",        category:"Finance",            renderer:"swiss",       accent:"#1e293b", atsScore:88, isPremium:true, columns:1, style:"Swiss Grid · Single Column"      },
  { id:"fin-ats",      name:"Investment Banking",    description:"Pure ATS, deal-flow and transaction focus",         category:"Finance",            renderer:"ats",         accent:"#1e3a5f", atsScore:95,            columns:1, style:"ATS Pro · Single Column"         },
  { id:"fin-ms",       name:"Finance Consulting",    description:"Microsoft-style, consulting-grade layout",           category:"Finance",            renderer:"microsoft",   accent:"#334155", atsScore:89, isPremium:true, columns:2, style:"Microsoft Style · Two Column"    },

  /* ── Accounting (5) ── */
  { id:"acct-ats",     name:"ATS Accounting",        description:"100% ATS-safe, precision single-column",           category:"Accounting",         renderer:"ats",         accent:"#374151", atsScore:98,            columns:1, style:"ATS Pro · Single Column"         },
  { id:"acct-deloitte",name:"Corporate Accounting",  description:"Big 4 inspired, clean and exact",                  category:"Accounting",         renderer:"deloitte",    accent:"#1e40af", atsScore:94,            columns:1, style:"Corporate · Single Column"       },
  { id:"acct-exec",    name:"Big 4 CPA Style",       description:"Premium executive CPA, authoritative",             category:"Accounting",         renderer:"executive",   accent:"#1e293b", atsScore:90, isPremium:true, columns:1, style:"Executive · Single Column"       },
  { id:"acct-swiss",   name:"CPA Professional",      description:"Swiss grid, certified public accountant",           category:"Accounting",         renderer:"swiss",       accent:"#065f46", atsScore:92,            columns:1, style:"Swiss Grid · Single Column"      },
  { id:"acct-ms",      name:"Modern Accountant",     description:"Microsoft-style, two-column precision layout",      category:"Accounting",         renderer:"microsoft",   accent:"#0f172a", atsScore:91, isPremium:true, columns:2, style:"Microsoft Style · Two Column"    },
];

const FONTS = ["Inter", "Georgia", "Roboto", "Merriweather", "Helvetica Neue"];
const ACCENT_PRESETS = ["#1e293b", "#1e40af", "#374151", "#0284c7", "#0f172a", "#6366f1", "#16a34a", "#334155"];
const MARGIN_VALUES = { compact: "16px 20px", normal: "28px 32px", wide: "40px 48px" };

/* ─────────────────────────────────────────────────────────
   HELPER: section heading helper
───────────────────────────────────────────────────────── */
const sh = (label: string, a: string, style?: React.CSSProperties): React.CSSProperties => ({
  fontWeight: 700, fontSize: 10, textTransform: "uppercase" as const,
  letterSpacing: 1.8, color: a, marginBottom: 8, paddingBottom: 4,
  borderBottom: `1.5px solid ${a}25`, ...style,
});

/* ─────────────────────────────────────────────────────────
   RENDERER 1 — ATS PRO (single column, ATS-safe)
   Clean, semantic, recruiter-optimized
───────────────────────────────────────────────────────── */
function ResumeATS({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean).join("  |  ");
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1a1a1a", padding: pad, background: "#fff" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: fs + 1, color: "#475569", marginTop: 2, fontWeight: 500 }}>{data.experience[0].title}</div>}
        {contact && <div style={{ fontSize: 10, color: "#64748b", marginTop: 6, lineHeight: 1.6 }}>{contact}</div>}
      </div>
      <hr style={{ border: "none", borderTop: `1.5px solid #0f172a`, marginBottom: 14 }} />
      {data.summary && (
        <div style={{ marginBottom: 14 }}>
          <div style={sh("Summary", a)}>PROFESSIONAL SUMMARY</div>
          <div style={{ lineHeight: 1.7, color: "#374151" }}>{data.summary}</div>
        </div>
      )}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={sh("Experience", a)}>WORK EXPERIENCE</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
              </div>
              <div style={{ color: a, fontWeight: 600, fontSize: fs, marginBottom: 4 }}>{exp.company}</div>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.6, color: "#374151", marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {data.projects.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={sh("Projects", a)}>PROJECTS</div>
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{p.name}{p.tech && <span style={{ fontWeight: 400, color: "#64748b", fontSize: 10 }}> — {p.tech}</span>}</div>
              <div style={{ color: "#475569", fontSize: fs - 1 }}>{p.description}</div>
            </div>
          ))}
        </div>
      )}
      {data.education.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={sh("Education", a)}>EDUCATION</div>
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 700 }}>{e.degree}</span>
                <span style={{ color: "#64748b" }}> — {e.school}</span>
              </div>
              <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{e.dates}</span>
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <div style={sh("Skills", a)}>SKILLS</div>
          <div style={{ lineHeight: 1.9, color: "#374151" }}>{data.skills.slice(0, 28).join("  ·  ")}</div>
        </div>
      )}
      {data.certifications.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={sh("Certifications", a)}>CERTIFICATIONS</div>
          <div style={{ lineHeight: 1.8, color: "#374151" }}>{data.certifications.join("  ·  ")}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 2 — SIDEBAR (dark sidebar + white main)
───────────────────────────────────────────────────────── */
function ResumeSidebar({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const sidebarBg = a === "#fff" || a === "#ffffff" ? "#1e293b" : a;
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", display: "grid", gridTemplateColumns: "210px 1fr", minHeight: "100%", background: "#fff" }}>
      {/* Sidebar */}
      <div style={{ background: sidebarBg, color: "#fff", padding: pad, display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
          {data.experience[0]?.title && <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4, fontWeight: 400 }}>{data.experience[0].title}</div>}
        </div>
        <div style={{ fontSize: 10, display: "flex", flexDirection: "column", gap: 5, opacity: 0.85 }}>
          <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.6, marginBottom: 4, fontSize: 9 }}>CONTACT</div>
          {data.contact.email    && <div>{data.contact.email}</div>}
          {data.contact.phone    && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.linkedin && <div>{data.contact.linkedin}</div>}
          {data.contact.github   && <div>{data.contact.github}</div>}
        </div>
        {data.skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.6, fontSize: 9, marginBottom: 8 }}>SKILLS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {data.skills.slice(0, 14).map((s, i) => (
                <div key={i} style={{ fontSize: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ opacity: 0.9 }}>{s}</span>
                  </div>
                  <div style={{ height: 2, background: "rgba(255,255,255,0.15)", borderRadius: 1 }}>
                    <div style={{ height: "100%", background: "rgba(255,255,255,0.55)", borderRadius: 1, width: `${60 + (i * 11 % 38)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.6, fontSize: 9, marginBottom: 8 }}>EDUCATION</div>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8, fontSize: 10, opacity: 0.85 }}>
                <div style={{ fontWeight: 600 }}>{e.degree}</div>
                <div style={{ opacity: 0.75 }}>{e.school}</div>
                <div style={{ opacity: 0.55 }}>{e.dates}</div>
              </div>
            ))}
          </div>
        )}
        {data.certifications.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.6, fontSize: 9, marginBottom: 6 }}>CERTIFICATIONS</div>
            {data.certifications.map((c, i) => <div key={i} style={{ fontSize: 9, opacity: 0.75, marginBottom: 3 }}>— {c}</div>)}
          </div>
        )}
      </div>
      {/* Main content */}
      <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: 20 }}>
        {data.summary && (
          <div>
            <div style={sh("Profile", a)}>PROFILE</div>
            <div style={{ lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
          </div>
        )}
        {data.experience.length > 0 && (
          <div>
            <div style={sh("Experience", a)}>EXPERIENCE</div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
                </div>
                <div style={{ color: a, fontWeight: 600, fontSize: 11, marginTop: 1 }}>{exp.company}</div>
                <ul style={{ margin: "5px 0 0 14px", padding: 0 }}>
                  {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.55, marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        {data.projects.length > 0 && (
          <div>
            <div style={sh("Projects", a)}>PROJECTS</div>
            {data.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                {p.tech && <div style={{ fontSize: 10, color: a, fontWeight: 500 }}>{p.tech}</div>}
                <div style={{ fontSize: fs - 1, color: "#475569" }}>{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 3 — GOOGLE (tech company two-column)
───────────────────────────────────────────────────────── */
function ResumeGoogle({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1a1a1a", background: "#fff" }}>
      {/* Header */}
      <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #e8eaed" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#202124", letterSpacing: -0.5 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 14, color: a, fontWeight: 500, marginTop: 3 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 0, fontSize: 11, color: "#5f6368" }}>
          {[data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean).map((item, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <span style={{ margin: "0 8px", color: "#dadce0" }}>·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
      {/* Two column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px" }}>
        {/* Main */}
        <div style={{ padding: "20px 24px 20px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
          {data.summary && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${a}` }}>Summary</div>
              <div style={{ lineHeight: 1.7, color: "#3c4043" }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${a}` }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                    <span style={{ fontSize: 10, color: "#80868b" }}>{exp.dates}</span>
                  </div>
                  <div style={{ color: a, fontSize: 11, fontWeight: 500, marginTop: 1, marginBottom: 3 }}>{exp.company}</div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                    {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.6, color: "#3c4043", fontSize: fs - 1, marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8, paddingBottom: 4, borderBottom: `2px solid ${a}` }}>Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  {p.tech && <span style={{ fontSize: 10, color: "#80868b" }}> · {p.tech}</span>}
                  <div style={{ color: "#3c4043", fontSize: fs - 1 }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right sidebar */}
        <div style={{ background: "#f8f9fa", padding: "20px 20px 20px 16px", display: "flex", flexDirection: "column", gap: 16, borderLeft: "1px solid #e8eaed" }}>
          {data.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.slice(0, 16).map((s, i) => (
                  <span key={i} style={{ fontSize: 10, background: "#fff", border: "1px solid #dadce0", borderRadius: 4, padding: "2px 8px", color: "#3c4043" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 8 }}>Education</div>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{e.degree}</div>
                  <div style={{ fontSize: 10, color: "#5f6368" }}>{e.school}</div>
                  <div style={{ fontSize: 10, color: "#80868b" }}>{e.dates}</div>
                </div>
              ))}
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 6 }}>Certifications</div>
              {data.certifications.slice(0, 5).map((c, i) => <div key={i} style={{ fontSize: 10, color: "#5f6368", marginBottom: 4, paddingLeft: 8, borderLeft: `2px solid ${a}50` }}>{c}</div>)}
            </div>
          )}
          {data.languages && data.languages.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: a, marginBottom: 6 }}>Languages</div>
              {data.languages.map((l, i) => <div key={i} style={{ fontSize: 10, color: "#5f6368", marginBottom: 2 }}>{l}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 4 — DARK HEADER (solid colored header)
───────────────────────────────────────────────────────── */
function ResumeDarkHeader({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const hdrBg = a === "#fff" || a === "#ffffff" ? "#1e293b" : a;
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean).join("   ·   ");
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", background: "#fff" }}>
      {/* Dark header */}
      <div style={{ background: hdrBg, color: "#fff", padding: "32px 36px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 13, opacity: 0.78, marginTop: 5, fontWeight: 400, letterSpacing: 0.3 }}>{data.experience[0].title}</div>}
        {contact && <div style={{ marginTop: 10, fontSize: 10, opacity: 0.7, lineHeight: 1.7 }}>{contact}</div>}
      </div>
      {/* Body */}
      <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: 18 }}>
        {data.summary && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: hdrBg, paddingBottom: 5, borderBottom: `2px solid ${hdrBg}20`, marginBottom: 8 }}>Profile</div>
            <div style={{ lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
          </div>
        )}
        {data.experience.length > 0 && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: hdrBg, paddingBottom: 5, borderBottom: `2px solid ${hdrBg}20`, marginBottom: 10 }}>Experience</div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `3px solid ${hdrBg}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
                </div>
                <div style={{ color: hdrBg, fontWeight: 600, fontSize: 11, marginTop: 1, marginBottom: 4 }}>{exp.company}</div>
                <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                  {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.55, marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {data.education.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: hdrBg, paddingBottom: 5, borderBottom: `2px solid ${hdrBg}20`, marginBottom: 8 }}>Education</div>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{e.degree}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>{e.school}</div>
                  <div style={{ color: "#94a3b8", fontSize: 10 }}>{e.dates}</div>
                </div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: hdrBg, paddingBottom: 5, borderBottom: `2px solid ${hdrBg}20`, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.slice(0, 16).map((s, i) => (
                  <span key={i} style={{ fontSize: 10, background: `${hdrBg}08`, border: `1px solid ${hdrBg}20`, borderRadius: 3, padding: "2px 7px" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 5 — SWISS GRID (structured label|content)
───────────────────────────────────────────────────────── */
function ResumeSwiss({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join("   ·   ");
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "0 20px", marginBottom: 16 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#94a3b8", paddingTop: 2 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#0f172a", padding: pad, background: "#fff" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 34, fontWeight: 300, letterSpacing: -1, color: "#0f172a", lineHeight: 1 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 13, color: a, fontWeight: 600, marginTop: 5, letterSpacing: 0.5 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 8, fontSize: 10, color: "#64748b" }}>{contact}</div>
      </div>
      <div style={{ height: 3, background: a, marginBottom: 20 }} />
      {data.summary && (
        <Row label="About">
          <div style={{ lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
        </Row>
      )}
      {data.experience.length > 0 && (
        <Row label="Experience">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>{exp.title}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
                </div>
                <div style={{ color: a, fontWeight: 600, fontSize: 11, marginBottom: 3 }}>{exp.company}</div>
                <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                  {exp.bullets.slice(0, 3).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.6 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Row>
      )}
      {data.education.length > 0 && (
        <Row label="Education">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.education.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <div><span style={{ fontWeight: 700 }}>{e.degree}</span><span style={{ color: "#64748b" }}>, {e.school}</span></div>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{e.dates}</span>
              </div>
            ))}
          </div>
        </Row>
      )}
      {data.skills.length > 0 && (
        <Row label="Skills">
          <div style={{ lineHeight: 2.2, color: "#374151" }}>
            {data.skills.slice(0, 24).map((s, i) => (
              <span key={i}>{s}{i < Math.min(23, data.skills.length - 1) ? <span style={{ color: a, margin: "0 6px" }}>·</span> : ""}</span>
            ))}
          </div>
        </Row>
      )}
      {data.projects.length > 0 && (
        <Row label="Projects">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.projects.map((p, i) => (
              <div key={i}><span style={{ fontWeight: 700 }}>{p.name}</span>{p.tech && <span style={{ color: "#64748b", fontSize: 10 }}> — {p.tech}</span>}<div style={{ color: "#475569", fontSize: fs - 1 }}>{p.description}</div></div>
            ))}
          </div>
        </Row>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 6 — TIMELINE (experience with left timeline)
───────────────────────────────────────────────────────── */
function ResumeTimeline({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean);
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff", maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ color: a, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 0, fontSize: 10, color: "#64748b" }}>
          {contact.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <span style={{ margin: "0 8px", color: "#cbd5e1" }}>|</span>}
              {c}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: "#e2e8f0", marginBottom: 18 }} />
      {data.summary && <div style={{ marginBottom: 18, lineHeight: 1.7, color: "#475569", borderLeft: `3px solid ${a}`, paddingLeft: 12 }}>{data.summary}</div>}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 14 }}>Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: "0 14px", marginBottom: 14, position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: a, flexShrink: 0, zIndex: 1 }} />
                {i < data.experience.length - 1 && <div style={{ width: 2, background: `${a}25`, flex: 1, marginTop: 4 }} />}
              </div>
              <div style={{ paddingBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
                </div>
                <div style={{ color: a, fontWeight: 600, fontSize: 11, marginTop: 1, marginBottom: 4 }}>{exp.company}</div>
                <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                  {exp.bullets.slice(0, 3).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.6 }}>{b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {data.education.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 10 }}>Education</div>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{e.degree}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{e.school}</div>
                <div style={{ color: "#94a3b8", fontSize: 10 }}>{e.dates}</div>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 10 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {data.skills.slice(0, 14).map((s, i) => (
                <span key={i} style={{ fontSize: 10, background: `${a}10`, border: `1px solid ${a}25`, borderRadius: 4, padding: "2px 8px", color: "#374151" }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 7 — DELOITTE (Big 4 conservative corporate)
───────────────────────────────────────────────────────── */
function ResumeDeloitte({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const secHead = { background: `${a}0d`, padding: "5px 10px", fontWeight: 800, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 2, color: a, marginBottom: 10, marginLeft: "-10px", marginRight: "-10px" };
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean).join("   |   ");
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: a }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 12, color: "#475569", marginTop: 2, fontWeight: 500 }}>{data.experience[0].title}</div>}
        {contact && <div style={{ fontSize: 10, color: "#64748b", marginTop: 6 }}>{contact}</div>}
      </div>
      <div style={{ height: 3, background: a, marginBottom: 14 }} />
      {data.summary && (
        <div style={{ marginBottom: 14 }}>
          <div style={secHead}>Professional Summary</div>
          <div style={{ lineHeight: 1.7, color: "#374151" }}>{data.summary}</div>
        </div>
      )}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={secHead}>Professional Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
              </div>
              <div style={{ fontStyle: "italic", color: "#475569", fontSize: 11, marginBottom: 4 }}>{exp.company}</div>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.6, color: "#374151", marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {data.education.length > 0 && (
          <div>
            <div style={secHead}>Education</div>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>{e.degree}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{e.dates}</span>
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{e.school}</div>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <div style={secHead}>Core Skills</div>
            <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
              {data.skills.slice(0, 12).map((s, i) => <li key={i} style={{ fontSize: 11, lineHeight: 1.8, color: "#374151" }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 8 — EXECUTIVE (premium centered, diamond)
───────────────────────────────────────────────────────── */
function ResumeExecutive({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean).join("   ·   ");
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid #e2e8f0` }}>
        <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: 5, textTransform: "uppercase", color: "#0f172a" }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: 11, letterSpacing: 3.5, color: a, marginTop: 6, textTransform: "uppercase", fontWeight: 600 }}>{data.experience[0].title}</div>}
        {contact && <div style={{ marginTop: 10, fontSize: 10, color: "#64748b" }}>{contact}</div>}
      </div>
      {data.summary && (
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <div style={{ lineHeight: 1.8, color: "#475569", fontStyle: "italic", maxWidth: 580, margin: "0 auto" }}>{data.summary}</div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: `${a}35` }} />
        <div style={{ width: 7, height: 7, background: a, transform: "rotate(45deg)" }} />
        <div style={{ flex: 1, height: 1, background: `${a}35` }} />
      </div>
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 3.5, color: a, marginBottom: 14 }}>Career History</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "130px 1fr", gap: "0 14px" }}>
              <div style={{ textAlign: "right", paddingRight: 14, borderRight: `2px solid ${a}25` }}>
                <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }}>{exp.dates}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: a, marginTop: 2 }}>{exp.company}</div>
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, height: 1, background: `${a}25` }} />
        <div style={{ width: 5, height: 5, background: `${a}60`, transform: "rotate(45deg)" }} />
        <div style={{ flex: 1, height: 1, background: `${a}25` }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {data.education.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: a, marginBottom: 10 }}>Education</div>
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{e.school} · {e.dates}</div>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: a, marginBottom: 10 }}>Core Competencies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {data.skills.slice(0, 14).map((s, i) => (
                <span key={i} style={{ fontSize: 10, color: "#374151", borderBottom: `1px solid ${a}40`, paddingBottom: 1 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 9 — SPLIT (vertical divider two-column)
───────────────────────────────────────────────────────── */
function ResumeSplit({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean);
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", background: "#fff" }}>
      {/* Header */}
      <div style={{ padding: "26px 30px 18px", borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ color: a, fontSize: 12, fontWeight: 600, marginTop: 3 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 0, fontSize: 10, color: "#64748b" }}>
          {contact.map((c, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: "0 7px", color: "#cbd5e1" }}>|</span>}
              {c}
            </span>
          ))}
        </div>
      </div>
      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "38% 62%", minHeight: 400 }}>
        {/* Left */}
        <div style={{ padding: "20px 20px 20px 30px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 18 }}>
          {data.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {data.skills.slice(0, 16).map((s, i) => (
                  <div key={i} style={{ fontSize: 10, padding: "2px 0", borderBottom: "1px solid #f1f5f9", color: "#374151" }}>{s}</div>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 8 }}>Education</div>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{e.degree}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{e.school}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.dates}</div>
                </div>
              ))}
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 6 }}>Certifications</div>
              {data.certifications.slice(0, 5).map((c, i) => <div key={i} style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>• {c}</div>)}
            </div>
          )}
          {data.languages && data.languages.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 6 }}>Languages</div>
              {data.languages.map((l, i) => <div key={i} style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{l}</div>)}
            </div>
          )}
        </div>
        {/* Right */}
        <div style={{ padding: "20px 30px 20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {data.summary && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, paddingBottom: 4, borderBottom: `1px solid ${a}25`, marginBottom: 8 }}>Summary</div>
              <div style={{ lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, paddingBottom: 4, borderBottom: `1px solid ${a}25`, marginBottom: 10 }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700 }}>{exp.title}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
                  </div>
                  <div style={{ color: a, fontWeight: 600, fontSize: 11, marginTop: 1, marginBottom: 3 }}>{exp.company}</div>
                  <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                    {exp.bullets.slice(0, 3).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.55 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: a, paddingBottom: 4, borderBottom: `1px solid ${a}25`, marginBottom: 8 }}>Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  {p.tech && <span style={{ fontSize: 10, color: "#64748b" }}> — {p.tech}</span>}
                  <div style={{ fontSize: fs - 1, color: "#475569" }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 10 — EDITORIAL (large display name, rules)
───────────────────────────────────────────────────────── */
function ResumeEditorial({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean);
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, color: "#0f172a" }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
            <div style={{ width: 24, height: 2, background: a }} />
            <div style={{ fontSize: 12, color: a, fontWeight: 600, letterSpacing: 0.5 }}>{data.experience[0].title}</div>
          </div>
        )}
        <div style={{ marginTop: 7, display: "flex", gap: 0, flexWrap: "wrap", fontSize: 10, color: "#64748b" }}>
          {contact.map((c, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: "0 8px", color: a }}>·</span>}
              {c}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${a}, ${a}30, transparent)`, marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 24 }}>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.summary && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: a, marginBottom: 7 }}>Profile</div>
              <div style={{ lineHeight: 1.7, color: "#475569" }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: a, marginBottom: 10 }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: fs + 1 }}>{exp.title}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
                  </div>
                  <div style={{ color: a, fontWeight: 600, fontSize: 11, marginBottom: 4 }}>{exp.company}</div>
                  <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                    {exp.bullets.slice(0, 3).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#475569", lineHeight: 1.55 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: a, marginBottom: 8 }}>Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  {p.tech && <span style={{ fontSize: 10, color: "#64748b" }}> — {p.tech}</span>}
                  <div style={{ fontSize: fs - 1, color: "#475569" }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, borderLeft: `2px solid ${a}20`, paddingLeft: 20 }}>
          {data.skills.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: a, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.skills.slice(0, 14).map((s, i) => (
                  <span key={i} style={{ fontSize: 9, background: `${a}10`, borderRadius: 3, padding: "2px 6px", color: "#374151" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: a, marginBottom: 8 }}>Education</div>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{e.degree}</div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>{e.school}</div>
                  <div style={{ color: "#94a3b8", fontSize: 9 }}>{e.dates}</div>
                </div>
              ))}
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: a, marginBottom: 6 }}>Certs</div>
              {data.certifications.slice(0, 4).map((c, i) => <div key={i} style={{ fontSize: 9, color: "#475569", marginBottom: 3 }}>• {c}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 11 — MICROSOFT (accent strip, corporate)
───────────────────────────────────────────────────────── */
function ResumeMicrosoft({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean).join("   ·   ");
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", background: "#fff", display: "flex" }}>
      {/* Left accent strip */}
      <div style={{ width: 5, background: a, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 18px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
          {data.experience[0]?.title && <div style={{ fontSize: 12, color: a, fontWeight: 600, marginTop: 3 }}>{data.experience[0].title}</div>}
          {contact && <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6 }}>{contact}</div>}
        </div>
        {/* Two-column body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px" }}>
          <div style={{ padding: "18px 20px 18px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {data.summary && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.8, color: a, paddingBottom: 4, borderBottom: `1px solid ${a}30`, marginBottom: 7 }}>Summary</div>
                <div style={{ lineHeight: 1.7, color: "#374151" }}>{data.summary}</div>
              </div>
            )}
            {data.experience.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.8, color: a, paddingBottom: 4, borderBottom: `1px solid ${a}30`, marginBottom: 10 }}>Experience</div>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700 }}>{exp.title}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{exp.dates}</span>
                    </div>
                    <div style={{ color: a, fontWeight: 600, fontSize: 11, marginBottom: 4 }}>{exp.company}</div>
                    <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                      {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ fontSize: fs - 1, color: "#374151", lineHeight: 1.6 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: "18px 24px 18px 16px", background: "#f9fafb", borderLeft: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 14 }}>
            {data.skills.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 1.8, color: a, marginBottom: 7 }}>Skills</div>
                {data.skills.slice(0, 14).map((s, i) => (
                  <div key={i} style={{ fontSize: 10, padding: "3px 0", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{s}</div>
                ))}
              </div>
            )}
            {data.education.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 1.8, color: a, marginBottom: 7 }}>Education</div>
                {data.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ fontWeight: 600, fontSize: 10 }}>{e.degree}</div>
                    <div style={{ fontSize: 9, color: "#6b7280" }}>{e.school}</div>
                    <div style={{ fontSize: 9, color: "#9ca3af" }}>{e.dates}</div>
                  </div>
                ))}
              </div>
            )}
            {data.certifications.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: 1.8, color: a, marginBottom: 6 }}>Certifications</div>
                {data.certifications.slice(0, 4).map((c, i) => <div key={i} style={{ fontSize: 9, color: "#475569", marginBottom: 3 }}>· {c}</div>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER 12 — MINIMAL (ultra-clean, minimal decoration)
───────────────────────────────────────────────────────── */
function ResumeMinimal({ data, cust }: { data: ParsedResume; cust: Customization }) {
  const a = cust.accent;
  const f = cust.font;
  const fs = cust.fontSize === "sm" ? 11 : cust.fontSize === "lg" ? 14 : 12;
  const pad = MARGIN_VALUES[cust.margins];
  const contact = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin].filter(Boolean);
  return (
    <div style={{ fontFamily: f, fontSize: fs, color: "#1e293b", padding: pad, background: "#fff", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
        {data.experience[0]?.title && <div style={{ fontSize: fs, color: "#64748b", marginTop: 2 }}>{data.experience[0].title}</div>}
        <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", fontSize: 10, color: "#94a3b8", gap: 0 }}>
          {contact.map((c, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: "0 8px" }}>·</span>}
              {c}
            </span>
          ))}
        </div>
      </div>
      <hr style={{ border: "none", borderTop: `1px solid #e2e8f0`, marginBottom: 16 }} />
      {data.summary && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 6 }}>Summary</div>
          <div style={{ lineHeight: 1.75, color: "#374151" }}>{data.summary}</div>
        </div>
      )}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 10 }}>Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{exp.title} — <span style={{ fontWeight: 500 }}>{exp.company}</span></span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{exp.dates}</span>
              </div>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {exp.bullets.slice(0, 4).map((b, j) => <li key={j} style={{ lineHeight: 1.65, color: "#475569" }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {data.education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 8 }}>Education</div>
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span><span style={{ fontWeight: 700 }}>{e.degree}</span>, {e.school}</span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{e.dates}</span>
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: a, marginBottom: 8 }}>Skills</div>
          <div style={{ lineHeight: 2, color: "#374151" }}>{data.skills.slice(0, 26).join("  ·  ")}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RENDERER DISPATCHER
───────────────────────────────────────────────────────── */
function ResumeRenderer({ data, template, cust }: { data: ParsedResume; template: TemplateConfig; cust: Customization }) {
  const c: Customization = { ...cust, accent: cust.accent };
  switch (template.renderer) {
    case "ats":         return <ResumeATS         data={data} cust={c} />;
    case "sidebar":     return <ResumeSidebar      data={data} cust={c} />;
    case "google":      return <ResumeGoogle       data={data} cust={c} />;
    case "dark-header": return <ResumeDarkHeader   data={data} cust={c} />;
    case "swiss":       return <ResumeSwiss        data={data} cust={c} />;
    case "timeline":    return <ResumeTimeline     data={data} cust={c} />;
    case "deloitte":    return <ResumeDeloitte     data={data} cust={c} />;
    case "executive":   return <ResumeExecutive    data={data} cust={c} />;
    case "split":       return <ResumeSplit        data={data} cust={c} />;
    case "editorial":   return <ResumeEditorial    data={data} cust={c} />;
    case "microsoft":   return <ResumeMicrosoft    data={data} cust={c} />;
    case "minimal":     return <ResumeMinimal      data={data} cust={c} />;
  }
}

/* ─────────────────────────────────────────────────────────
   MINI THUMBNAIL PREVIEW
───────────────────────────────────────────────────────── */
const DUMMY: ParsedResume = {
  name: "Alexandra Chen",
  contact: { email: "alex@email.com", phone: "+1 555 0123", location: "San Francisco, CA", linkedin: "linkedin.com/in/alex", github: "github.com/alex", website: "" },
  summary: "Results-driven professional with a proven track record of delivering impact. Strong analytical and communication skills.",
  experience: [
    { title: "Senior Manager", company: "TechCorp Inc.", dates: "2021 – Present", bullets: ["Led cross-functional team of 12", "Increased revenue 40% YoY", "Delivered 3 major launches"] },
    { title: "Product Manager", company: "StartUp Co.", dates: "2019 – 2021", bullets: ["Managed product roadmap", "Built partner relationships", "Launched two products"] },
  ],
  education: [{ degree: "B.S. Computer Science", school: "Stanford University", dates: "2015 – 2019", details: [] }],
  skills: ["Leadership", "Strategy", "Python", "SQL", "React", "TypeScript", "AWS", "Communication"],
  projects: [{ name: "Analytics Dashboard", description: "Real-time dashboard with live data", tech: "React, D3.js" }],
  certifications: ["AWS Solutions Architect", "PMP Certified"],
  languages: ["English", "Mandarin"],
  rawSections: [],
};

function TemplateThumbnail({ template }: { template: TemplateConfig }) {
  const cust: Customization = { font: "Inter", accent: template.accent, margins: "compact", showIcons: true, fontSize: "sm" };
  return (
    <div style={{ width: "100%", height: 390, overflow: "hidden", position: "relative", background: "#fff" }}>
      <div style={{ transform: "scale(0.52)", transformOrigin: "top left", width: `${100 / 0.52}%`, pointerEvents: "none" }}>
        <ResumeRenderer data={DUMMY} template={template} cust={cust} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TEMPLATE GALLERY  (improved cards)
───────────────────────────────────────────────────────── */
const UNIQUE_CATEGORIES = Array.from(new Set(TEMPLATES.map(t => t.category)));
const CATEGORIES = ["All", ...UNIQUE_CATEGORIES];

function TemplateGallery({ onSelect }: { onSelect: (t: TemplateConfig) => void }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="space-y-5">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              filter === c
                ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-[0_2px_8px_rgba(108,99,255,0.3)]"
                : "bg-white border border-slate-200 text-slate-600 hover:border-[#6C63FF]/40 hover:text-[#6C63FF]"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400">{filtered.length} templates</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(template => (
          <div
            key={template.id}
            className="group bg-white rounded-2xl border border-slate-200/70 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:border-[#6C63FF]/30"
            onClick={() => onSelect(template)}
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
              <TemplateThumbnail template={template} />

              {/* Top-left badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {template.isPremium && (
                  <span className="bg-amber-400 text-amber-900 text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">Premium</span>
                )}
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase ${
                  template.atsScore >= 90 ? "bg-emerald-100 text-emerald-700"
                  : template.atsScore >= 80 ? "bg-sky-100 text-sky-700"
                  : "bg-slate-100 text-slate-500"
                }`}>
                  ATS {template.atsScore}
                </span>
              </div>

              {/* Top-right column badge */}
              <div className="absolute top-2 right-2">
                <span className="bg-white/90 backdrop-blur-sm text-slate-500 text-[8px] font-semibold px-2 py-0.5 rounded-full border border-slate-200/80">
                  {template.columns === 1 ? "1 Col" : "2 Col"}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <button
                  onClick={e => { e.stopPropagation(); onSelect(template); }}
                  className="w-full btn-primary text-xs py-2 justify-center">
                  Use This Template
                </button>
              </div>
            </div>

            {/* Card footer */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{template.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{template.style}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  <div className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" style={{ background: template.accent }} />
                  <button
                    onClick={e => e.stopPropagation()}
                    className="text-slate-200 hover:text-rose-400 transition-colors">
                    <Heart className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CUSTOMIZATION PANEL (unchanged)
───────────────────────────────────────────────────────── */
function CustomizationPanel({ cust, onChange }: { cust: Customization; onChange: (c: Customization) => void }) {
  return (
    <div className="space-y-5">
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
      <div>
        <p className="section-label mb-2">Font Family</p>
        <select value={cust.font} onChange={e => onChange({ ...cust, font: e.target.value })} className="input-base text-sm">
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
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
   EXPORT HELPERS (unchanged)
───────────────────────────────────────────────────────── */
function exportPDF(containerRef: React.RefObject<HTMLDivElement | null>, name: string) {
  const content = containerRef.current?.innerHTML ?? "";
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name} - Resume</title>
    <style>@page{size:A4;margin:0}body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}*{box-sizing:border-box}</style>
    </head><body>${content}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

function exportDOCX(containerRef: React.RefObject<HTMLDivElement | null>, name: string) {
  const content = containerRef.current?.innerHTML ?? "";
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${name}</title>
    <style>body{font-family:Calibri,sans-serif;font-size:11pt}table{border-collapse:collapse}td,th{padding:4pt}</style></head>
    <body>${content}</body></html>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name.replace(/\s+/g, "_")}_Resume.doc`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE (unchanged logic)
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
      setStep("template");
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
          <p className="text-sm text-slate-400 mt-1">Upload your existing resume, pick from 51 templates, and download a professionally redesigned version.</p>
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
        <div className="max-w-xl mx-auto space-y-8 py-4 animate-slide-up">
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

          {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-3 gap-3">
            {([
              { Icon: LayoutTemplate, title: "51 Templates",    desc: "Professional designs for every field", bg: "bg-violet-50", ic: "text-[#6C63FF]" },
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
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
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
        <div className="space-y-5 animate-fade-in">
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
            <button onClick={() => exportPDF(rendererRef, parsedData.name || "resume")} className="btn-primary text-xs px-5 py-2.5 gap-1.5">
              <Download className="w-3.5 h-3.5" />PDF
            </button>
            <button onClick={() => exportDOCX(rendererRef, parsedData.name || "resume")} className="btn-secondary text-xs gap-1.5">
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
                <span className={`ml-auto text-[8px] font-bold px-2 py-0.5 rounded-full ${selectedTemplate.atsScore >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>ATS {selectedTemplate.atsScore}</span>
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
                        <span className="ml-auto text-[8px] text-slate-400">{t.atsScore}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extracted data summary */}
          <div className="card-base p-5">
            <p className="text-sm font-bold text-slate-900 mb-3">Extracted Content Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Name",       value: parsedData.name || "—" },
                { label: "Experience", value: `${parsedData.experience.length} jobs` },
                { label: "Skills",     value: `${parsedData.skills.length} skills` },
                { label: "Education",  value: `${parsedData.education.length} degrees` },
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
