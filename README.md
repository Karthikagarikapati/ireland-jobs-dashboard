# 🇮🇪 Ireland Job Market Intelligence Dashboard

![React](https://img.shields.io/badge/React-18-blue)
![Python](https://img.shields.io/badge/Python-3.10-blue)
![Dataset](https://img.shields.io/badge/Dataset-37%2C483%20jobs-green)
![Deployed](https://img.shields.io/badge/Live-Vercel-black)
![Boards](https://img.shields.io/badge/Job%20Boards-11-purple)

## 🔗 Live Dashboard
👉 **[ireland-jobs-dashboard.vercel.app](https://ireland-jobs-dashboard.vercel.app)**

## Executive Summary

**Business problem:** Job seekers and recruiters in Ireland have no single view of where demand actually sits across the market — which categories are hiring, which cities dominate, and which companies are the biggest employers right now.

**Solution:** Scraped and processed 37,483 real Irish job postings from 11 job boards (October 2022 snapshot), built a Python data pipeline to parse nested JSON into clean analytical CSVs, then shipped a fully interactive React dashboard deployed on Vercel.

**What makes it different:** Every chart is interconnected. Click a category bar → the companies, seniority split, and job board charts all update in real time. No page reload. No Tableau licence required. Just a URL.

**Key findings:**
- IT Services is the #1 hiring industry with 1,251 open roles
- Dublin dominates but Cork and Galway show meaningful demand outside the capital
- Data & Analytics has 406 open roles — mid-level positions (225) outnumber senior (127) 2:1
- 56% of salary data is missing — a market transparency gap

---

## Business Problem

Ireland's job market in 2022 was one of the tightest in Europe. With 37,000+ active postings across 11 platforms simultaneously, candidates had no way to understand the full picture — where the volume was, which companies were actively hiring at scale, and whether their target role (Data Analyst, Senior Engineer) was in demand or saturated.

**This dashboard answers 5 questions in one view:**
1. Which job categories have the most openings right now?
2. Which cities outside Dublin are worth targeting?
3. Who are the top 12 companies hiring in any given category?
4. What seniority level is most in demand — junior, mid, or senior?
5. Which job boards are worth checking, and does it change by category?

---

## Methodology

**Data source:** Kaggle — Techmap Job Postings Ireland October 2022
`techmap/job-postings-ireland-october-2022` · 37,483 rows · 24 columns · JSON format

**Step 1 — Parsing nested JSON**
The raw data stored job titles, companies, cities, categories, and salaries as deeply nested stringified dicts inside a single JSON lines file. Six custom parsing functions used `ast.literal_eval` with safe fallbacks to extract clean flat columns.

**Step 2 — Feature extraction**
Extracted 8 clean columns from 24 raw ones:

| Raw field | Extracted column | Method |
|---|---|---|
| `name` | `job_title` | Direct string strip |
| `source` | `job_board` | Direct string strip |
| `position` | `category`, `seniority` | Dict parse → `.get()` |
| `orgCompany` | `company` | Dict parse → `.get('name')` |
| `orgAddress` | `city`, `county` | Dict parse → `.get()` |
| `orgTags` | `industry` | Dict parse → `INDUSTRIES[0]` |

**Step 3 — Category mapping**
Job titles were mapped to 12 clean categories using keyword matching — "data analyst", "machine learning", "BI" → Data & Analytics; "nurse", "doctor", "physiotherapist" → Healthcare, etc.

**Step 4 — City cleaning**
Raw city strings were normalised to 15 clean city names, stripping inconsistent spellings, country suffixes, and blank entries.

**Step 5 — Aggregation & export**
8 purpose-built CSVs exported for the React frontend — one per chart view — to keep the dashboard fast and each component independent.

**Step 6 — React dashboard**
Built with React + Recharts. All charts share state via `useState`. Clicking any bar in the Category or City chart updates `selectedCategory` / `selectedCity` state, which filters the master dataset in memory and re-renders companies, seniority, and job board charts instantly.

**Step 7 — Deployment**
Deployed on Vercel via GitHub integration. Zero config — push to main, live in 60 seconds.

---

## Skills & Stack

| Layer | Technology |
|---|---|
| Data pipeline | Python, Pandas, JSON parsing, `ast.literal_eval` |
| Data export | CSV (8 files), Google Colab |
| Frontend | React 18, Recharts, CSS-in-JS |
| Deployment | Vercel, GitHub |
| Dataset | Kaggle API (kagglehub) |

**Techniques demonstrated:**
- Nested JSON parsing with safe fallback functions
- Keyword-based text classification (job category mapping)
- Reactive state management across multiple chart components
- CSV-driven frontend architecture (no backend, no database)
- Production deployment pipeline (GitHub → Vercel)

---

## Key Findings

| Insight | Number | Implication |
|---|---|---|
| Top hiring industry | IT Services: 1,251 roles | Tech dominates the Irish market |
| #2 industry | Staffing & Recruiting: 907 roles | High demand for contractors/temp |
| Data & Analytics roles | 406 total | Healthy market for analysts |
| Mid-level Data roles | 225 (55%) | Most demand is mid-level, not junior |
| Senior Data roles | 127 (31%) | Senior roles available but competitive |
| Salary data missing | 56% of postings | Major transparency gap in the market |
| Top non-Dublin city | Cork | Strong secondary market |

---

## Data & Analytics Deep Dive

The dashboard includes a dedicated section for the 406 Data & Analytics roles — the target market for any aspiring data professional in Ireland.

**Seniority breakdown:**
- Mid-Level: 225 roles (55%)
- Senior: 127 roles (31%)
- Junior: 29 roles (7%)
- Management: 25 roles (6%)

**Implication:** If you're entry-level, Ireland's data market is genuinely competitive — only 7% of data roles are junior. Focus on mid-level roles with 1–2 years experience, or target the staffing agencies (907 roles) who place junior candidates.

---

## Next Steps & Limitations

**If I had more time:**
- [ ] Add salary analysis — 44% of postings do have salary data, enough for a distribution chart
- [ ] Build a skills extractor using NLP on the `text` field — what technologies appear most in job descriptions?
- [ ] Add a time series view — the dataset has `dateScraped` so demand by week is possible
- [ ] Expand to 2024 data via the Techmap API to show market changes post-COVID

**Limitations:**
- October 2022 snapshot — the market has shifted since, particularly in tech (layoffs 2023)
- 56% of salary fields are empty — salary analysis would be based on a biased sample
- Category mapping uses keyword rules — edge cases and unusual titles may be miscategorised
- City data has gaps — remote/hybrid jobs often have no clean city value

---

## How to Run Locally

```bash
git clone https://github.com/YOURUSERNAME/ireland-jobs-dashboard
cd ireland-jobs-dashboard
npm install
npm start
# Opens at http://localhost:3000
```

To regenerate the CSV data files, open `Ireland_job_dashboard.ipynb` in Google Colab and run all cells.
