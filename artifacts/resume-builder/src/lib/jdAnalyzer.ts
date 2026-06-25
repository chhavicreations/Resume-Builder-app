export interface JDAnalysisResult {
  overallMatch: number;
  keywordMatch: number;
  skillMatch: number;
  experienceMatch: number;
  atsCompatibility: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedSkills: string[];
  resumeChanges: string[];
  jdKeywords: string[];
  resumeKeywords: string[];
  skillsInJD: string[];
  skillsInResume: string[];
}

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "this","that","these","those","it","its","we","our","you","your","they",
  "their","he","she","his","her","as","if","so","than","then","when","who",
  "which","what","how","where","why","all","any","each","some","such",
  "about","above","after","before","between","during","through","up","down",
  "out","off","over","under","again","further","here","there","both","own",
  "very","just","also","more","most","other","into","than","only","same",
  "too","while","within","without","per","via","not","no","new","can",
  "including","required","preferred","must","strong","experience","background",
  "ability","role","team","work","years","skills","knowledge","understanding",
]);

const TECH_SKILLS = [
  "javascript","typescript","python","java","c++","c#","go","rust","ruby","php",
  "swift","kotlin","scala","r","matlab","sql","nosql","html","css","sass","less",
  "react","angular","vue","svelte","next","nuxt","node","express","fastapi",
  "django","flask","spring","rails","laravel","asp.net","graphql","rest","api",
  "docker","kubernetes","aws","azure","gcp","terraform","ansible","jenkins",
  "git","github","gitlab","ci/cd","devops","linux","bash","powershell",
  "mongodb","postgresql","mysql","redis","elasticsearch","kafka","rabbitmq",
  "tensorflow","pytorch","scikit-learn","pandas","numpy","machine learning",
  "deep learning","nlp","computer vision","data science","analytics","tableau",
  "power bi","excel","figma","sketch","adobe xd","photoshop","illustrator",
  "agile","scrum","kanban","jira","confluence","salesforce","sap","servicenow",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function extractBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!STOP_WORDS.has(tokens[i]) && !STOP_WORDS.has(tokens[i + 1])) {
      bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
  }
  return bigrams;
}

function freq(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) map.set(t, (map.get(t) ?? 0) + 1);
  return map;
}

function topN(map: Map<string, number>, n: number): string[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

export function analyzeJobMatch(resumeText: string, jdText: string): JDAnalysisResult {
  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jdText);

  const resumeBigrams = extractBigrams(resumeTokens);
  const jdBigrams = extractBigrams(jdTokens);

  const resumeSet = new Set([...resumeTokens, ...resumeBigrams]);
  const jdFreq = freq([...jdTokens, ...jdBigrams]);

  const jdKeywords = topN(jdFreq, 40);

  const resumeFreq = freq(resumeTokens);
  const resumeKeywords = topN(resumeFreq, 30);

  const matchedKeywords = jdKeywords.filter((k) => resumeSet.has(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeSet.has(k)).slice(0, 15);

  const keywordMatch = jdKeywords.length > 0
    ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
    : 0;

  const jdLower = jdText.toLowerCase();
  const resumeLower = resumeText.toLowerCase();
  const skillsInJD = TECH_SKILLS.filter((s) => jdLower.includes(s));
  const skillsInResume = TECH_SKILLS.filter((s) => resumeLower.includes(s));
  const matchedSkills = skillsInJD.filter((s) => skillsInResume.includes(s));
  const skillMatch = skillsInJD.length > 0
    ? Math.round((matchedSkills.length / skillsInJD.length) * 100)
    : 60;

  const expYearsJD = (jdText.match(/(\d+)\+?\s*years?/gi) ?? []).map((m) => parseInt(m));
  const expYearsResume = (resumeText.match(/(\d+)\+?\s*years?/gi) ?? []).map((m) => parseInt(m));
  const maxJD = expYearsJD.length ? Math.max(...expYearsJD) : 0;
  const maxResume = expYearsResume.length ? Math.max(...expYearsResume) : 0;
  const experienceMatch = maxJD === 0 ? 70
    : maxResume >= maxJD ? 90
    : Math.round(Math.min((maxResume / maxJD) * 100, 90));

  const hasEmail = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/.test(resumeLower);
  const hasPhone = /\d{3}[\s.\-]?\d{4}/.test(resumeText);
  const hasLinkedin = /linkedin\.com\/in\//.test(resumeLower);
  const noTables = !/[│┌┐└┘├┤┬┴┼═╔╗╚╝]/.test(resumeText);
  const atsCompatibility = Math.round(
    (hasEmail ? 25 : 0) + (hasPhone ? 20 : 0) + (hasLinkedin ? 20 : 0) + (noTables ? 20 : 0) + 15
  );

  const overallMatch = Math.round(
    keywordMatch * 0.35 + skillMatch * 0.30 + experienceMatch * 0.20 + atsCompatibility * 0.15
  );

  const missingSkills = skillsInJD
    .filter((s) => !skillsInResume.includes(s))
    .slice(0, 8);

  const recommendedSkills = [
    ...missingSkills,
    ...missingKeywords.filter((k) => k.length > 4 && !missingSkills.includes(k)).slice(0, 5),
  ].slice(0, 10);

  const resumeChanges: string[] = [];
  if (missingKeywords.length > 0) {
    resumeChanges.push(`Add these keywords to your resume: ${missingKeywords.slice(0, 5).join(", ")}`);
  }
  if (missingSkills.length > 0) {
    resumeChanges.push(`Include these skills in your Skills section: ${missingSkills.slice(0, 4).join(", ")}`);
  }
  if (!hasLinkedin) {
    resumeChanges.push("Add your LinkedIn URL to the contact section");
  }
  if (keywordMatch < 50) {
    resumeChanges.push("Rewrite your summary to match the job description's language");
  }
  if (experienceMatch < 70) {
    resumeChanges.push("Highlight years of relevant experience more prominently");
  }
  resumeChanges.push("Mirror the job title in your resume headline/summary");
  resumeChanges.push("Quantify achievements with metrics that align with the JD's goals");
  resumeChanges.push("Use the exact phrases from the job description where you have that experience");

  return {
    overallMatch,
    keywordMatch,
    skillMatch,
    experienceMatch,
    atsCompatibility,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords,
    recommendedSkills,
    resumeChanges: resumeChanges.slice(0, 8),
    jdKeywords: jdKeywords.slice(0, 20),
    resumeKeywords,
    skillsInJD,
    skillsInResume,
  };
}
