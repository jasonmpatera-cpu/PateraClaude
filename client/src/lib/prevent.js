// AHA PREVENT (Predicting Risk of cardiovascular disease EVENTs) equations.
// Source: Khan SS, et al. "Development and Validation of the American Heart
// Association's PREVENT Equations." Circulation. 2024;149:430-449.
// Coefficient values verified against the peer-reviewed reference
// implementation bcjaeger/PooledCohort (equation_version "Khan_2023"), which
// itself is validated against the official AHA PREVENT online calculator.
//
// The model automatically upgrades from the "base" equations to the
// HbA1c-enhanced, UACR-enhanced, or "full" (HbA1c + UACR) equations whenever
// those optional labs are supplied, mirroring the behavior of the official
// calculator. Social Deprivation Index (ZIP-code based) is not collected by
// this app, so it is always treated as missing, exactly as the official
// calculator treats a patient whose ZIP is not entered.

import { PREVENT_COEFS } from "./preventCoefficients.js";

const MMOL_PER_MGDL = 0.02586;

export const PREVENT_AGE_RANGE = { min: 30, max: 79 };

export function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// 2021 CKD-EPI creatinine equation (race-free) — the same eGFR formula used
// to derive the PREVENT cohort's eGFR variable.
export function calculateEGFR(creatinineMgDl, ageYears, sex) {
  if (!creatinineMgDl || !ageYears || !sex) return null;
  const isFemale = sex === "female";
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const sexFactor = isFemale ? 1.012 : 1;
  const ratio = creatinineMgDl / kappa;
  return (
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, ageYears) *
    sexFactor
  );
}

function selectModelTier(hba1c, uacr) {
  const hasHba1c = hba1c != null && !Number.isNaN(hba1c);
  const hasUacr = uacr != null && !Number.isNaN(uacr) && uacr > 0;
  if (hasHba1c && hasUacr) return "full";
  if (hasUacr) return "acr";
  if (hasHba1c) return "hba1c";
  return "base";
}

function buildTerms(inputs, tier, outcomeKey) {
  const { age, sex, smoker, totalChol, hdl, sbp, bpMeds, statin, diabetes, bmi, egfr, hba1c, uacr } = inputs;

  const agePer10 = (age - 55) / 10;
  const nonHdlMmol = (totalChol - hdl) * MMOL_PER_MGDL - 3.5;
  const hdlPer03 = (hdl * MMOL_PER_MGDL - 1.3) / 0.3;
  const sbpLt110 = (Math.min(sbp, 110) - 110) / 20;
  const sbpGteq110 = (Math.max(sbp, 110) - 130) / 20;
  const dm = diabetes ? 1 : 0;
  const smoke = smoker ? 1 : 0;
  const bmiLt30 = (Math.min(bmi, 30) - 25) / 5;
  const bmiGt30 = (Math.max(bmi, 30) - 30) / 5;
  const egfrLt60 = (Math.min(egfr, 60) - 60) / -15;
  const egfrGteq60 = (Math.max(egfr, 60) - 90) / -15;
  const tx = bpMeds ? 1 : 0;
  const stat = statin ? 1 : 0;

  const terms = {
    coef_age_per_10_years: agePer10,
    coef_age_per_10_years_squared: agePer10 * agePer10,
    coef_non_hdl_c_per_1_mmol_l: nonHdlMmol,
    "coef_hdl_c_per_0.3_mmol_l": hdlPer03,
    coef_sbp_lt110_per_20_mmhg: sbpLt110,
    coef_sbp_gteq110_per_20_mmhg: sbpGteq110,
    coef_diabetes: dm,
    coef_current_smoking: smoke,
    coef_bmi_lt30_per_5_kg_m2: bmiLt30,
    coef_bmi_gt30_per_5_kg_m2: bmiGt30,
    coef_egfr_lt60_per_15_ml: egfrLt60,
    coef_egfr_gteq60_per_15_ml: egfrGteq60,
    coef_anti_hypertensive_use: tx,
    coef_statin_use: stat,
    coef_treated_sbp_gteq110_mm_hg_per_20_mm_hg: sbpGteq110 * tx,
    coef_treated_non_hdl_c: nonHdlMmol * stat,
    coef_age_per_10yr_x_non_hdl_c_per_1_mmol_l: agePer10 * nonHdlMmol,
    "coef_age_per_10yr_x_hdl_c_per_0.3_mml_l": agePer10 * hdlPer03,
    coef_age_per_10yr_x_sbp_gteq110_mm_hg_per_20_mmhg: agePer10 * sbpGteq110,
    coef_age_per_10yr_x_diabetes: agePer10 * dm,
    coef_age_per_10yr_x_current_smoking: agePer10 * smoke,
    coef_age_per_10yr_x_bmi_gteq30_per_5_kg_m2: agePer10 * bmiGt30,
    coef_age_per_10yr_x_egfr_lt60_per_15_ml: agePer10 * egfrLt60,
    coef_sdi_decile_between_4_and_6: 0,
    coef_sdi_decile_between_7_and_10: 0,
    coef_ln_acr: 0,
    "coef_hba1c_minus_5.3_x_diabetes": 0,
    "coef_hba1c_minus_5.3_x_1_minus_diabetes": 0,
    coef_miss_sdi: 0,
    coef_miss_ln_acr: 0,
    coef_miss_hba1c: 0
  };

  if (tier === "acr" || tier === "full") {
    terms.coef_ln_acr = Math.log(uacr);
  }

  if (tier === "hba1c" || tier === "full") {
    terms["coef_hba1c_minus_5.3_x_diabetes"] = (hba1c - 5.3) * dm;
    terms["coef_hba1c_minus_5.3_x_1_minus_diabetes"] = (hba1c - 5.3) * (1 - dm);
  }

  if (tier === "full") {
    // SDI (ZIP-based) is never collected by this app, so it is always
    // "missing." This replicates a documented quirk of the official AHA
    // PREVENT calculator: for the ASCVD outcome specifically, a
    // missing-SDI *female* patient is scored as if SDI were in the
    // (unobserved reference) decile rather than via the miss_sdi term,
    // while every other outcome/sex combination uses the miss_sdi term.
    const ascvdFemaleQuirk = outcomeKey === "ascvd" && inputs.sex === "female";
    terms.coef_miss_sdi = ascvdFemaleQuirk ? 0 : 1;
  }

  return terms;
}

