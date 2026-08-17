// Deterministic, rule-based guideline recommendations. Kept separate from
// the (LLM-assisted) data-extraction path on purpose: treatment guidance is
// generated from fixed, auditable rules referencing the cited AHA/ACC
// guidelines rather than free-form model output.
//
// References:
// - 2026 ACC/AHA/AACVPR/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the
//   Management of Dyslipidemia (Circulation. 2026; DOI 10.1161/CIR.0000000000001423),
//   which replaces and supersedes the 2018 AHA/ACC/Multi-Society Blood
//   Cholesterol Guideline. Lipid recommendations in this tool are based on
//   the 2026 guideline only.
// - 2017 ACC/AHA/... Guideline for the Prevention, Detection, Evaluation,
//   and Management of High Blood Pressure in Adults (Hypertension.
//   2018;71:e13-e115), with reference to the 2025 AHA/ACC blood-pressure
//   risk-assessment scientific statement.
// - 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure
//   (Circulation. 2022;145:e895-e1032).
// - 2023 AHA Presidential Advisory / Scientific Statement on
//   Cardiovascular-Kidney-Metabolic (CKM) Health (Circulation.
//   2023;148:1606-1635 and 148:1982-2004).
//
// This tool is decision SUPPORT only — it does not replace clinical
// judgment. Always verify against current primary sources.

import { riskCategory10yrASCVD } from "./prevent.js";

function pct(fraction) {
  return fraction == null ? null : Math.round(fraction * 1000) / 10;
}

export function bpCategory(sbp, dbp) {
  if (sbp == null) return null;
  const d = dbp ?? 0;
  if (sbp >= 140 || d >= 90) return "Stage 2 hypertension";
  if (sbp >= 130 || d >= 80) return "Stage 1 hypertension";
  if (sbp >= 120) return "Elevated blood pressure";
  return "Normal blood pressure";
}

