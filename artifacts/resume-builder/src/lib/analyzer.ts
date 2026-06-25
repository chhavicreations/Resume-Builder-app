export interface ContactInfo {
  emails: string[];
  phones: string[];
  hasLinkedIn: boolean;
  hasGitHub: boolean;
  hasWebsite: boolean;
}

export interface SectionPresence {
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSummary: boolean;
  hasProjects: boolean;
  hasCertifications: boolean;
}

export interface CategoryScore {
  label: string;
  score: number;
  max: number;
  details: string[];
}

export interface ATSResult {
  rawText: string;
  wordCount: number;
  pageEstimate: number;
  contact: ContactInfo;
  sections: SectionPresence;
  totalScore: number;
  categories: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?)(\d{3}[\s.\-]?\d{4})/g;
const LINKEDIN_RE = /linkedin\.com\/in\//i;
const GITHUB_RE = /github\.com\//i;
const WEBSITE_RE = /https?:\/\/(?!linkedin|github)[^\s]+/i;

const SKILLS_KEYWORDS = [
  "skills", "technical skills", "core competencies",
  "technologies", "expertise", "proficiencies", "tools",
];
const EXPERIENCE_KEYWORDS = [
  "experience", "work history", "employment", "professional experience",
  "career", "positions held", "work experience",
];
const EDUCATION_KEYWORDS = [
  "education", "academic", "degree", "university", "college",
  "bachelor", "master", "phd", "qualification",
];
const SUMMARY_KEYWORDS = [
  "summary", "objective", "profile", "about me", "overview",
  "professional summary", "career objective",
];
const PROJECTS_KEYWORDS = ["project", "projects", "portfolio", "case study"];
const CERTS_KEYWORDS = [
  "certification", "certifications", "certificate", "licensed",
  "credential", "accreditation",
];

const ACTION_VERBS = [
  "led", "managed", "developed", "created", "implemented", "designed",
  "built", "launched", "improved", "increased", "reduced", "achieved",
  "delivered", "collaborated", "spearheaded", "orchestrated", "optimized",
  "streamlined", "accelerated", "generated", "transformed", "negotiated",
];

const METRIC_RE = /(\d+%|\$\d+|\d+\s*(million|thousand|k\b|x\b|times|users|clients|team|years?))/gi;

function hasSectionKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function countMatches(re: RegExp, text: string): number {
  return (text.match(re) ?? []).length;
}

