export interface ParsedResume {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  address: string;
  summary: string;
  skills: string[];
  experience: ExpEntry[];
  education: EduEntry[];
  certifications: string[];
  rawText: string;
}

export interface ExpEntry {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface EduEntry {
  degree: string;
  school: string;
  year: string;
  gpa: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?)(\d{3}[\s.\-]?\d{4})/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^\s,/]+)/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\s,/]+)/i;
const WEBSITE_RE = /https?:\/\/(?!linkedin|github)([^\s]+)/i;

const SECTION_HEADINGS: Record<string, string[]> = {
  summary: ["summary", "objective", "profile", "about me", "overview", "professional summary", "career objective", "about"],
  skills: ["skills", "technical skills", "core competencies", "technologies", "expertise", "proficiencies", "tools", "languages"],
  experience: ["experience", "work history", "employment", "professional experience", "career", "work experience", "positions", "job history"],
  education: ["education", "academic background", "academic qualifications", "qualifications", "schooling"],
  certifications: ["certifications", "certificates", "certifications & licenses", "licenses", "credentials", "accreditations"],
};

function findSectionStart(lines: string[], keywords: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase().trim();
    if (keywords.some((k) => lower === k || lower.startsWith(k + " ") || lower.startsWith(k + ":"))) {
      return i;
    }
  }
  return -1;
}

function extractSectionText(lines: string[], startIdx: number): string {
  if (startIdx < 0) return "";
  const allSectionKeywords = Object.values(SECTION_HEADINGS).flat();
  const result: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const lower = lines[i].toLowerCase().trim();
    if (allSectionKeywords.some((k) => lower === k || lower.startsWith(k + " ") || lower.startsWith(k + ":"))) break;
    result.push(lines[i]);
  }
  return result.join("\n").trim();
}

function parseSkills(text: string): string[] {
  if (!text) return [];
  const skills: string[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const cleaned = line.replace(/^[-•*▪►]\s*/, "").trim();
    if (!cleaned) continue;
    const parts = cleaned.split(/[,|·•]+/);
    for (const p of parts) {
      const s = p.trim();
      if (s.length > 1 && s.length < 50) skills.push(s);
    }
  }
  return [...new Set(skills)].slice(0, 30);
}

function parseExperience(text: string): ExpEntry[] {
  if (!text) return [];
  const entries: ExpEntry[] = [];
  const lines = text.split("\n").filter((l) => l.trim());
  let current: ExpEntry | null = null;

  const DATE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\.?\s+\d{4}|\d{4}\s*[-–—to]+\s*(\d{4}|present|current)/i;
  const BULLET_RE = /^[-•*▪►]\s+/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const hasDate = DATE_RE.test(trimmed);
    const isBullet = BULLET_RE.test(trimmed);

    if (hasDate && !isBullet) {
      if (current) entries.push(current);
      const datePart = trimmed.match(DATE_RE)?.[0] ?? "";
      const beforeDate = trimmed.replace(datePart, "").replace(/[|·,–—-]+/g, " ").trim();
      const parts = beforeDate.split(/\s{2,}|[|·]/).map((p) => p.trim()).filter(Boolean);
      current = {
        title: parts[0] ?? trimmed,
        company: parts[1] ?? "",
        dates: datePart,
        bullets: [],
      };
    } else if (isBullet && current) {
      current.bullets.push(trimmed.replace(BULLET_RE, ""));
    } else if (current && !current.company && !isBullet && trimmed.length < 80) {
      current.company = trimmed;
    }
  }
  if (current) entries.push(current);
  return entries.slice(0, 6);
}

function parseEducation(text: string): EduEntry[] {
  if (!text) return [];
  const lines = text.split("\n").filter((l) => l.trim());
  const entries: EduEntry[] = [];
  let current: EduEntry | null = null;

  const YEAR_RE = /\b(19|20)\d{2}\b/;
  const GPA_RE = /gpa[:\s]+(\d+\.\d+)/i;
  const DEGREE_WORDS = /\b(bachelor|master|phd|doctorate|associate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba|b\.?eng|m\.?eng|degree|diploma|certificate)\b/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (DEGREE_WORDS.test(trimmed)) {
      if (current) entries.push(current);
      current = { degree: trimmed, school: "", year: "", gpa: "" };
    } else if (current) {
      if (!current.year && YEAR_RE.test(trimmed)) {
        current.year = trimmed.match(YEAR_RE)?.[0] ?? "";
      }
      if (!current.gpa && GPA_RE.test(trimmed)) {
        current.gpa = trimmed.match(GPA_RE)?.[1] ?? "";
      }
      if (!current.school && !YEAR_RE.test(trimmed) && !GPA_RE.test(trimmed)) {
        current.school = trimmed;
      }
    }
  }
  if (current) entries.push(current);
  return entries;
}

function parseCertifications(text: string): string[] {
  if (!text) return [];
  return text.split("\n")
    .map((l) => l.replace(/^[-•*▪►]\s*/, "").trim())
    .filter((l) => l.length > 3)
    .slice(0, 8);
}

function guessTitleFromSummary(summary: string, experience: ExpEntry[]): string {
  if (experience.length > 0 && experience[0].title) return experience[0].title;
  const words = summary.split(/\s+/);
  const titleWords = words.slice(0, 6).join(" ");
  return titleWords.length > 3 ? titleWords : "";
}

export function parseResumeText(rawText: string): ParsedResume {
  const lines = rawText.split("\n").map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);

  const email = rawText.match(EMAIL_RE)?.[0] ?? "";
  const phone = rawText.match(PHONE_RE)?.[0]?.trim() ?? "";
  const linkedin = rawText.match(LINKEDIN_RE)?.[0] ?? "";
  const github = rawText.match(GITHUB_RE)?.[0] ?? "";
  const website = rawText.match(WEBSITE_RE)?.[0] ?? "";

  const name = (nonEmpty[0] ?? "").replace(/[^a-zA-Z\s'-]/g, "").trim();

  const summaryIdx = findSectionStart(lines, SECTION_HEADINGS.summary);
  const skillsIdx = findSectionStart(lines, SECTION_HEADINGS.skills);
  const expIdx = findSectionStart(lines, SECTION_HEADINGS.experience);
  const eduIdx = findSectionStart(lines, SECTION_HEADINGS.education);
  const certIdx = findSectionStart(lines, SECTION_HEADINGS.certifications);

  const summaryText = extractSectionText(lines, summaryIdx);
  const skillsText = extractSectionText(lines, skillsIdx);
  const expText = extractSectionText(lines, expIdx);
  const eduText = extractSectionText(lines, eduIdx);
  const certText = extractSectionText(lines, certIdx);

  const skills = parseSkills(skillsText);
  const experience = parseExperience(expText);
  const education = parseEducation(eduText);
  const certifications = parseCertifications(certText);

  const jobTitle = guessTitleFromSummary(summaryText, experience);

  const addressLine = nonEmpty.find((l) => /\b(st\.|ave\.|blvd\.|road|drive|city|state|usa|ca|ny|tx|fl|wa|chicago|new york|san francisco|los angeles|boston|seattle|austin)\b/i.test(l) && l.length < 80);

  return {
    name,
    jobTitle,
    email,
    phone,
    linkedin,
    github,
    website,
    address: addressLine ?? "",
    summary: summaryText,
    skills,
    experience,
    education,
    certifications,
    rawText,
  };
}
