This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 🚀 JobPilot

### AI-Powered Job Search & Application Assistant for Developers

JobPilot is an **AI-first job hunting platform** designed to make the developer job search process faster, smarter, and less repetitive.

It helps technical job seekers:

- Create a professional profile
- Upload and analyze resumes
- Discover relevant jobs
- Evaluate job compatibility using AI
- Identify matching and missing skills
- Research companies automatically
- Track job-search activity
- Make better decisions before applying

Instead of manually reading dozens of job descriptions and spending hours researching companies, JobPilot automates the most repetitive parts of the job hunting process.

---

## 📌 Overview

Finding the right technical job is often a fragmented and time-consuming process.

Developers usually need to:

- Search across multiple job boards
- Read long job descriptions
- Compare their skills with job requirements
- Identify missing skills
- Research companies
- Understand company technology stacks
- Decide whether a role is worth applying to

JobPilot combines these activities into one intelligent workflow.

The goal is to reduce the time between:

> **"I want a job."**

and

> **"I know which jobs are worth applying to and why."**

---

# ✨ Core Features

## 👤 User Profile

Users can create and maintain a structured professional profile containing:

- Name and professional title
- Technical skills
- Work experience
- Education
- Projects
- Preferred roles
- Preferred locations
- Career interests
- Work preferences

The profile becomes the foundation for personalized job matching.

---

## 📄 Resume Upload & AI Parsing

Users can upload an existing resume.

JobPilot uses AI and PDF processing tools to automatically extract structured information such as:

- Personal information
- Professional summary
- Work experience
- Education
- Technical skills
- Projects
- Certifications

The extracted information can then be used to improve the user's profile and job recommendations.

---

## 📝 AI Resume Generation

JobPilot can generate a professional resume using structured profile data.

Possible features include:

- Professional resume layout
- Structured sections
- AI-generated professional summary
- Skills organization
- Work experience formatting
- Project formatting
- PDF export

---

## 🔍 Job Discovery

Users can search for technical jobs using:

- Job title
- Keyword
- Location
- Role type

Job data is retrieved through external job APIs such as **Adzuna**.

Example searches:

```text
Frontend Developer
Full Stack Developer
AI Engineer
Software Engineer
Data Engineer
Machine Learning Engineer
```

---

## 🧠 AI Job Matching

One of the main features of JobPilot is intelligent job matching.

The system compares a job description with the user's:

- Skills
- Experience
- Resume
- Technical background
- Preferred role

The AI can generate:

- Match score
- Matching skills
- Missing skills
- Candidate strengths
- Potential concerns
- Match explanation
- Application insights

Example:

```json
{
  "matchScore": 86,
  "summary": "Strong match for this full-stack developer position.",
  "matchingSkills": [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL"
  ],
  "missingSkills": [
    "AWS",
    "Terraform"
  ],
  "strengths": [
    "Strong frontend development experience",
    "Relevant TypeScript experience",
    "Experience building full-stack applications"
  ],
  "concerns": [
    "Limited infrastructure-as-code experience"
  ]
}
```

This allows users to understand not only **how well they match a job**, but also **why**.

---

# 🏢 AI Company Research

Before applying for a job, users can ask JobPilot to research the company.

The system uses browser automation and AI to collect and summarize useful company information.

Research can include:

- Company overview
- Products and services
- Industry
- Technology stack
- Engineering culture
- Company size
- Recent company activity
- Relevant website information
- Useful application context

---

## 📊 Company Dossier

Company research can be converted into a structured dossier.

Example:

```text
Company
│
├── Overview
├── Industry
├── Products
├── Technology Stack
├── Engineering Information
├── Company Size
├── Recent Activity
├── Important Links
└── Application Notes
```

This reduces the amount of manual company research required before applying or preparing for an interview.

---

# 📊 Dashboard

JobPilot includes a centralized dashboard for job-search activity.

The dashboard can display:

- Total jobs discovered
- High-match jobs
- Saved opportunities
- Recent job searches
- Resume activity
- Company research activity
- Match score trends
- Recent user activity
- Application-related analytics

Example:

```text
Dashboard
│
├── Total Jobs
├── High Match Jobs
├── Saved Jobs
├── Resume Status
├── Recent Searches
├── Match Trends
├── Company Research
└── Recent Activity
```

---

# 🔄 User Workflow

A typical JobPilot workflow looks like this:

```text
1. Create an account
        ↓
2. Complete professional profile
        ↓
3. Upload resume
        ↓
4. AI parses resume information
        ↓
5. Search for jobs
        ↓
6. JobPilot retrieves opportunities
        ↓
7. AI compares jobs with user profile
        ↓
8. Review match score and skill analysis
        ↓
9. Select interesting company
        ↓
10. AI researches the company
        ↓
11. Review company dossier
        ↓
12. Decide whether to apply
```

---

# 🛠️ Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

The frontend is designed as a modern SaaS application with:

- Reusable components
- Responsive layouts
- Dashboard interfaces
- Job search interfaces
- AI-powered workflows

---

## Backend

### InsForge

