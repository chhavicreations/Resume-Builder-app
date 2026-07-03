export interface ExperienceItem {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  dates: string;
  details: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech: string;
}

export interface ParsedResume {
  name: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: string[];
  languages: string[];
  rawSections: { heading: string; content: string }[];
}

const SECTION_KEYWORDS = [
  "experience", "work experience", "professional experience", "employment",
  "education", "academic", "qualification",
  "skills", "technical skills", "core competencies", "proficiencies",
  "projects", "personal projects", "key projects",
  "summary", "professional summary", "objective", "profile", "about me",
  "certifications", "certificates", "courses",
  "awards", "achievements", "honors",
  "languages",
  "publications", "volunteering", "interests",
];

function isLikelySectionHeader(line: string): boolean {
  const clean = line.trim();
  if (!clean || clean.length > 60) return false;
  const lower = clean.toLowerCase().replace(/[^a-z ]/g, "").trim();
  return SECTION_KEYWORDS.some(kw => lower === kw || lower.startsWith(kw));
}

function extractName(lines: string[]): string {
  for (const line of lines.slice(0, 5)) {
    const clean = line.trim();
    if (!clean) continue;
    if (clean.includes("@") || /\d{7,}/.test(clean)) continue;
    if (clean.length > 50 || clean.length < 2) continue;
    if (isLikelySectionHeader(clean)) continue;
    const words = clean.split(/\s+/);
    if (words.length >= 1 && words.length <= 5) return clean;
  }
  return "";
}

function extractContact(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d[\d\s\-().]{7,15}\d)/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i);
  const githubMatch = text.match(/github\.com\/([a-zA-Z0-9\-_%]+)/i);
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);

  const locationPatterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2,})/,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Za-z]+)/,
  ];
  let location = "";
  for (const p of locationPatterns) {
    const m = text.match(p);
    if (m) { location = m[1]; break; }
  }

  return {
    email: emailMatch?.[0] ?? "",
    phone: phoneMatch?.[0]?.trim() ?? "",
    linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : "",
    github: githubMatch ? `github.com/${githubMatch[1]}` : "",
    website: websiteMatch?.[0] ?? "",
    location,
  };
}

function splitIntoSections(text: string): { heading: string; content: string }[] {
  const lines = text.split("\n");
  const sections: { heading: string; content: string }[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (isLikelySectionHeader(line)) {
      if (current) {
        sections.push({ heading: current.heading, content: current.lines.join("\n").trim() });
      }
      current = { heading: line.trim(), lines: [] };
    } else {
      if (current) current.lines.push(line);
    }
  }
  if (current) sections.push({ heading: current.heading, content: current.lines.join("\n").trim() });

  return sections;
}

function parseExperience(content: string): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  const blocks = content.split(/\n(?=[A-Z])/);
  for (const block of blocks) {
    const lines = block.split("\n").filter(l => l.trim());
    if (!lines.length) continue;

    const datePattern = /(?:\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^|—]*(?:\d{4}|Present|Current)/i;
    let title = "", company = "", dates = "";
    const bullets: string[] = [];

    for (const line of lines) {
      const clean = line.trim();
      if (!clean) continue;
      if (datePattern.test(clean)) {
        dates = (clean.match(datePattern)?.[0] ?? "").trim();
        const rest = clean.replace(datePattern, "").replace(/[|—\-•]/g, "").trim();
        if (rest && !title) title = rest;
        else if (rest && !company) company = rest;
      } else if (!title) {
        title = clean;
      } else if (!company) {
        company = clean;
      } else if (clean.startsWith("•") || clean.startsWith("-") || clean.startsWith("*")) {
        bullets.push(clean.replace(/^[•\-*]\s*/, ""));
      } else {
        bullets.push(clean);
      }
    }

    if (title || company) {
      items.push({ title, company, dates, bullets: bullets.slice(0, 6) });
    }
  }
  return items.filter(i => i.title || i.company).slice(0, 6);
}

function parseEducation(content: string): EducationItem[] {
  const items: EducationItem[] = [];
  const lines = content.split("\n").filter(l => l.trim());
  let current: Partial<EducationItem> & { details: string[] } = { details: [] };

  for (const line of lines) {
    const clean = line.trim();
    const datePattern = /\d{4}/;
    if (datePattern.test(clean) && (clean.match(/\d{4}/g) ?? []).length >= 1) {
      if (current.degree || current.school) {
        items.push({ degree: current.degree ?? "", school: current.school ?? "", dates: current.dates ?? "", details: current.details });
        current = { details: [] };
      }
      current.dates = clean;
    } else if (!current.degree) {
      current.degree = clean;
    } else if (!current.school) {
      current.school = clean;
    } else {
      current.details.push(clean);
    }
  }
  if (current.degree || current.school) {
    items.push({ degree: current.degree ?? "", school: current.school ?? "", dates: current.dates ?? "", details: current.details });
  }
  return items.slice(0, 4);
}

function parseSkills(content: string): string[] {
  return content
    .replace(/[•\-*|]/g, ",")
    .split(/,|\n/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 40)
    .slice(0, 30);
}

function parseProjects(content: string): ProjectItem[] {
  const blocks = content.split(/\n(?=[A-Z•\-])/);
  return blocks.slice(0, 4).map(block => {
    const lines = block.split("\n").filter(l => l.trim());
    const name = lines[0]?.replace(/^[•\-*]\s*/, "").trim() ?? "";
    const description = lines.slice(1).join(" ").replace(/^[•\-*]\s*/, "").trim();
    const techMatch = description.match(/(?:using|built with|technologies?|stack)[:\s]+([^.]+)/i);
    return { name, description: description.slice(0, 200), tech: techMatch?.[1] ?? "" };
  }).filter(p => p.name);
}

function parseCertifications(content: string): string[] {
  return content.split("\n").map(l => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean).slice(0, 8);
}

export function parseResume(rawText: string): ParsedResume {
  const lines = rawText.split("\n").filter(l => l.trim());
  const name = extractName(lines);
  const contact = extractContact(rawText);
  const rawSections = splitIntoSections(rawText);

  let summary = "";
  let experience: ExperienceItem[] = [];
  let education: EducationItem[] = [];
  let skills: string[] = [];
  let projects: ProjectItem[] = [];
  let certifications: string[] = [];
  let languages: string[] = [];

  for (const section of rawSections) {
    const h = section.heading.toLowerCase();
    if (/summary|objective|profile|about/.test(h)) {
      summary = section.content.slice(0, 400);
    } else if (/experience|employment|work/.test(h)) {
      experience = parseExperience(section.content);
    } else if (/education|academic|qualification/.test(h)) {
      education = parseEducation(section.content);
    } else if (/skill|competenc|proficien|technolog/.test(h)) {
      skills = parseSkills(section.content);
    } else if (/project/.test(h)) {
      projects = parseProjects(section.content);
    } else if (/certif|course|licens/.test(h)) {
      certifications = parseCertifications(section.content);
    } else if (/language/.test(h)) {
      languages = section.content.split(/,|\n/).map(l => l.trim()).filter(Boolean);
    }
  }

  if (!summary && rawSections.length === 0 && rawText.trim().length > 100) {
    summary = rawText.slice(0, 300);
  }

  return { name, contact, summary, experience, education, skills, projects, certifications, languages, rawSections };
}
