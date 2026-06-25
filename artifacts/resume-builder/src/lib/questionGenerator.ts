export type QuestionCategory = "HR" | "Technical" | "Behavioral";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  sampleAnswer: string;
  keywords: string[];
  followUp?: string;
}

const HR_QUESTIONS: Omit<InterviewQuestion, "id">[] = [
  {
    question: "Tell me about yourself.",
    category: "HR",
    difficulty: "Easy",
    sampleAnswer: "I'm a [role] with [X] years of experience in [field]. I specialize in [key skill] and have a track record of [achievement]. I'm passionate about [interest] and looking to [career goal] in my next role.",
    keywords: ["experience", "skills", "achievement", "passion", "goal"],
  },
  {
    question: "Why are you interested in this position?",
    category: "HR",
    difficulty: "Easy",
    sampleAnswer: "This role excites me because it aligns perfectly with my background in [area] and my goal to [objective]. I'm particularly drawn to [company value/project] because [reason]. I believe I can contribute [specific value] to your team.",
    keywords: ["align", "background", "contribute", "excited", "goal"],
  },
  {
    question: "Where do you see yourself in 5 years?",
    category: "HR",
    difficulty: "Medium",
    sampleAnswer: "In five years, I see myself having grown into a [senior role/leadership] position, having deepened my expertise in [skill] and contributed to [impactful work]. I'm also interested in [mentoring/leading teams] as my career progresses.",
    keywords: ["growth", "leadership", "expertise", "contribute", "career"],
  },
  {
    question: "What is your greatest strength?",
    category: "HR",
    difficulty: "Easy",
    sampleAnswer: "My greatest strength is [skill], which I demonstrated when I [specific example]. For instance, [concrete situation] where I [action] and the result was [outcome]. This directly translates to value I can bring here.",
    keywords: ["strength", "demonstrated", "result", "example", "value"],
  },
  {
    question: "What is your greatest weakness?",
    category: "HR",
    difficulty: "Medium",
    sampleAnswer: "I used to [weakness], but I've actively worked on it by [specific improvement steps]. For example, I [action taken] which helped me [improvement]. I've seen significant progress and continue to work on this.",
    keywords: ["improvement", "working", "progress", "actively", "learned"],
  },
  {
    question: "Why are you leaving your current job?",
    category: "HR",
    difficulty: "Medium",
    sampleAnswer: "I'm looking for a new challenge where I can [grow/expand skills]. My current role has been valuable, but I've accomplished [achievements] and I'm ready for the next step. This role offers the [opportunity/challenge] I'm seeking.",
    keywords: ["challenge", "growth", "opportunity", "accomplished", "ready"],
  },
  {
    question: "What is your expected salary?",
    category: "HR",
    difficulty: "Medium",
    sampleAnswer: "Based on my research of similar roles and my [X] years of experience in [field], I'm targeting a range of $[X] to $[Y]. That said, I'm flexible and open to discussing total compensation including benefits and growth opportunities.",
    keywords: ["research", "experience", "range", "flexible", "compensation"],
  },
  {
    question: "Do you work better alone or in a team?",
    category: "HR",
    difficulty: "Easy",
    sampleAnswer: "I thrive in both environments. I enjoy the collaborative energy of a team and excel at [specific team contribution], but I'm also highly productive independently and can manage my own projects end-to-end. For example, [brief example of each].",
    keywords: ["collaborative", "independent", "productive", "team", "manage"],
  },
];