function lipidRecommendation(inputs, ascvd10Pct, ascvd30Pct) {
  const { age, diabetes, knownCvd, ldl, smoker, sbp, dbp, statin } = inputs;
  const bullets = [];
  let riskGroup = null;
  const category = bpCategory(sbp, dbp);
  const hypertensive = category === "Stage 1 hypertension" || category === "Stage 2 hypertension";

  if (knownCvd) {
    // The guideline's full "very high risk" definition also weighs event
    // recency/count, heart failure history, and revascularization history,
    // none of which this tool collects — so this is an approximation from
    // the proxies available (age >65, diabetes, current smoking,
    // hypertension, LDL-C >100 mg/dL despite statin), not a substitute for
    // chart review against the exact criteria.
    const highRiskConditionCount = [
      age != null && age > 65,
      diabetes,
      smoker,
      hypertensive,
      statin && ldl != null && ldl > 100
    ].filter(Boolean).length;
    const veryHighRisk = highRiskConditionCount >= 2;

    riskGroup = veryHighRisk ? "Secondary prevention — very high risk" : "Secondary prevention — ASCVD, not very high risk";
    bullets.push(
      "High-intensity statin recommended for all patients with established ASCVD, regardless of baseline LDL-C (Class I)."
    );
    if (veryHighRisk) {
      bullets.push(
        `LDL-C goal <55 mg/dL and non-HDL-C goal <85 mg/dL (approximated as "very high risk" from ${highRiskConditionCount} proxy features in the data provided — confirm against the full criteria: multiple major ASCVD events, or one major event plus ≥2 of age >65, recent coronary revascularization, current smoking, diabetes, heart failure history, hypertension, or LDL-C >100 mg/dL despite maximally tolerated statin + ezetimibe).`
      );
    } else {
      bullets.push("LDL-C goal <70 mg/dL.");
    }
    bullets.push(
      "If LDL-C/non-HDL-C remain above goal on maximally tolerated statin, add ezetimibe; if still above goal, add a PCSK9 inhibitor."
    );
  } else if (ldl != null && ldl >= 160) {
    riskGroup = "LDL-C ≥160 mg/dL";
    bullets.push(
      "Statin therapy recommended regardless of calculated ASCVD risk, to limit cumulative lifetime exposure to atherogenic lipoproteins — the 2026 guideline lowered this unconditional-treatment threshold from the prior 190 mg/dL to 160 mg/dL."
    );
    bullets.push(
      "Consider evaluation for familial hypercholesterolemia, especially with family history of premature ASCVD or LDL-C persistently ≥190 mg/dL."
    );
  } else if (diabetes && age != null && age >= 40 && age <= 75) {
    riskGroup = "Diabetes, age 40-75 (primary prevention)";
    bullets.push("LDL-lowering therapy (statin) recommended regardless of LDL-C level or calculated risk (Class I).");
    bullets.push("Favor a high-intensity statin at the higher end of the risk range or with additional ASCVD risk factors present.");
  } else if (diabetes && age != null && age >= 30 && age < 40) {
    riskGroup = "Diabetes, age 30-39 (primary prevention)";
    const qualifies = (ascvd10Pct != null && ascvd10Pct >= 3) || (ascvd30Pct != null && ascvd30Pct >= 10);
    if (qualifies) {
      bullets.push(
        `Statin therapy should be considered: 10-year PREVENT-ASCVD risk ${ascvd10Pct ?? "—"}% and/or 30-year risk ${ascvd30Pct ?? "—"}% meets the guideline's threshold for younger adults with diabetes (10-yr ≥3% or 30-yr ≥10%).`
      );
    } else {
      bullets.push(
        `10-year PREVENT-ASCVD risk (${ascvd10Pct ?? "—"}%) and 30-year risk (${ascvd30Pct ?? "—"}%) are both below the threshold that triggers statin consideration in adults with diabetes under 40 (10-yr ≥3% or 30-yr ≥10%); reassess periodically.`
      );
    }
  } else if (age != null && age >= 30 && age <= 79) {
    const cat = ascvd10Pct == null ? null : riskCategory10yrASCVD(ascvd10Pct / 100);
    if (cat == null) {
      riskGroup = "Primary prevention — risk not yet calculated";
    } else if (cat === "low") {
      riskGroup = `Low risk (10-yr PREVENT-ASCVD ${ascvd10Pct}%)`;
      bullets.push("Statin not indicated on risk grounds alone; emphasize heart-healthy lifestyle.");
      if (ascvd30Pct != null) {
        bullets.push(
          `30-year PREVENT-ASCVD risk is ${ascvd30Pct}% — informative for a lifetime-risk discussion, but not itself a treatment trigger outside of diabetes or other qualifying conditions.`
        );
      }
    } else if (cat === "borderline") {
      riskGroup = `Borderline risk (10-yr PREVENT-ASCVD ${ascvd10Pct}%)`;
      bullets.push(
        "LDL-lowering therapy may be considered after a clinician-patient discussion, informed by risk-enhancing factors (family history of premature ASCVD, persistently elevated LDL-C, metabolic syndrome, CKD, chronic inflammatory disease [e.g. rheumatoid arthritis, lupus, psoriasis, HIV], reproductive risk markers [early menopause, preeclampsia, gestational diabetes, preterm delivery], elevated Lp(a)) and/or coronary artery calcium (CAC) scoring (Class IIa)."
      );
    } else if (cat === "intermediate") {
      riskGroup = `Intermediate risk (10-yr PREVENT-ASCVD ${ascvd10Pct}%)`;
      bullets.push("LDL-lowering therapy with at least a moderate-intensity statin should be considered after a clinician-patient discussion.");
      bullets.push(
        "Coronary artery calcium (CAC) scoring (now a Class I option for borderline/uncertain cases) can refine the decision; a CAC score of 0 can support deferring statin therapy if no other risk-enhancing conditions are present."
      );
    } else {
      riskGroup = `High risk (10-yr PREVENT-ASCVD ${ascvd10Pct}%)`;
      bullets.push("LDL-lowering therapy recommended; favor a high-intensity statin at the higher end of this risk range.");
    }
  } else {
    riskGroup = "Outside the 30-79y PREVENT-ASCVD range";
    bullets.push(
      "The PREVENT-ASCVD equations (and the risk categories above) are validated for ages 30-79; base decisions outside that range on overall clinical assessment, LDL-C level, and risk-enhancing factors."
    );
  }

  bullets.push(
    "Lipoprotein(a) should be measured at least once in all adults to refine risk assessment: levels ≥125 nmol/L (≈50 mg/dL) function as a risk-enhancing factor, and ≥250 nmol/L (≈100 mg/dL) confer roughly double the estimated risk."
  );

  return {
    title: "Lipid management",
    guideline: "2026 ACC/AHA/Multi-Society Guideline on the Management of Dyslipidemia",
    riskGroup,
    bullets
  };
}