function computeOneRisk(inputs, tier, outcomeKey, year) {
  const sheet = PREVENT_COEFS[`${tier}_${year}`];
  const col = `${inputs.sex === "female" ? "women" : "men"}_${outcomeKey}`;
  const terms = buildTerms(inputs, tier, outcomeKey);

  let sum = sheet.const[col];
  for (const [key, value] of Object.entries(terms)) {
    sum += sheet[key][col] * value;
  }

  return 1 / (1 + Math.exp(-sum));
}

const REQUIRED_FIELDS = [
  "age",
  "sex",
  "smoker",
  "totalChol",
  "hdl",
  "sbp",
  "bpMeds",
  "statin",
  "diabetes",
  "bmi",
  "egfr"
];

export function validateInputs(inputs) {
  const missing = REQUIRED_FIELDS.filter((f) => inputs[f] === null || inputs[f] === undefined || inputs[f] === "");
  return missing;
}

/**
 * Compute 10- and 30-year PREVENT risk for total CVD, ASCVD, and heart
 * failure.
 *
 * @param {object} inputs
 * @param {number} inputs.age - years, 30-79 for on-label use
 * @param {"female"|"male"} inputs.sex
 * @param {boolean} inputs.smoker - current smoker
 * @param {number} inputs.totalChol - mg/dL
 * @param {number} inputs.hdl - mg/dL
 * @param {number} inputs.sbp - mmHg
 * @param {boolean} inputs.bpMeds - on antihypertensive therapy
 * @param {boolean} inputs.statin - on statin therapy
 * @param {boolean} inputs.diabetes
 * @param {number} inputs.bmi - kg/m^2
 * @param {number} inputs.egfr - mL/min/1.73m^2
 * @param {number} [inputs.hba1c] - percent, optional enhancement
 * @param {number} [inputs.uacr] - mg/g, optional enhancement
 */
export function computePreventRisk(inputs) {
  const missing = validateInputs(inputs);
  if (missing.length > 0) {
    throw new Error(`Missing required field(s): ${missing.join(", ")}`);
  }

  const tier = selectModelTier(inputs.hba1c, inputs.uacr);
  const outcomes = ["cvd", "ascvd", "hf"];
  const years = [10, 30];

  const results = {};
  for (const outcome of outcomes) {
    results[outcome] = {};
    for (const year of years) {
      results[outcome][year] = computeOneRisk(inputs, tier, outcome, year);
    }
  }

  return { tier, risks: results };
}

// Risk categories per the 2026 ACC/AHA/Multi-Society Dyslipidemia
// Guideline, defined natively on 10-year PREVENT-ASCVD risk (this replaced
// the older Pooled-Cohort-Equation-pegged 5%/7.5%/20% cutpoints).
export function riskCategory10yrASCVD(riskFraction) {
  const pct = riskFraction * 100;
  if (pct < 3) return "low";
  if (pct < 5) return "borderline";
  if (pct < 10) return "intermediate";
  return "high";
}