JobPilot uses **InsForge** as its backend platform.

InsForge provides:

- PostgreSQL database
- Authentication
- File storage
- Backend services
- Application data management
- API infrastructure

---

## 🤖 Artificial Intelligence

### OpenAI / GPT

OpenAI models are used for:

- Resume parsing
- Resume content generation
- Job description analysis
- Candidate-to-job matching
- Skill comparison
- Match explanations
- Company research summarization
- Structured data extraction

---

## 💼 Job Data

### Adzuna API

Adzuna is used to retrieve external job listings.

It allows users to search jobs based on:

- Keywords
- Job titles
- Locations

---

## 🌐 Browser Automation

### Browserbase

Browserbase provides managed browser infrastructure for automated web research.

### Stagehand

Stagehand is used to automate browser interactions using AI-powered workflows.

Together they allow JobPilot to research company websites automatically.

---

## 📈 Analytics

### PostHog

PostHog is used for product analytics and event tracking.

Possible tracked events include:

- User signup
- Resume upload
- Job search
- Job view
- AI match request
- Company research
- Saved job
- Resume generation
- Dashboard activity

---

## 📄 PDF & Resume Processing

Resume-related functionality uses tools such as:

- React PDF
- PDF parsing libraries
- File upload tools
- Resume document processing

These tools support both:

- Reading uploaded resumes
- Generating new resume PDFs

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────┐
│          JobPilot UI            │
│                                 │
│ Next.js + React + TypeScript    │
│ Tailwind CSS                    │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Application Layer         │
│                                 │
│ Next.js Server Logic / APIs     │
└─────────┬──────────────┬────────┘
          │              │
          ▼              ▼
┌─────────────────┐   ┌─────────────────┐
│    InsForge     │   │  OpenAI / GPT   │
│                 │   │                 │
│ Authentication  │   │ Resume Parsing  │
│ PostgreSQL      │   │ Job Matching    │
│ File Storage    │   │ AI Reasoning    │
│ Backend         │   │ Research        │
└────────┬────────┘   └────────┬────────┘
         │                     │
         │                     │
         ▼                     ▼
┌─────────────────────────────────┐
│        External Services        │
│                                 │
│ • Adzuna API                    │
│ • Browserbase                   │
│ • Stagehand                     │
│ • PostHog                       │
└─────────────────────────────────┘
```

---

# 🧠 AI Job Matching Architecture

```text
User Profile
      +
Parsed Resume
      +
Job Description
      │
      ▼
Structured AI Prompt
      │
      ▼
OpenAI Model
      │
      ▼
Job Match Analysis
      │
      ├── Match Score
      ├── Matching Skills
      ├── Missing Skills
      ├── Strengths
      ├── Concerns
      └── Match Explanation
```

---

# 🔎 Company Research Architecture

```text
Selected Job
     │
     ▼
Company Information
     │
     ▼
Browserbase
     │
     ▼
Stagehand
     │
     ▼
Company Website Research
     │
     ▼
Structured Research Data
     │
     ▼
OpenAI Analysis
     │
     ▼
Company Dossier
```

---

# 📁 Application Structure

A simplified product structure:

```text
JobPilot
│
├── Authentication
│   ├── Sign Up
│   ├── Sign In
│   └── Session Management
│
├── Dashboard
│   ├── Statistics
│   ├── Recent Activity
│   ├── Match Trends
│   └── Research Activity
│
├── Profile
│   ├── Personal Information
│   ├── Skills
│   ├── Experience
│   ├── Education
│   ├── Projects
│   └── Preferences
│
├── Resume
│   ├── Upload Resume
│   ├── Parse Resume
│   ├── Edit Resume Data
│   └── Generate Resume PDF
│
├── Jobs
│   ├── Search Jobs
│   ├── Job Details
│   ├── AI Match Analysis
│   ├── Save Job
│   └── Match Explanation
│
├── Companies
│   ├── Company Research
│   ├── Company Dossier
│   └── Technology Insights
│
└── Analytics
    ├── User Activity
    ├── Job Interaction
    └── Product Events
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

```text
Node.js 20+
npm / pnpm / yarn
Git
```

You will also need API credentials for the external services used by the project.

---

## Clone Repository

```bash
git clone <your-repository-url>
cd jobpilot
```

---

## Install Dependencies

Using npm:

```bash
npm install
```

Using pnpm:

```bash
pnpm install
```

Using yarn:

```bash
yarn install
```

---

# 🔐 Environment Variables

Create a `.env.local` file in the root directory.

Example:

```env
# ===================================
# APPLICATION
# ===================================

NEXT_PUBLIC_APP_URL=http://localhost:3000


# ===================================
# OPENAI
# ===================================

OPENAI_API_KEY=your_openai_api_key


# ===================================
# ADZUNA
# ===================================

ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key


# ===================================
# BROWSERBASE
# ===================================

BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id


# ===================================
# POSTHOG
# ===================================

NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com


# ===================================
# INSFORGE
# ===================================

NEXT_PUBLIC_INSFORGE_URL=your_insforge_url
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_key
```

