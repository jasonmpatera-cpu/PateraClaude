// Deterministic, rule-based guideline recommendations. Kept separate from
// the (LLM-assisted) data-extraction path on purpose: treatment guidance is
// generated from fixed, auditable rules referencing the cited AHA/ACC
// guidelines rather than free-form model output.
//
// References:
// - 2018 AHA/ACC/Multi-Society Guideline on the Management of Blood
//   Cholesterol (Circulation. 2019;139:e1082-e1143), as updated by the 2023
//   AHA PREVENT Scientific Statement's discussion of risk-based thresholds.
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
// judgment, and guideline thresholds (especially numeric ASCVD risk
// cutpoints originally pegged to the Pooled Cohort Equations) are still
// being formally recalibrated by AHA/ACC for use with PREVENT. Always
// verify against current primary sources.

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

function lipidRecommendation(inputs, ascvd10Pct) {
  const { age, diabetes, knownCvd, ldl } = inputs;
  const bullets = [];
  let riskGroup = null;

  if (knownCvd) {
    riskGroup = "Secondary prevention (established ASCVD)";
    bullets.push(
      "High-intensity statin recommended for all patients with established ASCVD, regardless of baseline LDL-C (Class I)."
    );
    bullets.push(
      "LDL-C goal <70 mg/dL (consider <55 mg/dL if very high-risk features, e.g. multiple major ASCVD events or one major event plus multiple high-risk conditions)."
    );
    bullets.push(
      "If LDL-C remains ≥70 mg/dL on maximally tolerated statin, add ezetimibe; if still not at goal (especially very-high-risk), add a PCSK9 inhibitor."
    );
  } else if (ldl != null && ldl >= 190) {
    riskGroup = "Severe hypercholesterolemia (LDL-C ≥190 mg/dL)";
    bullets.push(
      "High-intensity statin recommended regardless of calculated 10-year risk (Class I)."
    );
    bullets.push(
      "Consider evaluation for familial hypercholesterolemia if LDL-C persistently ≥190 mg/dL, especially with family history of premature ASCVD or very high LDL-C."
    );
    bullets.push("Add ezetimibe ± PCSK9 inhibitor if LDL-C reduction <50% or LDL-C remains ≥100 mg/dL on statin.");
  } else if (diabetes && age >= 40 && age <= 75) {
    riskGroup = "Diabetes, age 40-75 (primary prevention)";
    bullets.push("Moderate-intensity statin recommended at minimum (Class I).");
    bullets.push(
      "Consider high-intensity statin (or adding ezetimibe) if multiple ASCVD risk factors are present or 10-year ASCVD risk is ≥20% (Class IIa)."
    );
  } else if (age != null && age >= 40 && age <= 75) {
    if (ascvd10Pct == null) {
      riskGroup = "Primary prevention — risk not yet calculated";
    } else if (ascvd10Pct < 5) {
      riskGroup = `Low risk (10-yr ASCVD ${ascvd10Pct}%)`;
      bullets.push("Emphasize heart-healthy lifestyle; statin not routinely indicated.");
    } else if (ascvd10Pct < 7.5) {
      riskGroup = `Borderline risk (10-yr ASCVD ${ascvd10Pct}%)`;
      bullets.push(
        "Statin not routinely indicated; use risk-enhancing factors (family history of premature ASCVD, persistently elevated LDL-C ≥160 mg/dL, metabolic syndrome, CKD, chronic inflammatory disease, elevated Lp(a) or hsCRP, ABI <0.9) to inform shared decision-making (Class IIb)."
      );
    } else if (ascvd10Pct < 20) {
      riskGroup = `Intermediate risk (10-yr ASCVD ${ascvd10Pct}%)`;
      bullets.push("Moderate-intensity statin is reasonable (Class IIa).");
      bullets.push("Risk-enhancing factors or a coronary artery calcium (CAC) score can refine the decision if it remains uncertain.");
    } else {
      riskGroup = `High risk (10-yr ASCVD ${ascvd10Pct}%)`;
      bullets.push("Statin therapy recommended (Class I); target ≥50% LDL-C reduction, favoring high-intensity statin.");
    }
  } else {
    riskGroup = "Outside the 40-75y primary-prevention risk-calculator range";
    bullets.push(
      "PREVENT/pooled-cohort-style risk calculators are validated for ages 30-79; statin decisions below 40 or above 75 should rely more heavily on overall clinical assessment, risk-enhancing factors, and (when age-appropriate) CAC scoring."
    );
  }

  bullets.push(
    "Caveat: the 5% / 7.5% / 20% ASCVD risk thresholds above originate from the Pooled Cohort Equations. PREVENT tends to estimate lower risk for the same patient, and AHA/ACC have not yet issued a final, formally recalibrated set of treatment thresholds specific to PREVENT — apply clinical judgment and expect these cutpoints to be refined."
  );

  return {
    title: "Lipid management",
    guideline: "2018 AHA/ACC/Multi-Society Cholesterol Guideline (as informed by the 2023 AHA PREVENT statement)",
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
  const hf10Pct = pct(riskResults?.hf?.[10]);

  return {
    lipid: lipidRecommendation(inputs, ascvd10Pct),
    bp: bpRecommendation(inputs, ascvd10Pct),
    heartFailure: heartFailureRecommendation(inputs, hf10Pct),
    ckm: ckmRecommendation({ ...inputs, ascvd10Pct })
  };
}