const BEHAVIORAL_QUESTIONS: Omit<InterviewQuestion, "id">[] = [
  {
    question: "Tell me about a time you faced a difficult challenge at work.",
    category: "Behavioral",
    difficulty: "Medium",
    sampleAnswer: "Situation: [describe context]. Task: I was responsible for [task]. Action: I [specific steps taken]. Result: This led to [measurable outcome, e.g., 20% improvement / project delivered on time]. The key learning was [insight].",
    keywords: ["situation", "challenge", "action", "result", "outcome", "learned"],
    followUp: "What would you do differently next time?",
  },
  {
    question: "Describe a time you had to work with a difficult colleague.",
    category: "Behavioral",
    difficulty: "Medium",
    sampleAnswer: "In my role at [company], I worked with a colleague who [challenge]. I chose to [approach: direct conversation/mediation]. We established [agreement/process]. The outcome was [positive result], and we successfully [project outcome].",
    keywords: ["communicate", "resolve", "collaborate", "approach", "outcome", "team"],
    followUp: "How did it affect the team dynamic?",
  },
  {
    question: "Give an example of a time you showed leadership.",
    category: "Behavioral",
    difficulty: "Hard",
    sampleAnswer: "When [situation arose], I stepped up by [leadership action]. I organized [team/resources], delegated [tasks], and maintained [communication]. The result was [outcome], and the team [positive result]. It reinforced my belief in [leadership principle].",
    keywords: ["leadership", "organized", "delegated", "motivated", "result", "team"],
  },
  {
    question: "Tell me about a time you failed and what you learned.",
    category: "Behavioral",
    difficulty: "Hard",
    sampleAnswer: "In [project/role], I [decision that led to failure]. This resulted in [negative outcome]. I took responsibility by [actions]. I learned [specific lesson] and since then I've [process change that prevents recurrence]. This experience made me a stronger [skill].",
    keywords: ["failure", "responsibility", "learned", "changed", "improved", "growth"],
  },
  {
    question: "Describe a situation where you had to meet a tight deadline.",
    category: "Behavioral",
    difficulty: "Medium",
    sampleAnswer: "When [project] needed to be completed in [timeframe], I prioritized [key tasks], delegated [parts], and worked [extra effort] to ensure delivery. I communicated proactively with stakeholders about progress. We delivered on time and [quality result].",
    keywords: ["prioritize", "deadline", "delivered", "organized", "communicate", "quality"],
    followUp: "What would you do if you realized you couldn't meet the deadline?",
  },
  {
    question: "Tell me about a time you had to learn something quickly.",
    category: "Behavioral",
    difficulty: "Medium",
    sampleAnswer: "When I joined [project/role] requiring [new skill/tool], I had [timeframe] to get up to speed. I used [resources: documentation/courses/mentors], practiced by [hands-on approach], and was contributing meaningfully within [timeframe]. The project [outcome].",
    keywords: ["learn", "quickly", "adapt", "resources", "contribute", "new"],
  },
  {
    question: "How do you handle conflicting priorities?",
    category: "Behavioral",
    difficulty: "Medium",
    sampleAnswer: "I start by assessing urgency and impact of each task. I communicate with stakeholders to align on priorities, then create a structured plan. For example, when [situation], I [specific approach], which resulted in [successful outcome].",
    keywords: ["prioritize", "communicate", "assess", "stakeholders", "plan", "outcome"],
  },
  {
    question: "Give an example of when you went above and beyond.",
    category: "Behavioral",
    difficulty: "Easy",
    sampleAnswer: "During [project], I noticed [opportunity/gap]. Without being asked, I [extra action taken]. This resulted in [positive outcome, e.g., saving X hours, increasing revenue by Y%]. My manager recognized this by [acknowledgment].",
    keywords: ["initiative", "proactive", "noticed", "extra", "result", "recognized"],
  },
];

