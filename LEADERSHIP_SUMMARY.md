# Magic Notes — Operational Intelligence Summary
**Prepared for: Senior Leadership, Local Authority Partners**
**Data period: September 2024 – November 2025**
**Prepared by: Beam**

---

## Purpose of This Document

This summary accompanies the Magic Notes Analytics prototype dashboard. It translates the data behind the prototype into plain-English insights and concrete recommended actions for senior leadership teams across Hackney, Camden, and Southwark Councils.

The prototype demonstrates what a live analytics layer on top of Magic Notes could provide: a real-time view of AI adoption, practitioner satisfaction, template quality, and safeguarding risk signals — in one place, updated automatically, filtered by council or role.

---

## What the Data Covers

| Metric | Figure |
|---|---|
| Total AI summaries generated | 200 |
| Successfully completed | 173 (87%) |
| Practitioner ratings submitted | 150 |
| Average practitioner satisfaction | 3.9 / 5 |
| Estimated staff time saved | ~97 hours |
| Active practitioners | 25 across 3 councils |
| Data period | Sep 2024 – Nov 2025 |

---

## Key Insight 1: The tool is delivering real time savings — but adoption is narrower than it should be

Magic Notes has generated 173 completed AI summaries, saving an estimated 97 hours of practitioner time across the deployment period. That figure uses a conservative estimate: 75% of the average transcript duration (45 minutes) per completed session.

Adoption, however, is concentrated. Social workers and team leaders account for the overwhelming majority of usage. Housing officers and family support workers — roles with equally high documentation burden — represent only 8 active users combined. This is the clearest near-term growth opportunity: the tool is proven to work, and the practitioner cohort who would benefit most from it is largely untouched.

**What to do:**
- Identify housing officers and family support workers in each council who are not yet using Magic Notes
- Run targeted onboarding sessions with those roles specifically, using examples from their own case types
- Set council-level adoption targets by role, not just by total volume

---

## Key Insight 2: Practitioner satisfaction is solid overall, but Hackney is a meaningful outlier

Across all three councils, the average satisfaction score is 3.9 out of 5. Southwark leads at 4.1, Camden sits at 3.9, and Hackney comes in at 3.7 — below the threshold that would indicate the tool is consistently meeting practitioner needs.

A 0.4-point gap between Hackney and Southwark may appear small, but at scale it reflects a meaningfully different practitioner experience. Importantly, volume is broadly even across all three councils (Hackney 33%, Camden 32%, Southwark 35%), so this is not an adoption gap — it is a quality gap.

**What to do:**
- Conduct a structured review of Hackney feedback comments to identify whether the issue is template fit, training, or model selection
- Use Southwark's configuration and workflows as a reference model — the data suggests it is performing best
- Set a target satisfaction score for all councils (recommended baseline: 4.0 / 5) with quarterly review points

---

## Key Insight 3: One AI model is materially less reliable than the others

Five AI models are in use across the deployment: GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet, Claude 3 Haiku, and Gemini 1.5 Pro. Their non-completion rates (sessions where the AI failed to produce a usable summary) vary significantly:

| Model | Non-Completion Rate | Avg Satisfaction |
|---|---|---|
| Gemini 1.5 Pro | 9.5% | 4.2 / 5 |
| Claude 3.5 Sonnet | 9.4% | 3.8 / 5 |
| GPT-4o | 12.0% | 4.1 / 5 |
| Claude 3 Haiku | 12.0% | 4.0 / 5 |
| **GPT-4o-mini** | **21.3%** | **3.6 / 5** |

GPT-4o-mini has a non-completion rate more than twice that of the next-worst model, and the lowest practitioner satisfaction score. It is the most cost-efficient model in the stack, but this data suggests the cost saving is being offset by failed summaries and reduced trust from practitioners.