export function analyzeResume(rawText: string): ATSResult {
  const lower = rawText.toLowerCase();
  const words = rawText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const pageEstimate = Math.max(1, Math.round(wordCount / 450));

  // ── Contact ──────────────────────────────────────────────────────────
  const emails = [...new Set(rawText.match(EMAIL_RE) ?? [])];
  const phones = [...new Set((rawText.match(PHONE_RE) ?? []).map((p) => p.trim()))];
  const hasLinkedIn = LINKEDIN_RE.test(rawText);
  const hasGitHub = GITHUB_RE.test(rawText);
  const hasWebsite = WEBSITE_RE.test(rawText);

  const contact: ContactInfo = { emails, phones, hasLinkedIn, hasGitHub, hasWebsite };

  // ── Sections ─────────────────────────────────────────────────────────
  const sections: SectionPresence = {
    hasSkills: hasSectionKeyword(lower, SKILLS_KEYWORDS),
    hasExperience: hasSectionKeyword(lower, EXPERIENCE_KEYWORDS),
    hasEducation: hasSectionKeyword(lower, EDUCATION_KEYWORDS),
    hasSummary: hasSectionKeyword(lower, SUMMARY_KEYWORDS),
    hasProjects: hasSectionKeyword(lower, PROJECTS_KEYWORDS),
    hasCertifications: hasSectionKeyword(lower, CERTS_KEYWORDS),
  };

  // ── Category scoring ─────────────────────────────────────────────────
  const categories: CategoryScore[] = [];

  // 1. Contact Information (20 pts)
  {
    let score = 0;
    const details: string[] = [];
    if (emails.length > 0) { score += 6; details.push(`Email found: ${emails[0]}`); }
    else details.push("No email address detected");
    if (phones.length > 0) { score += 5; details.push(`Phone found: ${phones[0]}`); }
    else details.push("No phone number detected");
    if (hasLinkedIn) { score += 5; details.push("LinkedIn profile URL present"); }
    else details.push("No LinkedIn URL found");
    if (hasGitHub) { score += 2; details.push("GitHub profile URL present"); }
    if (hasWebsite) { score += 2; details.push("Personal website/portfolio URL present"); }
    categories.push({ label: "Contact Information", score: Math.min(score, 20), max: 20, details });
  }

  // 2. Essential Sections (25 pts)
  {
    let score = 0;
    const details: string[] = [];
    if (sections.hasExperience) { score += 8; details.push("Work Experience section detected"); }
    else details.push("Work Experience section not detected");
    if (sections.hasEducation) { score += 7; details.push("Education section detected"); }
    else details.push("Education section not detected");
    if (sections.hasSkills) { score += 6; details.push("Skills section detected"); }
    else details.push("Skills section not detected");
    if (sections.hasSummary) { score += 4; details.push("Professional Summary/Objective present"); }
    else details.push("No summary or objective section");
    categories.push({ label: "Essential Sections", score: Math.min(score, 25), max: 25, details });
  }

  // 3. Content Quality (25 pts)
  {
    let score = 0;
    const details: string[] = [];
    const verbCount = ACTION_VERBS.filter((v) => lower.includes(v)).length;
    const metricCount = countMatches(METRIC_RE, rawText);

    if (verbCount >= 8) { score += 10; details.push(`Strong action verbs used (${verbCount} found)`); }
    else if (verbCount >= 4) { score += 6; details.push(`Some action verbs used (${verbCount} found)`); }
    else { score += 2; details.push(`Few action verbs (${verbCount} found — aim for 8+)`); }

    if (metricCount >= 5) { score += 10; details.push(`Good use of metrics/numbers (${metricCount} found)`); }
    else if (metricCount >= 2) { score += 6; details.push(`Some quantified achievements (${metricCount} found)`); }
    else { score += 1; details.push(`Very few metrics/numbers (${metricCount} found — add quantifiable results)`); }

    if (sections.hasProjects) { score += 3; details.push("Projects section adds extra depth"); }
    if (sections.hasCertifications) { score += 2; details.push("Certifications section present"); }

    categories.push({ label: "Content Quality", score: Math.min(score, 25), max: 25, details });
  }

  // 4. Resume Length & Format (15 pts)
  {
    let score = 0;
    const details: string[] = [];

    if (wordCount >= 300 && wordCount <= 700) {
      score += 8;
      details.push(`Ideal length for 1 page (${wordCount} words)`);
    } else if (wordCount > 700 && wordCount <= 1200) {
      score += 7;
      details.push(`Good length for 2 pages (${wordCount} words)`);
    } else if (wordCount < 300) {
      score += 2;
      details.push(`Too short — only ${wordCount} words (aim for 300–700 for 1 page)`);
    } else {
      score += 4;
      details.push(`Resume may be too long (${wordCount} words / ~${pageEstimate} pages)`);
    }

    if (pageEstimate === 1) { score += 4; details.push("Fits within 1 page"); }
    else if (pageEstimate === 2) { score += 3; details.push("Two-page resume — acceptable for 5+ years experience"); }
    else { score += 1; details.push(`~${pageEstimate} pages — consider condensing to 1–2 pages`); }

    const hasConsistentDates = /\b(20\d{2}|19\d{2})\b/.test(rawText);
    if (hasConsistentDates) { score += 3; details.push("Dates are present in the resume"); }
    else details.push("No consistent year dates detected");

    categories.push({ label: "Resume Length & Format", score: Math.min(score, 15), max: 15, details });
  }

  // 5. ATS Friendliness (15 pts)
  {
    let score = 0;
    const details: string[] = [];

    const hasSpecialChars = /[│┌┐└┘├┤┬┴┼═╔╗╚╝]/u.test(rawText);
    if (!hasSpecialChars) { score += 5; details.push("No complex table/box characters detected"); }
    else { details.push("Special box-drawing characters may confuse ATS parsers"); }

    const emailValid = emails.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emails[0]);
    if (emailValid) { score += 5; details.push("Email address appears valid"); }
    else if (emails.length > 0) { details.push("Email detected but may be malformed"); }
    else details.push("No valid email found — required for ATS contact parsing");

    const hasStandardSections = [sections.hasExperience, sections.hasEducation, sections.hasSkills]
      .filter(Boolean).length;
    if (hasStandardSections >= 3) { score += 5; details.push("Standard section headings improve ATS parsing"); }
    else if (hasStandardSections >= 2) { score += 3; details.push("Some standard sections present"); }
    else details.push("Missing standard section headings (Experience, Education, Skills)");

    categories.push({ label: "ATS Friendliness", score: Math.min(score, 15), max: 15, details });
  }

  const totalScore = categories.reduce((sum, c) => sum + c.score, 0);

  // ── Strengths ────────────────────────────────────────────────────────
  const strengths: string[] = [];
  if (emails.length > 0) strengths.push("Contact email is present and detected");
  if (phones.length > 0) strengths.push("Phone number found");
  if (hasLinkedIn) strengths.push("LinkedIn profile URL included");
  if (sections.hasExperience) strengths.push("Work experience section is clearly labeled");
  if (sections.hasEducation) strengths.push("Education section is present");
  if (sections.hasSkills) strengths.push("Dedicated skills section aids ATS keyword matching");
  if (sections.hasSummary) strengths.push("Professional summary helps contextualize your background");
  if (sections.hasProjects) strengths.push("Projects section adds additional context");
  if (sections.hasCertifications) strengths.push("Certifications demonstrate continued learning");
  const verbCount2 = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  if (verbCount2 >= 6) strengths.push(`Strong use of action verbs (${verbCount2} detected)`);
  const metricCount2 = countMatches(METRIC_RE, rawText);
  if (metricCount2 >= 3) strengths.push(`Quantified achievements with numbers/metrics (${metricCount2} instances)`);
  if (wordCount >= 300 && wordCount <= 1200) strengths.push(`Resume length is appropriate (${wordCount} words)`);

  // ── Weaknesses ───────────────────────────────────────────────────────
  const weaknesses: string[] = [];
  if (emails.length === 0) weaknesses.push("No email address found — critical for recruiters and ATS");
  if (phones.length === 0) weaknesses.push("Phone number is missing");
  if (!hasLinkedIn) weaknesses.push("No LinkedIn URL — widely expected by modern ATS and recruiters");
  if (!sections.hasExperience) weaknesses.push("No clearly labeled Work Experience section");
  if (!sections.hasEducation) weaknesses.push("Education section appears absent");
  if (!sections.hasSkills) weaknesses.push("No Skills section — ATS relies on this for keyword matching");
  if (!sections.hasSummary) weaknesses.push("No summary or objective — misses top-of-resume keyword opportunity");
  if (verbCount2 < 4) weaknesses.push(`Very few action verbs (${verbCount2}) — weakens impact of bullet points`);
  if (metricCount2 < 2) weaknesses.push("Lack of quantified achievements reduces credibility");
  if (wordCount < 250) weaknesses.push(`Resume is too sparse (${wordCount} words) — add more detail`);
  if (wordCount > 1200) weaknesses.push(`Resume may be too lengthy (${wordCount} words) — consider trimming`);
  if (!hasGitHub && !hasWebsite) weaknesses.push("No portfolio, GitHub, or website URL to showcase work");

  // ── Improvements ────────────────────────────────────────────────────
  const improvements: string[] = [
    ...(!hasLinkedIn ? ["Add your LinkedIn profile URL (e.g. linkedin.com/in/yourname) — it boosts ATS score significantly"] : []),
    ...(verbCount2 < 8 ? [`Increase strong action verbs — try: Led, Built, Delivered, Optimized, Increased. (Currently ${verbCount2})`] : []),
    ...(metricCount2 < 4 ? ["Quantify your achievements — e.g. 'Increased sales by 35%' or 'Managed a team of 8 engineers'"] : []),
    ...(!sections.hasSummary ? ["Add a 2–3 sentence professional summary at the top with your key skills and career goal"] : []),
    ...(!sections.hasSkills ? ["Create a dedicated Skills section with relevant keywords for your target role"] : []),
    ...(!hasGitHub ? ["Add a GitHub profile URL if you work in tech — recruiters and ATS systems value it"] : []),
    ...(emails.length === 0 ? ["Include a professional email address in a clearly visible contact section"] : []),
    ...(phones.length === 0 ? ["Add a phone number — many ATS require it to complete an application profile"] : []),
    ...(!sections.hasCertifications && !sections.hasProjects
      ? ["Add a Projects or Certifications section to stand out from similarly qualified candidates"]
      : []),
    "Tailor your skills section to include keywords from the specific job description you're applying for",
    "Avoid headers, footers, tables, and text boxes — they can confuse ATS parsers",
    "Save and submit your resume as a clean .pdf or .docx (not .pages or image formats)",
  ];

  return {
    rawText,
    wordCount,
    pageEstimate,
    contact,
    sections,
    totalScore,
    categories,
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 8),
    improvements: improvements.slice(0, 8),
  };
}