const SKILL_QUESTION_MAP: Record<string, Omit<InterviewQuestion, "id">[]> = {
  javascript: [
    { question: "Explain the difference between `let`, `const`, and `var` in JavaScript.", category: "Technical", difficulty: "Easy", sampleAnswer: "`var` is function-scoped and hoisted. `let` is block-scoped and not hoisted. `const` is block-scoped, not hoisted, and cannot be reassigned (though objects it references can be mutated). Prefer `const` by default, `let` when reassignment is needed.", keywords: ["scope", "hoisting", "block", "function", "reassign"] },
    { question: "What is the event loop in JavaScript and how does it work?", category: "Technical", difficulty: "Hard", sampleAnswer: "The event loop is JavaScript's mechanism for handling async operations. The call stack executes synchronous code. When async operations complete, callbacks are queued in the task queue or microtask queue. The event loop continuously checks if the call stack is empty and processes queued tasks.", keywords: ["async", "call stack", "queue", "microtask", "event loop", "synchronous"] },
    { question: "How do Promises differ from callbacks in JavaScript?", category: "Technical", difficulty: "Medium", sampleAnswer: "Callbacks can lead to 'callback hell' with nested async operations. Promises provide a cleaner syntax for chaining async operations with `.then()` and `.catch()`. Async/await (built on Promises) makes async code look synchronous and is even more readable.", keywords: ["async", "promise", "callback", "chain", "await"] },
  ],
  python: [
    { question: "What are Python decorators and when would you use them?", category: "Technical", difficulty: "Medium", sampleAnswer: "Decorators are functions that wrap other functions to modify their behavior. Common use cases include logging, authentication, caching (memoization), and timing. They use `@` syntax and are a form of metaprogramming, following the open/closed principle.", keywords: ["decorator", "wrap", "function", "logging", "caching", "authentication"] },
    { question: "Explain list comprehensions in Python and give an example.", category: "Technical", difficulty: "Easy", sampleAnswer: "List comprehensions provide a concise way to create lists: `[x*2 for x in range(10) if x % 2 == 0]`. They are generally faster than equivalent for loops and more Pythonic. They support filtering with `if` clauses and can be nested.", keywords: ["comprehension", "concise", "list", "filter", "iteration"] },
    { question: "What is the difference between `__init__` and `__new__` in Python?", category: "Technical", difficulty: "Hard", sampleAnswer: "`__new__` creates a new instance of the class (called first). `__init__` initializes the created instance. You'd override `__new__` when creating singleton patterns or when inheriting from immutable types like `str` or `tuple`.", keywords: ["init", "new", "instance", "constructor", "class", "object"] },
  ],
  react: [
    { question: "Explain the difference between state and props in React.", category: "Technical", difficulty: "Easy", sampleAnswer: "Props are read-only data passed from parent to child — they're immutable within the component. State is mutable data managed within a component using `useState` or class state. When state changes, React re-renders the component. Props flow downward; state stays local (unless lifted up).", keywords: ["state", "props", "immutable", "render", "component", "parent"] },
    { question: "What is the Virtual DOM and why does React use it?", category: "Technical", difficulty: "Medium", sampleAnswer: "The Virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new Virtual DOM tree, diffs it with the previous one (reconciliation), and updates only the changed parts in the real DOM. This is more efficient than direct DOM manipulation.", keywords: ["virtual dom", "reconciliation", "diff", "performance", "update", "efficient"] },
    { question: "Explain React hooks and when they were introduced.", category: "Technical", difficulty: "Medium", sampleAnswer: "Hooks (React 16.8+) let functional components use state, lifecycle methods, and other React features without classes. Key hooks: `useState` (local state), `useEffect` (side effects/lifecycle), `useContext` (context), `useCallback`/`useMemo` (performance optimization), and custom hooks for reusable logic.", keywords: ["hooks", "functional", "state", "effect", "lifecycle", "custom"] },
  ],
  sql: [
    { question: "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?", category: "Technical", difficulty: "Easy", sampleAnswer: "INNER JOIN returns rows where there's a match in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right (NULLs for no match). RIGHT JOIN is the reverse. FULL OUTER JOIN returns all rows from both tables.", keywords: ["join", "inner", "left", "right", "match", "null"] },
    { question: "How would you optimize a slow SQL query?", category: "Technical", difficulty: "Hard", sampleAnswer: "I'd start with EXPLAIN/EXPLAIN ANALYZE to see the query plan. Check for missing indexes on WHERE/JOIN columns, avoid SELECT *, use appropriate data types, reduce N+1 queries, consider query rewriting (CTEs vs subqueries), partition large tables, and use caching where appropriate.", keywords: ["optimize", "index", "explain", "performance", "query", "plan"] },
  ],
  "machine learning": [
    { question: "Explain overfitting and how to prevent it.", category: "Technical", difficulty: "Medium", sampleAnswer: "Overfitting occurs when a model learns training data too well, including noise, and performs poorly on new data. Prevention: cross-validation, regularization (L1/L2), dropout (neural nets), early stopping, data augmentation, reducing model complexity, and getting more training data.", keywords: ["overfitting", "generalize", "regularization", "cross-validation", "training", "test"] },
    { question: "What is the bias-variance tradeoff?", category: "Technical", difficulty: "Hard", sampleAnswer: "Bias is error from wrong assumptions (underfitting). Variance is error from sensitivity to training data fluctuations (overfitting). High bias = model too simple. High variance = model too complex. The goal is to find the right complexity where total error is minimized.", keywords: ["bias", "variance", "tradeoff", "underfitting", "overfitting", "complexity"] },
  ],
  docker: [
    { question: "What is the difference between a Docker image and a container?", category: "Technical", difficulty: "Easy", sampleAnswer: "An image is a read-only template/blueprint containing the app code, runtime, libraries, and config. A container is a running instance of an image. You can run multiple containers from the same image. Images are built with Dockerfiles and stored in registries.", keywords: ["image", "container", "instance", "dockerfile", "registry", "template"] },
    { question: "How does Docker networking work?", category: "Technical", difficulty: "Medium", sampleAnswer: "Docker has network drivers: bridge (default, container-to-container on same host), host (shares host network), overlay (multi-host swarm), macvlan. Containers in the same network communicate by name. Use `--network` to specify. Docker Compose handles networking automatically.", keywords: ["network", "bridge", "container", "overlay", "compose", "communication"] },
  ],
  aws: [
    { question: "Explain the difference between EC2, Lambda, and ECS.", category: "Technical", difficulty: "Medium", sampleAnswer: "EC2 is VMs — full control but you manage the OS. Lambda is serverless functions — event-driven, auto-scaling, pay-per-use, no server management. ECS is container orchestration — runs Docker containers on managed or EC2 infrastructure. Choose based on control needs, cost, and team expertise.", keywords: ["ec2", "lambda", "serverless", "container", "scale", "managed"] },
    { question: "What is the difference between S3, EBS, and EFS?", category: "Technical", difficulty: "Medium", sampleAnswer: "S3 is object storage — great for files, static assets, backups, unlimited scalability. EBS is block storage attached to a single EC2 instance (like a hard drive). EFS is elastic file storage that can be mounted by multiple EC2 instances simultaneously, great for shared storage.", keywords: ["s3", "ebs", "efs", "storage", "object", "block", "file"] },
  ],
  agile: [
    { question: "Walk me through a typical sprint cycle in Scrum.", category: "Technical", difficulty: "Easy", sampleAnswer: "Sprint planning: team selects backlog items and creates sprint backlog. Daily standups: 15-min sync on progress/blockers. Sprint review: demo completed work to stakeholders. Sprint retrospective: team reflects on process improvements. Usually 1–4 weeks per sprint.", keywords: ["sprint", "scrum", "planning", "standup", "retrospective", "backlog"] },
    { question: "How do you handle scope creep in an Agile project?", category: "Technical", difficulty: "Medium", sampleAnswer: "Scope creep is managed through the product backlog. New requests are added as new backlog items and prioritized by the Product Owner — not automatically added to the current sprint. Trade-offs are discussed: if something is added, something of equal size may be removed. Documentation and stakeholder communication are key.", keywords: ["scope", "backlog", "prioritize", "stakeholder", "trade-off", "product owner"] },
  ],
};