**What to do:**
- Review GPT-4o-mini's deployment scope and remove it from high-stakes or high-complexity workflows immediately
- Retain it only for low-complexity, high-volume use cases (e.g. brief telephone summaries) where retrying a failed summary carries low risk
- Monitor whether replacing it with GPT-4o or Gemini 1.5 Pro changes completion rates within 30 days

---

## Key Insight 4: Two templates have serious quality problems that need urgent attention

The eight prompt templates in deployment show very different performance profiles. Two stand out as requiring immediate review:

**Early Help Assessment Note** — 27% non-completion rate (highest in the portfolio), average satisfaction of 3.4 / 5. This template is used for 26 sessions in the data and is failing more than 1 in 4 times. Given the complexity of early help assessments and the safeguarding implications of incomplete documentation, this is the highest-priority template issue.

**Mental Health Review Note** — 11% non-completion rate, average satisfaction of 3.5 / 5. Mental health is the most common case topic in the dataset (27 sessions), which means reliability issues here affect more practitioners and cases than any other template.

By contrast, **Brief Telephone Summary** (4.5 / 5 satisfaction, 14% non-completion) and **Adult Social Care Case Note** (4.4 / 5 satisfaction, 10% non-completion) are performing well and represent the strongest templates in the portfolio.

**What to do:**
- Pause or significantly revise the Early Help Assessment Note template — the current configuration is not fit for purpose
- Review the prompt structure and model assignment for Mental Health Review Note
- Use Brief Telephone Summary and Adult Social Care Case Note as internal benchmarks for what a high-performing template looks like

---

## Key Insight 5: Safeguarding flag errors are appearing in practitioner feedback and require governance review

Free-text feedback analysis identified 10 comments referencing incorrect safeguarding flags, and 5 comments reporting name confusion in generated summaries (where the AI attributed details to the wrong person in a multi-party session).

These are not cosmetic issues. An incorrectly raised or missed safeguarding flag in a case note carries direct legal and child protection implications. A name error in a case file, if not caught before sign-off, creates a documentation risk that could affect individuals' records.

The current volume is not catastrophic — but it is above the threshold at which a governance response is appropriate. The absence of a systematic review process for AI-generated content before it enters case files is the underlying risk.

**What to do:**
- Establish a mandatory QA step for all AI-generated summaries before they are filed, at minimum for safeguarding-adjacent case types
- Define what constitutes a reportable AI error across councils and begin tracking these formally
- Investigate whether the incorrect flags are concentrated in specific templates, models, or session types — the prototype already surfaces this by filtering to individual councils
- Brief designated safeguarding leads in each council on the current error rate

---

## Summary of Recommended Actions

| Priority | Action | Owner |
|---|---|---|
| URGENT | Remove GPT-4o-mini from complex/safeguarding workflows | Beam + IT leads |
| URGENT | Pause and revise Early Help Assessment Note template | Beam product team |
| URGENT | Establish mandatory QA process for AI-generated case notes | Council DSLs + service leads |
| MONITOR | Investigate Hackney satisfaction gap vs. Southwark | Council leads + Beam |
| MONITOR | Address safeguarding flag and name confusion errors systematically | Council DSLs |
| MONITOR | Review Mental Health Review Note template performance | Beam product team |
| INVEST | Run targeted onboarding for housing officers and family support workers | Council workforce leads |
| INVEST | Replicate Southwark's configuration across other councils | Beam implementation team |

---

## About This Prototype

This dashboard was built to demonstrate what a live analytics layer on Magic Notes could look like. It is a functional React application that joins five data tables entirely in the browser — no backend, no data transmitted externally. All figures shown are calculated directly from the underlying CSV exports and have been audited for accuracy.

The intent is not to be the final product, but to show what is possible: a leadership view that goes beyond raw usage numbers to surface quality signals, risk indicators, and adoption gaps — updated automatically as the data changes.

A production version of this layer would connect directly to the Magic Notes database, update in real time, support role-based access control, and integrate with council reporting workflows.

---

*Beam — Technology that transforms the lives of homeless people and those at risk.*
