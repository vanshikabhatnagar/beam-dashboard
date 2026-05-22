# Live Demo
Open this link - https://beam-dashboard-sepia.vercel.app/

----
# Magic Notes Analytics Dashboard

A clickable analytics prototype for Beam's Magic Notes product, built to demonstrate what operational intelligence could look like for senior leadership at UK local authorities.

## What it does

The dashboard visualises AI summary data across three councils (Hackney, Camden, Southwark), covering:

- KPI overview: completed summaries, average feedback score, estimated hours saved, active practitioners
- Recommended actions with URGENT / MONITOR / INVEST priority tags, tailored per persona
- AI model performance: satisfaction ratings and non-completion rates by model
- Caseload breakdown: top case topics and feedback score distribution
- Template performance: usage, ratings, and non-completion rate across all prompt templates
- Practitioner voices: themes extracted from free-text feedback
- Adoption by practitioner role

Three persona views — **Overview**, **Business**, **Quality & Safety** — reorder and reframe the dashboard for different leadership audiences.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

---

## Running locally

```bash
# 1. Navigate into the project folder
cd beam-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The dashboard loads instantly — all data is parsed client-side from CSV files, no backend required.

---

## Project structure

```
beam-dashboard/
├── public/
│   └── data/                   # Five CSV data files (do not move or rename)
│       ├── summaries.csv
│       ├── feedback.csv
│       ├── users.csv
│       ├── transcripts.csv
│       └── prompt_templates.csv
├── src/
│   ├── App.tsx                  # Root layout, persona + council state, section ordering
│   ├── hooks/
│   │   └── useData.ts           # Loads and joins all five CSVs at runtime
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── StickyNav.tsx
│   │   ├── RecommendedActions.tsx
│   │   ├── KpiCards.tsx
│   │   ├── TrendChart.tsx
│   │   ├── ModelPerformance.tsx
│   │   ├── CouncilVolumeDonut.tsx
│   │   ├── TopicsChart.tsx
│   │   ├── FeedbackDistribution.tsx
│   │   ├── TemplateTable.tsx
│   │   ├── PractitionerFeedback.tsx
│   │   ├── AdoptionByRole.tsx
│   │   └── Footer.tsx
│   └── types.ts                 # TypeScript interfaces for all data tables
├── index.html
├── vite.config.ts
└── package.json
```

---

## Building for production

```bash
npm run build
```

Output is written to `dist/`. To preview the production build locally:

```bash
npm run preview
```

---

## Tech stack

| Library | Purpose |
|---|---|
| React 18 + TypeScript | UI and type safety |
| Vite | Dev server and production build |
| Recharts | All charts (line, bar, donut) |
| PapaParse | Client-side CSV parsing |
| Tailwind CSS v4 | Global styles and CSS variables |

---

## Data notes

- All data is synthetic and representative of a realistic Magic Notes deployment.
- 200 summaries across 5 AI models, 3 councils, 8 prompt templates, 25 practitioners.
- 150 of 200 summaries have practitioner feedback (rating + optional free-text comment).
- The final month of transcript data (December 2025) is excluded from the trend chart as it is a partial month and would create a misleading apparent decline.
- Hours Saved is estimated as 75% of average transcript duration per completed summary.
- No data leaves the browser — all joins and aggregations happen in memory at load time.
