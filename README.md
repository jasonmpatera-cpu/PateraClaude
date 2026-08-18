# PREVENT Risk Suite

A personal clinical tool that:

1. Takes a **photo of a lab report** and/or **free-text / dictated notes** (in any order, any format) and parses them into structured patient data — **entirely in your browser, for free**. No server, no API key, no per-use cost.
2. Calculates **10- and 30-year risk of total CVD, ASCVD, and heart failure** using the **AHA PREVENT equations** (Khan et al., *Circulation* 2024), the same model used by the [official AHA PREVENT calculator](https://professional.heart.org/en/guidelines-and-statements/prevent-calculator). Automatically upgrades to the HbA1c- and/or urine-ACR-enhanced equations when those labs are available, matching the official tool's behavior.
3. Generates **guideline-based treatment recommendations** across eight domains: lipids (2026 dyslipidemia guideline), blood pressure (2017/2025), aspirin for ASCVD prevention (2022 USPSTF), diabetes management (2026 ADA Standards of Care), CKD staging (KDIGO 2024), heart failure (2022 AHA/ACC/HFSA), CHA₂DS₂-VASc stroke-risk scoring (shown only if atrial fibrillation is checked), and CKM health staging (2023 AHA).
4. Built for quick use in a clinic visit: a **New patient / Clear** button resets everything between patients (nothing persists across patients — see *Privacy* below), and a **Copy summary for chart note** / **Print summary** pair turns the results into something you can paste into a note or hand to a patient.

Unless a field is explicitly stated otherwise (in the image or the dictated text), the tool assumes **no diabetes, no antihypertensive medication, and no statin** — per the default assumption requested for this tool.

⚠️ **For clinical decision support only.** This is not a medical device and has not been validated for clinical use. Always verify extracted data and recommendations independently.

## Why no AI / API key

An earlier version of this tool called the Claude API to read the lab photo and parse dictated notes. That costs money per use and requires an Anthropic API key. Since this is built for personal, one-user use, extraction is now done **entirely with local pattern matching and in-browser OCR** — zero marginal cost, works offline after the first load, and nothing about the patient data ever leaves your machine. The tradeoff: it's less flexible than an LLM about messy handwriting, unusual report layouts, or phrasing it hasn't seen — which is exactly why the app always makes you review and confirm every field before calculating anything.

## How it's built

- **Calculation engine** (`client/src/lib/prevent.js`, `preventCoefficients.js`) — pure, deterministic JavaScript. Coefficients were pulled directly from the peer-reviewed reference implementation [`bcjaeger/PooledCohort`](https://github.com/bcjaeger/PooledCohort) (`equation_version = "Khan_2023"`), which is validated against the official AHA calculator. The engine was checked against the package's own published test cases (all outcomes, both sexes, base/HbA1c/ACR/full model tiers, 10- and 30-year horizons, including edge cases) and matches to the published precision.
- **Guideline recommendations** (`client/src/lib/guidelines.js`) — deterministic rule engine referencing the cited guidelines directly; not LLM-generated, so the treatment logic is fixed and auditable.
- **Text parsing** (`client/src/lib/textParser.js`) — a local, regex/keyword-based parser tuned for common lab abbreviations, units (including mmol/L and µmol/L conversion), and dictation phrasing (including negation, e.g. "no diabetes," "former smoker"). Runs synchronously, no network calls.
- **Photo OCR** (`client/src/lib/ocr.js`) — [Tesseract.js](https://github.com/naptha/tesseract.js), a WebAssembly OCR engine that runs fully in the browser. The recognized text is fed through the same parser used for dictated notes. The first OCR run in a browser session downloads the English language model (a few MB, from Tesseract.js's default CDN) and the browser caches it after that.
- **Voice dictation** (`client/src/components/ProseInput.jsx`) uses the browser's built-in Web Speech API (Chrome/Edge) — also free, also no server round-trip.

## What the parser can and can't do

It looks for labeled values (`"TC 210"`, `"total cholesterol 210"`, `"HDL: 45 mg/dL"`, `"A1c 7.2%"`, `"BP 148/92"`, `"5'10\", 210 lbs"`, etc.), common drug names (statins, antihypertensives, diabetes medications) to infer therapy status, and negation phrasing ("no diabetes," "denies smoking," "former smoker," "not on any statin"). It handles input in any order and mixed shorthand/prose.

It will **not** reliably handle: handwritten notes photographed poorly, lab report layouts where the value is in a table column far from its label, or phrasing/abbreviations it hasn't been taught. When a field isn't found, it's simply left blank in the form for you to fill in — nothing is guessed.

## Setup

Requires Node 18+.

```bash
npm run install:all
npm run dev
```

Open `http://localhost:5173`. That's it — no environment variables, no accounts.

## Production build

```bash
npm run build     # builds client/dist — a static site, deployable anywhere
npm run preview   # serve the production build locally to sanity-check it
```

Since everything runs client-side, `client/dist` can be hosted on any static host (GitHub Pages, Netlify, Vercel, or just opened locally) with no backend at all.

## Project structure

```
client/
  src/lib/prevent.js              PREVENT risk calculation engine
  src/lib/preventCoefficients.js  AHA PREVENT model coefficients (base/HbA1c/ACR/full, 10y/30y)
  src/lib/guidelines.js           Guideline-based recommendation rules (all 8 sections)
  src/lib/textParser.js           Local regex/keyword parser for dictated notes and OCR text
  src/lib/ocr.js                  In-browser OCR (Tesseract.js) for lab-report photos
  src/lib/formMapping.js          Form <-> parsed-data <-> calculator-input mapping
  src/lib/summary.js              Plain-text chart-note summary generator (copy/print)
  src/components/                 UI components (image upload, dictation, form, results)
```

## Guideline sources

- 2026 ACC/AHA/AACVPR/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Dyslipidemia (*Circulation*. 2026; DOI 10.1161/CIR.0000000000001423) — replaces the 2018 AHA/ACC/Multi-Society Blood Cholesterol Guideline, which this tool no longer references
- 2017 ACC/AHA/... Guideline for Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults (*Hypertension*. 2018;71:e13-e115), referencing the 2025 AHA/ACC blood-pressure risk-assessment scientific statement
- 2022 USPSTF Recommendation Statement: Aspirin Use to Prevent Cardiovascular Disease
- 2026 ADA Standards of Care in Diabetes
- KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease
- 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure (*Circulation*. 2022;145:e895-e1032)
- 2019 AHA/ACC/HRS Guideline for the Management of Patients With Atrial Fibrillation (CHA₂DS₂-VASc scoring/thresholds)
- 2023 AHA Scientific Statement / Presidential Advisory on Cardiovascular-Kidney-Metabolic (CKM) Health (*Circulation*. 2023;148:1606-1635 and 148:1982-2004)

The lipid risk categories (10-year PREVENT-ASCVD <3% / 3-<5% / 5-<10% / ≥10%) and treatment thresholds come directly from the 2026 dyslipidemia guideline, which was written natively around PREVENT rather than the older Pooled Cohort Equations. The blood-pressure section's ASCVD-risk-based treatment trigger, by contrast, still traces to the 2017 hypertension guideline's original (Pooled-Cohort-pegged) threshold pending a fully PREVENT-native update — the app notes this where relevant.

The "very high risk" secondary-prevention lipid tier uses the guideline's actual criteria (≥2 major ASCVD events, or 1 major event plus ≥2 high-risk conditions) computed directly from the history checkboxes in the form — nothing is inferred or guessed.

## Privacy between patients

This is a browser-only app with no backend and no `localStorage`/`sessionStorage` persistence of patient data — nothing survives a page reload on its own. On a **shared clinic device**, always click **New patient / Clear** before walking away or moving to the next patient; it resets every field and result. Deliberately, the app does *not* remember the last patient's data across visits — for a multi-patient workflow, silently carrying over the previous patient's inputs would be a real safety hazard, not a convenience.