> ⚠️ Environment variable names may differ depending on the current project implementation. Check your project configuration before deployment.

---

# ▶️ Run the Application

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 📦 Available Scripts

```bash
npm run dev
```

Runs the application in development mode.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs code quality checks.

Check `package.json` for the exact scripts available in the project.

---

# 💡 Why JobPilot?

Traditional job platforms mostly help users:

> **Find more job listings.**

JobPilot focuses on helping users:

> **Understand which opportunities are actually relevant.**

JobPilot combines:

- Job discovery
- Candidate profiling
- Resume intelligence
- AI reasoning
- Skill-gap analysis
- Company research
- Browser automation
- Analytics

into one connected experience.

---

# 🤖 AI-First Product Philosophy

JobPilot is designed as an **AI-first application**, rather than a traditional job platform with AI added later.

AI is integrated throughout the complete workflow:

```text
Resume
   ↓
AI Resume Parsing
   ↓
Structured Candidate Profile
   ↓
Job Discovery
   ↓
AI Job Matching
   ↓
Skill Gap Analysis
   ↓
Company Research Agent
   ↓
Application Insights
```

The objective is not simply to show users more jobs.

The objective is to help users identify the **right opportunities faster**.

---

# 🎯 Project Goals

The main goals of JobPilot are:

- Reduce time spent searching for suitable jobs
- Automate repetitive job-search tasks
- Make job descriptions easier to evaluate
- Provide transparent AI match explanations
- Identify skill gaps
- Automate company research
- Centralize job-search information
- Help developers make informed application decisions
- Demonstrate a complete AI-powered SaaS architecture

---

# 🌟 Project Description

> **JobPilot is an AI-first job hunting platform built to automate and optimize the developer job search process.**
>
> The platform uses intelligent AI workflows to discover jobs, match opportunities to a candidate's profile, extract structured information from resumes, research companies, and present actionable insights through a centralized dashboard.
>
> JobPilot reduces the manual effort involved in job hunting by combining modern full-stack development, AI reasoning, external job APIs, browser automation, authentication, document processing, and product analytics into one experience.
>
> The project demonstrates an end-to-end AI-powered SaaS architecture covering frontend development, backend services, intelligent matching, resume processing, automated company research, analytics, and third-party integrations.

---

# 🛣️ Future Improvements

Planned and possible future features include:

- AI-generated cover letters
- Job-specific resume customization
- Application tracking system
- Interview preparation assistant
- AI-generated interview questions
- Salary insights
- Job alerts
- Email integration
- Calendar integration
- GitHub profile analysis
- LinkedIn profile analysis
- Portfolio analysis
- Recruiter contact discovery
- Automated follow-up reminders
- Multiple resume versions
- Personalized career recommendations
- Skill-gap learning plans
- Application status tracking

---

# 🔒 Security

Sensitive credentials must never be committed to GitHub.

Important practices:

- Store API keys inside environment variables
- Add `.env.local` to `.gitignore`
- Never expose private API keys to client-side code
- Validate uploaded files
- Protect authenticated routes
- Apply database access policies
- Validate API requests
- Sanitize AI inputs when required
- Protect user resume and personal data

Example `.gitignore`:

```gitignore
.env
.env.local
.env.production
node_modules
.next
```

---

# 📚 Documentation

Project documentation is maintained in:

```text
README.md
project-overview.md
```

### `README.md`

Contains:

- Product introduction
- Main features
- Tech stack
- Architecture
- Installation
- Development instructions

### `project-overview.md`

Can contain more detailed information about:

- Product architecture
- AI workflows
- Database design
- Feature specifications
- Technical decisions
- External integrations

---

# 📈 Development Status

JobPilot is being developed as a modern AI-powered full-stack SaaS application.

Current core areas include:

```text
✅ Authentication

✅ User Profiles

✅ Resume Processing

✅ Job Discovery

✅ AI Job Matching

✅ Company Research

✅ Dashboard

✅ External API Integration

✅ Analytics
```

The platform can continue expanding with application tracking, interview preparation, job alerts, and additional AI agents.

---

# 🤝 Contributing

Contributions and suggestions are welcome.

Create a new branch:

```bash
git checkout -b feature/your-feature
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Add new feature"
```

Push:

```bash
git push origin feature/your-feature
```

Then create a Pull Request.

---

# 📄 License

Add the appropriate license for the project.

Example:

```text
MIT License
```

---

# 👨‍💻 Author

Developed as a modern **AI-first Full-Stack SaaS project** focused on improving the technical job search experience.

Built with:

```text
Next.js
React
TypeScript
Tailwind CSS
InsForge
OpenAI
Adzuna
Browserbase
Stagehand
PostHog
```

---

# 🚀 Vision

JobPilot aims to transform job hunting from a repetitive search process into an intelligent decision-making workflow.

Instead of asking:

> **"Where can I find more jobs?"**

JobPilot helps users answer:

> **"Which jobs are actually right for me, and why?"**

---

<p align="center">
  <strong>JobPilot — Find Better Opportunities. Apply Smarter.</strong>
</p>