const GENERAL_TECH_QUESTIONS: Omit<InterviewQuestion, "id">[] = [
  { question: "Describe your debugging process when you encounter a bug.", category: "Technical", difficulty: "Medium", sampleAnswer: "I start by reproducing the bug reliably. Then I isolate the issue using logging/debugger, form a hypothesis, test it with targeted changes, verify the fix doesn't break other things, and document it. I also look for similar patterns elsewhere in the codebase.", keywords: ["reproduce", "isolate", "debug", "test", "verify", "hypothesis"] },
  { question: "How do you approach code reviews?", category: "Technical", difficulty: "Easy", sampleAnswer: "I look for correctness, readability, maintainability, and performance. I give constructive, specific feedback focused on the code rather than the person. I also acknowledge good work. When receiving reviews, I treat feedback as learning opportunities and discuss rather than defend.", keywords: ["code review", "feedback", "constructive", "readable", "maintainable"] },
  { question: "How do you ensure code quality in your projects?", category: "Technical", difficulty: "Medium", sampleAnswer: "I use a combination of: linting and formatting (ESLint/Prettier), automated testing (unit/integration/e2e), code reviews, CI/CD pipelines, documentation, and design patterns. I also follow SOLID principles and write self-documenting code.", keywords: ["quality", "testing", "linting", "review", "ci/cd", "documentation"] },
  { question: "Explain the concept of RESTful APIs.", category: "Technical", difficulty: "Easy", sampleAnswer: "REST is an architectural style for APIs using HTTP. Key principles: stateless (no session state), resource-based URLs, standard HTTP methods (GET/POST/PUT/DELETE), uniform interface, and cacheable responses. A good REST API is intuitive, versioned, and uses proper status codes.", keywords: ["rest", "http", "stateless", "resource", "endpoint", "method"] },
  { question: "What is version control and how do you use Git in your workflow?", category: "Technical", difficulty: "Easy", sampleAnswer: "Git tracks code changes and enables collaboration. My workflow: feature branches off main, commits with clear messages, pull requests with code review, squash/merge, CI runs on PRs. I use rebasing to keep history clean and resolve conflicts early and often.", keywords: ["git", "branch", "commit", "pull request", "merge", "collaboration"] },
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.keys(SKILL_QUESTION_MAP).filter((skill) => lower.includes(skill));
}