function bpRecommendation(inputs, ascvd10Pct) {
  const { sbp, dbp, age, diabetes, knownCvd, egfr } = inputs;
  const category = bpCategory(sbp, dbp);
  const bullets = [];
  const ckd = egfr != null && egfr < 60;

  if (category === "Normal blood pressure") {
    bullets.push("Reassess annually; reinforce heart-healthy lifestyle.");
  } else if (category === "Elevated blood pressure") {
    bullets.push("Lifestyle modification only (weight loss, DASH-pattern diet, sodium restriction, exercise, alcohol moderation); reassess in 3-6 months.");
  } else if (category === "Stage 1 hypertension") {
    const highRiskFeature =
      knownCvd || diabetes || ckd || (age != null && age >= 65) || (ascvd10Pct != null && ascvd10Pct >= 10);
    if (highRiskFeature) {
      bullets.push(
        "Pharmacologic therapy recommended (Class I) because of a compensating high-risk feature: " +
          [
            knownCvd && "known ASCVD",
            diabetes && "diabetes",
            ckd && "reduced eGFR",
            age != null && age >= 65 && "age ≥65",
            ascvd10Pct != null && ascvd10Pct >= 10 && `10-yr ASCVD risk ${ascvd10Pct}%`
          ]
            .filter(Boolean)
            .join(", ") +
          "."
      );
    } else {
      bullets.push("Lifestyle modification first; reassess in 3-6 months. Start medication if BP remains ≥130/80 despite lifestyle changes.");
    }
  } else if (category === "Stage 2 hypertension") {
    bullets.push("Pharmacologic therapy recommended for all patients (Class I), typically starting with 2 first-line agents of different classes (e.g. ACEi/ARB + thiazide or CCB) if BP is >20/10 mmHg above goal.");
  }

  if (category && category !== "Normal blood pressure") {
    bullets.push("Blood pressure goal: <130/80 mmHg for most adults with confirmed hypertension.");
  }

  return {
    title: "Blood pressure management",
    guideline: "2017 ACC/AHA Hypertension Guideline (with reference to the 2025 AHA/ACC BP risk-assessment update)",
    riskGroup: category,
    bullets
  };
}

function heartFailureRecommendation(inputs, hf10Pct) {
  const { diabetes, knownCvd, sbp, dbp } = inputs;
  const bullets = [];
  const bpNotAtGoal = sbp != null && (sbp >= 130 || (dbp != null && dbp >= 80));

  const stageA =
    diabetes || knownCvd || bpCategory(sbp, dbp) !== "Normal blood pressure" || (hf10Pct != null && hf10Pct >= 5);

  bullets.push(
    "Control blood pressure to <130/80 mmHg — the single highest-yield intervention for primary HF prevention (Class I)."
  );

  if (diabetes) {
    bullets.push(
      "In patients with type 2 diabetes and either established CVD or high cardiovascular risk, an SGLT2 inhibitor is recommended to prevent HF hospitalization (Class I), independent of glycemic control."
    );
  }

  bullets.push("Statin therapy per the lipid recommendations above, healthy-weight and activity counseling, and avoidance of cardiotoxic exposures (e.g. anthracyclines, excess alcohol) where applicable.");

  if (hf10Pct != null && hf10Pct >= 5) {
    bullets.push(
      `Predicted 10-year HF risk is ${hf10Pct}% — the 2022 guideline supports natriuretic peptide (BNP/NT-proBNP) screening in at-risk patients, with echocardiography and cardiology referral if elevated, to detect pre-clinical (Stage B) disease early (Class I).`
    );
  }

  return {
    title: "Heart failure prevention",
    guideline: "2022 AHA/ACC/HFSA Heart Failure Guideline",
    riskGroup: stageA ? "At-risk for heart failure (Stage A)" : "No Stage A risk factors identified from inputs provided",
    bullets,
    note: "This tool cannot assess for structural heart disease (Stage B) or symptoms (Stage C/D) — echocardiography and clinical evaluation are required for full HF staging."
  };
}

