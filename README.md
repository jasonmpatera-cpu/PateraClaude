# PREVENT Risk Suite

A personal clinical tool that:

1. Takes a **photo of a lab report** and/or **free-text / dictated notes** (in any order, any format), and uses Claude to extract structured patient data.
2. Calculates **10- and 30-year risk of total CVD, ASCVD, and heart failure** using the **AHA PREVENT equations** (Khan et al., *Circulation* 2024), the same model used by the [official AHA PREVENT calculator](https://professional.heart.org/en/guidelines-and-statements/prevent-calculator). Automatically upgrades to the HbA1c- and/or urine-ACR-enhanced equations when those labs are available, matching the official tool's behavior.
3. Generates **guideline-based treatment recommendations** from the calculated risk and inputs: 2018 AHA/ACC lipid guideline, 2017/2025 AHA/ACC hypertension guideline, 2022 AHA/ACC/HFSA heart failure guideline, and the 2023 AHA Cardiovascular-Kidney-Metabolic (CKM) health staging.

Unless a field is explicitly stated otherwise (in the image or the dictated text), the tool assumes **no diabetes, no antihypertensive medication, and no statin** — per the default assumption requested for this tool.

⚠️ **For clinical decision support only.** This is not a medical device and has not been validated for clinical use. Always verify extracted data and recommendations independently.

## How it's built

- **Calculation engine** (`client/src/lib/prevent.js`, `preventCoefficients.js`) — pure, deterministic JavaScript. Coefficients were pulled directly from the peer-reviewed reference implementation [`bcjaeger/PooledCohort`](https://github.com/bcjaeger/PooledCohort) (`equation_version = "Khan_2023"`), which is validated against the official AHA calculator. The engine was checked against 22 of that package's own published test cases (all outcomes, both sexes, base/HbA1c/ACR/full model tiers, 10- and 30-year horizons, including edge cases) and matches to the published precision.
- **Guideline recommendations** (`client/src/lib/guidelines.js`) — deterministic rule engine, not LLM-generated, so the treatment logic is fixed and auditable.
- **Data extraction** (`server/routes/extract.js`) — the only part that calls an LLM (Claude). It reads the image and/or prose text and returns structured JSON via forced tool-use; nothing about the risk math or recommendations depends on it. Always review the extracted values before calculating.
- **Voice dictation** uses the browser's built-in Web Speech API (Chrome/Edge) — no server round-trip, no extra cost.

## Setup

Requires Node 18+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
npm run install:all

cp server/.env.example server/.env
# edit server/.env and paste your ANTHROPIC_API_KEY

npm run dev
```

This starts the API server on `http://localhost:8787` and the web app on `http://localhost:5173` (open this one in your browser). The dev server proxies `/api/*` requests to the backend.

## Production build

```bash
npm run build     # builds client/dist
npm start         # serves the API only — see note below
```

`npm start` runs the Express API server. To serve the built frontend from the same server, either deploy `client/dist` to a static host (Vercel, Netlify, GitHub Pages, etc.) pointed at your API's URL, or add `express.static` for `client/dist` in `server/index.js` if you want a single deployable process.

## Project structure

```
server/
  index.js               Express app
  routes/extract.js       POST /api/extract — Claude vision + tool-use extraction
  lib/extractionSchema.js Structured-output schema/prompt for extraction
client/
  src/lib/prevent.js              PREVENT risk calculation engine
  src/lib/preventCoefficients.js  AHA PREVENT model coefficients (base/HbA1c/ACR/full, 10y/30y)
  src/lib/guidelines.js           Guideline-based recommendation rules
  src/lib/formMapping.js          Form <-> extraction-result <-> calculator-input mapping
  src/components/                 UI components (image upload, dictation, form, results)
```

## Guideline sources

- 2018 AHA/ACC/Multi-Society Guideline on the Management of Blood Cholesterol (*Circulation*. 2019;139:e1082-e1143)
- 2017 ACC/AHA/... Guideline for Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults (*Hypertension*. 2018;71:e13-e115), referencing the 2025 AHA/ACC blood-pressure risk-assessment scientific statement
- 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure (*Circulation*. 2022;145:e895-e1032)
- 2023 AHA Scientific Statement / Presidential Advisory on Cardiovascular-Kidney-Metabolic (CKM) Health (*Circulation*. 2023;148:1606-1635 and 148:1982-2004)

Numeric ASCVD risk thresholds (5% / 7.5% / 20%) used for statin and BP treatment decisions originate from the older Pooled Cohort Equations. PREVENT tends to produce lower absolute risk estimates for the same patient, and AHA/ACC have not yet published a final, formally recalibrated set of PREVENT-specific treatment thresholds — the app surfaces this caveat directly in its recommendations.