export function generateQuestions(
  resumeText: string,
  jdText: string = ""
): InterviewQuestion[] {
  const combinedText = resumeText + " " + jdText;
  const detectedSkills = extractSkillsFromText(combinedText);

  const questions: InterviewQuestion[] = [];

  HR_QUESTIONS.forEach((q) =>
    questions.push({ ...q, id: generateId() })
  );

  BEHAVIORAL_QUESTIONS.forEach((q) =>
    questions.push({ ...q, id: generateId() })
  );

  const techQs: Omit<InterviewQuestion, "id">[] = [...GENERAL_TECH_QUESTIONS];
  for (const skill of detectedSkills.slice(0, 5)) {
    const skillQs = SKILL_QUESTION_MAP[skill] ?? [];
    techQs.push(...skillQs);
  }

  const seen = new Set<string>();
  for (const q of techQs) {
    if (!seen.has(q.question)) {
      seen.add(q.question);
      questions.push({ ...q, id: generateId() });
    }
  }

  return questions;
}

export function scoreAnswer(
  userAnswer: string,
  sampleAnswer: string,
  keywords: string[]
): { score: number; feedback: string[]; strong: string[]; missing: string[] } {
  const userLower = userAnswer.toLowerCase();
  const matched = keywords.filter((k) => userLower.includes(k.toLowerCase()));
  const missing = keywords.filter((k) => !userLower.includes(k.toLowerCase()));

  const keywordScore = keywords.length > 0 ? (matched.length / keywords.length) * 60 : 30;
  const lengthScore = userAnswer.split(/\s+/).length >= 30 ? 20 : userAnswer.split(/\s+/).length >= 15 ? 10 : 5;
  const specificityScore = /\d+%|\$\d+|\d+\s*(years?|months?|team|users?)/.test(userAnswer) ? 20 : 0;

  const score = Math.min(100, Math.round(keywordScore + lengthScore + specificityScore));

  const feedback: string[] = [];
  if (score >= 80) feedback.push("Excellent answer — specific, structured, and keyword-rich.");
  else if (score >= 60) feedback.push("Good answer. Add more specific examples or metrics to strengthen it.");
  else if (score >= 40) feedback.push("Decent start, but the answer needs more depth and specificity.");
  else feedback.push("The answer lacks detail. Use the STAR method: Situation, Task, Action, Result.");

  if (missing.length > 0) feedback.push(`Try to mention: ${missing.slice(0, 3).join(", ")}`);
  if (lengthScore < 15) feedback.push("Give a longer, more detailed response (aim for 50+ words).");
  if (!specificityScore) feedback.push("Add specific metrics or numbers to make your answer more impactful.");

  return { score, feedback, strong: matched, missing };
}