function ckmStage(inputs) {
  const { bmi, waist, diabetes, hba1c, sbp, dbp, triglycerides, egfr, uacr, knownCvd, ascvd10Pct } = inputs;

  const excessAdiposity = (bmi != null && bmi >= 25) || (waist != null && waist >= 88);
  const prediabetes = hba1c != null && hba1c >= 5.7 && hba1c < 6.5;
  const hypertension = bpCategory(sbp, dbp) === "Stage 1 hypertension" || bpCategory(sbp, dbp) === "Stage 2 hypertension";
  const hypertriglyceridemia = triglycerides != null && triglycerides >= 135;
  const ckd = (egfr != null && egfr < 60) || (uacr != null && uacr >= 30);
  const highRiskCkd = (egfr != null && egfr < 45) || (uacr != null && uacr >= 300);
  const metabolicRiskFactor = diabetes || hypertension || hypertriglyceridemia || ckd;
  const subclinicalHighRisk = ascvd10Pct != null && ascvd10Pct >= 7.5;

  if (knownCvd) {
    return {
      stage: (egfr != null && egfr < 15) ? "Stage 4b" : "Stage 4a",
      label: "Clinical cardiovascular disease with CKM risk factors" + (egfr != null && egfr < 15 ? " and kidney failure" : "")
    };
  }
  if (metabolicRiskFactor && (subclinicalHighRisk || highRiskCkd)) {
    return { stage: "Stage 3", label: "CKM risk factors with high predicted CVD risk and/or high-risk CKD (subclinical CVD)" };
  }
  if (metabolicRiskFactor) {
    return { stage: "Stage 2", label: "Metabolic risk factors and/or moderate-risk CKD present" };
  }
  if (excessAdiposity || prediabetes) {
    return { stage: "Stage 1", label: "Excess/dysfunctional adiposity and/or prediabetes, no other metabolic risk factors" };
  }
  return { stage: "Stage 0", label: "No CKM risk factors identified from inputs provided" };
}

function ckmRecommendation(inputs) {
  const { stage, label } = ckmStage(inputs);
  const bullets = [];

  switch (stage) {
    case "Stage 0":
      bullets.push("Reinforce healthy lifestyle (diet quality, physical activity, sleep, avoidance of tobacco); routine CVD risk screening every 4-6 years.");
      break;
    case "Stage 1":
      bullets.push("Structured lifestyle intervention targeting ≥5% weight loss if BMI ≥25 kg/m²; consider referral to intensive lifestyle/behavioral program.");
      bullets.push("Reassess glycemic status and CVD risk factors annually.");
      break;
    case "Stage 2":
      bullets.push("Treat each metabolic risk factor present (BP, lipids, glycemia) to guideline targets — see the lipid, BP, and HF sections above.");
      bullets.push("In patients with obesity and diabetes and/or CKD, consider GLP-1 receptor agonist and/or SGLT2 inhibitor therapy for combined cardio-kidney-metabolic benefit, per guideline-directed indications.");
      bullets.push("If CKD present, refer to nephrology-oriented management (ACEi/ARB, SGLT2 inhibitor, BP <130/80).");
      break;
    case "Stage 3":
      bullets.push("Intensify risk-factor control using the calculated PREVENT risk to guide statin/BP/glycemic therapy intensity (see sections above).");
      bullets.push("Consider CAC scoring or other subclinical-atherosclerosis imaging to refine risk if not already obtained; cardiology referral is reasonable.");
      break;
    case "Stage 4a":
    case "Stage 4b":
      bullets.push("Secondary-prevention-level management across all domains (see high-intensity lipid, BP, and HF recommendations above).");
      if (stage === "Stage 4b") bullets.push("Coordinate with nephrology given kidney failure; kidney-related therapy decisions take priority alongside cardiovascular GDMT.");
      break;
  }

  return {
    title: "Cardiovascular-Kidney-Metabolic (CKM) health staging",
    guideline: "2023 AHA CKM Health Presidential Advisory / Scientific Statement",
    riskGroup: `${stage} — ${label}`,
    bullets,
    note: "Staging here is approximated from the labs/vitals provided and does not include echocardiographic, natriuretic peptide, or full urinalysis data used in the complete AHA CKM staging algorithm."
  };
}

/**
 * @param {object} inputs - the same clinical inputs used for computePreventRisk,
 *   plus optional: ldl, triglycerides, hba1c, waist, uacr, knownCvd, dbp
 * @param {object} riskResults - output of computePreventRisk().risks
 */
export function generateRecommendations(inputs, riskResults) {
  const ascvd10Pct = pct(riskResults?.ascvd?.[10]);
  const ascvd30Pct = pct(riskResults?.ascvd?.[30]);
  const hf10Pct = pct(riskResults?.hf?.[10]);

  return {
    lipid: lipidRecommendation(inputs, ascvd10Pct, ascvd30Pct),
    bp: bpRecommendation(inputs, ascvd10Pct),
    heartFailure: heartFailureRecommendation(inputs, hf10Pct),
    ckm: ckmRecommendation({ ...inputs, ascvd10Pct })
  };
}
