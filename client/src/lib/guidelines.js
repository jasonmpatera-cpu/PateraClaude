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
  const {
    age, diabetes, knownCvd, ldl, smoker, sbp, dbp, statin,
    priorMI, priorStroke, priorPAD, acsWithin12mo, priorRevasc, heartFailureHistory
  } = inputs;
  const bullets = [];
  let riskGroup = null;
  const category = bpCategory(sbp, dbp);
  const hypertensive = category === "Stage 1 hypertension" || category === "Stage 2 hypertension";

  if (knownCvd) {
    // 2026 guideline's exact "very high risk" definition: >=2 major ASCVD
    // events, OR 1 major event plus >=2 high-risk conditions.
    const majorEventCount = [acsWithin12mo, priorMI, priorStroke, priorPAD].filter(Boolean).length;
    const highRiskConditionCount = [
      age != null && age > 65,
      priorRevasc,
      smoker,
      diabetes,
      heartFailureHistory,
      hypertensive,
      statin && ldl != null && ldl > 100
    ].filter(Boolean).length;
    const veryHighRisk = majorEventCount >= 2 || (majorEventCount >= 1 && highRiskConditionCount >= 2);

    riskGroup = veryHighRisk ? "Secondary prevention — very high risk" : "Secondary prevention — ASCVD, not very high risk";
    bullets.push(
      "High-intensity statin recommended for all patients with established ASCVD, regardless of baseline LDL-C (Class I)."
    );
    if (veryHighRisk) {
      bullets.push("LDL-C goal <55 mg/dL and non-HDL-C goal <85 mg/dL (very-high-risk criteria met).");
    } else {
      bullets.push("LDL-C goal <70 mg/dL.");
      if (majorEventCount >= 1) {
        bullets.push(
          `Not currently classified very-high-risk (${highRiskConditionCount} of the ≥2 additional high-risk conditions needed are checked: age >65, prior revascularization, current smoking, diabetes, heart failure history, hypertension, LDL-C >100 mg/dL despite statin) — revisit if more become present.`
        );
      }
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

function gfrCategory(egfr) {
  if (egfr == null) return null;
  if (egfr >= 90) return "G1";
  if (egfr >= 60) return "G2";
  if (egfr >= 45) return "G3a";
  if (egfr >= 30) return "G3b";
  if (egfr >= 15) return "G4";
  return "G5";
}

function albuminuriaCategory(uacr) {
  if (uacr == null) return null;
  if (uacr < 30) return "A1";
  if (uacr <= 300) return "A2";
  return "A3";
}

// KDIGO 2012/2024 CKD heat-map: combined GFR x albuminuria risk category.
const KDIGO_HEATMAP = {
  G1: { A1: "low", A2: "moderate", A3: "high" },
  G2: { A1: "low", A2: "moderate", A3: "high" },
  G3a: { A1: "moderate", A2: "high", A3: "very high" },
  G3b: { A1: "high", A2: "very high", A3: "very high" },
  G4: { A1: "very high", A2: "very high", A3: "very high" },
  G5: { A1: "very high", A2: "very high", A3: "very high" }
};

function ckdRecommendation(inputs) {
  const { egfr, uacr, diabetes, knownCvd } = inputs;
  const gfrCat = gfrCategory(egfr);
  const albCat = albuminuriaCategory(uacr);
  const bullets = [];

  if (gfrCat == null) {
    return {
      title: "Chronic kidney disease staging",
      guideline: "KDIGO 2024 Clinical Practice Guideline for CKD",
      riskGroup: null,
      bullets: ["eGFR not available — cannot stage CKD."]
    };
  }

  const risk = albCat ? KDIGO_HEATMAP[gfrCat][albCat] : null;
  const noCkd = gfrCat === "G1" || gfrCat === "G2";

  let riskGroup;
  if (risk) {
    riskGroup = `${gfrCat}${albCat} — KDIGO risk: ${risk}`;
  } else {
    riskGroup = noCkd ? `${gfrCat} — albuminuria not assessed` : `${gfrCat} — CKD, albuminuria not assessed`;
  }

  if (noCkd && (albCat === "A1" || albCat == null)) {
    bullets.push(
      albCat == null
        ? "eGFR is in the normal/mildly-reduced range; check a urine albumin-to-creatinine ratio (UACR) to rule out albuminuric kidney damage before concluding there is no CKD."
        : "No CKD by KDIGO criteria (normal eGFR and UACR)."
    );
  } else {
    bullets.push(
      `Confirm chronicity (repeat eGFR/UACR ≥3 months apart) before labeling as CKD if this is a new finding.`
    );
    bullets.push("Blood pressure goal <130/80 mmHg; ACE inhibitor or ARB first-line if albuminuria is present, especially with diabetes or hypertension.");
    if (diabetes || (uacr != null && uacr >= 200) || knownCvd) {
      bullets.push(
        "SGLT2 inhibitor recommended (independent of diabetes status) for eGFR ≥20 with albuminuria, or with diabetes/established ASCVD, for both kidney-disease progression and cardiovascular benefit (KDIGO 2024 / ADA 2026)."
      );
    }
    bullets.push("Avoid/dose-adjust nephrotoxic agents (NSAIDs, certain contrast studies); review medication list for renal dosing.");
  }

  if (albCat == null && !noCkd) {
    bullets.push("Albuminuria (UACR) not available — obtain it to complete KDIGO risk stratification and confirm the referral threshold below.");
  }

  const refer = gfrCat === "G4" || gfrCat === "G5" || albCat === "A3" || risk === "very high";
  if (refer) {
    bullets.push("Nephrology referral indicated: eGFR <30, UACR >300 mg/g, and/or KDIGO \"very high\" risk category all independently warrant referral.");
  }

  return {
    title: "Chronic kidney disease staging",
    guideline: "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD",
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
  const { diabetes, knownCvd, sbp, dbp, heartFailureHistory } = inputs;
  const bullets = [];

  if (heartFailureHistory) {
    bullets.push(
      "A history of heart failure places this patient at Stage C (symptomatic) or beyond — outside what this tool's inputs can further stratify. Guideline-directed medical therapy (ARNI/ACEi/ARB, beta-blocker, MRA, SGLT2 inhibitor) and echocardiography-based EF assessment drive management, not primary-prevention risk factors."
    );
    return {
      title: "Heart failure",
      guideline: "2022 AHA/ACC/HFSA Heart Failure Guideline",
      riskGroup: "History of heart failure — Stage C/D",
      bullets,
      note: "This tool is not a substitute for GDMT titration or EF-based management — refer to cardiology if not already established."
    };
  }

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

function aspirinRecommendation(inputs, ascvd10Pct) {
  const { age, knownCvd } = inputs;
  const bullets = [];
  let riskGroup;

  if (knownCvd) {
    riskGroup = "Secondary prevention";
    bullets.push(
      "Aspirin 75-100 mg daily is standard for secondary prevention in established ASCVD (separate from the primary-prevention statement below) — confirm no contraindication (active bleeding, recent major bleed) and reconcile with any concurrent antiplatelet/anticoagulant therapy."
    );
  } else if (age == null) {
    riskGroup = "Age not provided";
    bullets.push("Age is needed to apply the USPSTF primary-prevention age cutoffs below.");
  } else if (age >= 60) {
    riskGroup = "Primary prevention, age ≥60";
    bullets.push(
      "USPSTF recommends AGAINST initiating aspirin for primary prevention at age ≥60 (Grade D) — bleeding risk outweighs cardiovascular benefit at this age."
    );
  } else if (age >= 40) {
    if (ascvd10Pct != null && ascvd10Pct >= 10) {
      riskGroup = `Primary prevention, age 40-59, 10-yr risk ${ascvd10Pct}%`;
      bullets.push(
        "Individualize: USPSTF describes a small net benefit for low-dose aspirin in adults 40-59 with ≥10% 10-year CVD risk (Grade C) — appropriate only after shared decision-making that weighs the patient's bleeding risk (age, prior GI bleed, concurrent NSAID/anticoagulant use)."
      );
    } else {
      riskGroup = "Primary prevention, age 40-59, lower risk";
      bullets.push(
        "Aspirin is not routinely recommended — at this risk level, bleeding risk is not clearly outweighed by cardiovascular benefit per USPSTF."
      );
    }
  } else {
    riskGroup = "Age <40";
    bullets.push("Outside the age range addressed by the USPSTF's 2022 statement (40-59 individualized, ≥60 not recommended); routine aspirin is not indicated for primary prevention.");
  }

  return {
    title: "Aspirin for ASCVD prevention",
    guideline: "2022 USPSTF Recommendation Statement: Aspirin Use to Prevent Cardiovascular Disease",
    riskGroup,
    bullets
  };
}

function diabetesRecommendation(inputs) {
  const { diabetes, age, egfr, knownCvd, heartFailureHistory } = inputs;
  const bullets = [];

  if (!diabetes) {
    return {
      title: "Diabetes screening & management",
      guideline: "2026 ADA Standards of Care in Diabetes",
      riskGroup: "No diabetes indicated",
      bullets: [
        age != null && age >= 35
          ? "Screen for prediabetes/diabetes at least every 3 years starting at age 35 (earlier/more frequently with obesity, hypertension, or other risk factors)."
          : "Routine screening interval per ADA is age ≥35 (or earlier with risk factors such as obesity, hypertension, or gestational diabetes history)."
      ]
    };
  }

  bullets.push("General A1c target <7% for most nonpregnant adults; individualize looser (~<8%) for limited life expectancy or high hypoglycemia risk, or tighter (<6.5%) for select healthy patients early in disease.");
  bullets.push("Metformin remains a reasonable first-line agent" + (egfr != null && egfr < 30 ? ", but is contraindicated at this patient's eGFR (<30 mL/min/1.73m²) — dose-reduce below eGFR 45 and stop below 30." : "."));

  const compellingIndication = knownCvd || heartFailureHistory || (egfr != null && egfr < 60);
  if (compellingIndication) {
    const reasons = [knownCvd && "established ASCVD", heartFailureHistory && "heart failure", egfr != null && egfr < 60 && "CKD"].filter(Boolean).join(", ");
    bullets.push(
      `An SGLT2 inhibitor and/or GLP-1 receptor agonist with demonstrated cardiovascular benefit is recommended independent of A1c, with or without metformin, given ${reasons} (Class I).`
    );
    if (heartFailureHistory) {
      bullets.push("SGLT2 inhibitor specifically recommended for HF regardless of ejection fraction.");
    }
  }

  bullets.push("Blood pressure and lipid targets follow the sections above; diabetes itself is an unconditional statin indication at age 40-75.");

  return {
    title: "Diabetes management",
    guideline: "2026 ADA Standards of Care in Diabetes",
    riskGroup: "Diabetes present",
    bullets
  };
}

function cha2ds2VascRecommendation(inputs) {
  const { age, sex, diabetes, sbp, dbp, bpMeds, priorStroke, priorMI, priorPAD, heartFailureHistory } = inputs;

  const hypertensionPoint = bpMeds || bpCategory(sbp, dbp) === "Stage 1 hypertension" || bpCategory(sbp, dbp) === "Stage 2 hypertension";
  const agePoints = age != null && age >= 75 ? 2 : age != null && age >= 65 ? 1 : 0;
  const vascularDisease = priorMI || priorPAD;

  const components = [
    { label: "Congestive heart failure / LV dysfunction", points: heartFailureHistory ? 1 : 0 },
    { label: "Hypertension", points: hypertensionPoint ? 1 : 0 },
    { label: age != null && age >= 75 ? "Age ≥75" : "Age 65-74", points: agePoints },
    { label: "Diabetes", points: diabetes ? 1 : 0 },
    { label: "Prior stroke/TIA/thromboembolism", points: priorStroke ? 2 : 0 },
    { label: "Vascular disease (prior MI or PAD)", points: vascularDisease ? 1 : 0 },
    { label: "Sex category (female)", points: sex === "female" ? 1 : 0 }
  ];

  const score = components.reduce((sum, c) => sum + c.points, 0);
  const isFemale = sex === "female";

  let recommendation;
  if (isFemale) {
    if (score <= 1) recommendation = "No antithrombotic therapy indicated for stroke prevention on CHA₂DS₂-VASc grounds (score reflects the sex point alone, if present).";
    else if (score === 2) recommendation = "Consider anticoagulation (Class IIb) — shared decision-making.";
    else recommendation = "Anticoagulation recommended (Class I).";
  } else {
    if (score === 0) recommendation = "No antithrombotic therapy indicated for stroke prevention on CHA₂DS₂-VASc grounds.";
    else if (score === 1) recommendation = "Consider anticoagulation (Class IIb) — shared decision-making.";
    else recommendation = "Anticoagulation recommended (Class I).";
  }

  const bullets = [
    `CHA₂DS₂-VASc score: ${score} (${components.filter((c) => c.points > 0).map((c) => `${c.label} +${c.points}`).join(", ") || "no points"}).`,
    recommendation
  ];

  if (score >= 1) {
    bullets.push("A direct oral anticoagulant (DOAC) is preferred over warfarin for most patients — warfarin remains necessary for mechanical heart valves or moderate-to-severe mitral stenosis.");
  }

  return {
    title: "CHA₂DS₂-VASc (atrial fibrillation)",
    guideline: "2019 AHA/ACC/HRS Atrial Fibrillation Guideline",
    riskGroup: `Score ${score}`,
    bullets
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
 *   plus optional: ldl, triglycerides, hba1c, waist, uacr, dbp, priorMI,
 *   priorStroke, priorPAD, acsWithin12mo, priorRevasc, heartFailureHistory,
 *   atrialFibrillation (knownCvd is derived from the history fields, not a
 *   direct input)
 * @param {object} riskResults - output of computePreventRisk().risks
 */
export function generateRecommendations(inputs, riskResults) {
  const ascvd10Pct = pct(riskResults?.ascvd?.[10]);
  const ascvd30Pct = pct(riskResults?.ascvd?.[30]);
  const hf10Pct = pct(riskResults?.hf?.[10]);

  const result = {
    lipid: lipidRecommendation(inputs, ascvd10Pct, ascvd30Pct),
    bp: bpRecommendation(inputs, ascvd10Pct),
    aspirin: aspirinRecommendation(inputs, ascvd10Pct),
    diabetes: diabetesRecommendation(inputs),
    ckd: ckdRecommendation(inputs),
    heartFailure: heartFailureRecommendation(inputs, hf10Pct),
    ckm: ckmRecommendation({ ...inputs, ascvd10Pct })
  };

  if (inputs.atrialFibrillation) {
    result.cha2ds2vasc = cha2ds2VascRecommendation(inputs);
  }

  return result;
}
