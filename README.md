# ResumeAI — Resume & Career Toolkit

**A browser-first toolkit for resume analysis, job matching, interview practice, and resume redesign.**

ResumeAI brings practical career-preparation tools into one workspace. Job seekers can review common resume signals, compare their experience with a job description, rehearse interview questions, and explore redesigned resume templates.

## Features

### ATS Analyzer
Upload a PDF or DOCX resume to review contact details, standard resume sections, action verbs, quantified achievements, document length, and other ATS-oriented signals. The analyzer returns a score with strengths and improvement suggestions.

### Job Match
Compare resume content with a pasted job description. Review overlapping and missing keywords, recognized technical skills, an estimated experience match, and suggested changes to consider.

### Interview Coach
Generate HR, behavioral, and technical practice questions based on topics detected in a resume and job description. Explore sample answers or use mock-interview mode for structured feedback on responses.

### Resume Redesign
Extract resume content and preview it in a gallery of 51 templates across eight categories. Adjust typography, accent color, margins, and text size, then export the result as a PDF or Word-compatible document.

## Product and Engineering Highlights

- **Browser-based document processing:** PDF and DOCX text extraction runs in the browser using PDF.js and Mammoth.
- **Modular analysis logic:** Resume extraction, parsing, ATS analysis, job matching, and interview question generation are separated into focused modules.
- **Transparent scoring:** Scores are based on identifiable signals such as keywords, sections, contact information, action verbs, metrics, and answer structure.
- **Monorepo foundation:** The project uses pnpm workspaces and includes shared API, OpenAPI, validation, and database packages.

## How the Analysis Works

The current version does not call a remote generative-AI service. Resume scores and job-match estimates are calculated with deterministic rules, and interview questions are selected from a curated question bank using detected topics.

Treat the results as coaching guidance—not a prediction of how a specific employer’s ATS, recruiter, or interviewer will evaluate an application. Review parsed content and exported documents before using them.

## Technology

### ResumeAI application
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide icons
- PDF.js
- Mammoth

### Shared workspace
- pnpm workspaces
- Express 5 API server
- OpenAPI-generated client and validation packages
- Drizzle ORM and PostgreSQL schema package

The resume workflows currently run in the browser and do not require an account, database, or external API credentials.

## Run Locally

### Requirements

- Node.js 24 or newer
- pnpm

### Install and start

Run these commands from the repository root:

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/resume-builder run dev
