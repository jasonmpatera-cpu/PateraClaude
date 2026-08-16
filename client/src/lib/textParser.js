// Fully local, offline, free-of-charge extraction of structured patient
// data from free text (dictated notes) and/or OCR output from a lab-report
// photo. No network calls, no API key, no per-use cost.
//
// Output uses the same field names the app's form-mapping layer expects
// (see formMapping.js), so this is a drop-in replacement for the old
// server-side LLM extraction endpoint.
//
// This is necessarily less flexible than an LLM: it looks for a curated set
// of common lab abbreviations, units, and phrasing patterns. Always review
// the populated form before calculating.

const NUM = String.raw`(\d+(?:\.\d+)?)`;

function firstMatch(text, patterns) {
  for (const p of patterns) {
    const m = text.match(new RegExp(p, "i"));
    if (m) return m;
  }
  return null;
}

function findNumber(text, patterns, { min = -Infinity, max = Infinity } = {}) {
  const m = firstMatch(text, patterns);
  if (!m) return null;
  const val = parseFloat(m[1]);
  if (Number.isNaN(val) || val < min || val > max) return null;
  return val;
}

function wordsToRegexAlt(words) {
  return words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
}

// Negation-aware boolean flag: checks negative phrasing first (so "no
// diabetes" doesn't get picked up as positive by a bare "diabetes" match),
// then positive phrasing. Returns true/false, or null if nothing matched.
function detectFlag(text, { positive, negative = [], drugNames = [], negationGap = 20 }) {
  const negRe = negative.length
    ? new RegExp(`\\b(?:no|not|non-?|denies|without|never|neg(?:ative)?\\s+for|absence of|former|ex-?|quit(?:ted)?|past)\\b[^.;\\n,]{0,${negationGap}}\\b(?:${wordsToRegexAlt(negative)})`, "i")
    : null;
  if (negRe && negRe.test(text)) return false;

  const posPatterns = [...positive];
  if (drugNames.length) posPatterns.push(`\\b(?:${wordsToRegexAlt(drugNames)})\\b`);
  const posRe = new RegExp(`\\b(?:${posPatterns.join("|")})\\b`, "i");
  if (posRe.test(text)) return true;

  return null;
}

function parseSex(text) {
  let m = text.match(/\b(?:sex|gender)[:\s]+([mf])(?:emale|ale)?\b/i);
  if (m) return m[1].toLowerCase() === "f" ? "female" : "male";

  m = text.match(/\b\d{1,3}\s*(?:yo|y\/o|years?[\s-]?old)?[\s,-]*\b(male|female|man|woman|gentleman|lady)\b/i);
  if (m) {
    const w = m[1].toLowerCase();
    return w === "female" || w === "woman" || w === "lady" ? "female" : "male";
  }

  // Shorthand like "72yo M" or "58F"
  m = text.match(/\b(\d{1,3})\s*(?:yo|y\/o)?\s*([MF])\b/);
  if (m) return m[2].toLowerCase() === "f" ? "female" : "male";

  if (/\bfemale\b|\bwoman\b|\blady\b/i.test(text)) return "female";
  if (/\bmale\b|\bman\b|\bgentleman\b/i.test(text)) return "male";
  return null;
}

function parseAge(text) {
  const straightforward = findNumber(
    text,
    [
      `\\b${NUM}\\s*(?:yo|y\\/o|years?[\\s-]?old)\\b`,
      `\\bage[:\\s]+${NUM}\\b`
    ],
    { min: 1, max: 120 }
  );
  if (straightforward != null) return straightforward;

  // Shorthand like "72yo M" or "58F"
  return findNumber(text, [`\\b${NUM}\\s*(?:yo|y\\/o)?\\s*[MF]\\b`], { min: 18, max: 100 });
}

function parseBloodPressure(text) {
  let sbp = findNumber(text, [
    `\\b(?:bp|blood pressure)[:\\s]+${NUM}\\s*(?:\\/|over)\\s*\\d{2,3}`,
    `\\b(?:sbp|systolic)[:\\s]+${NUM}\\b`
  ], { min: 70, max: 260 });

  let dbp = findNumber(text, [
    `\\b(?:bp|blood pressure)[:\\s]+\\d{2,3}\\s*(?:\\/|over)\\s*${NUM}`,
    `\\b(?:dbp|diastolic)[:\\s]+${NUM}\\b`
  ], { min: 30, max: 160 });

  if (sbp == null || dbp == null) {
    // Fall back to a bare "###/##" pattern anywhere in the text.
    const m = text.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\b/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      if (sbp == null && a >= 70 && a <= 260 && b >= 30 && b <= 160) sbp = a;
      if (dbp == null && a >= 70 && a <= 260 && b >= 30 && b <= 160) dbp = b;
    }
  }

  return { sbp, dbp };
}

function mmolCholesterolToMgdl(value) {
  return value * 38.67;
}

function findCholesterolLike(text, labelPatterns, { min, max }) {
  const mgdl = findNumber(text, labelPatterns.map((p) => `${p}[:\\s]+${NUM}\\s*(?:mg\\s*\\/\\s*dl)?\\b`), { min, max });
  if (mgdl != null) return mgdl;
  const mmol = findNumber(text, labelPatterns.map((p) => `${p}[:\\s]+${NUM}\\s*mmol\\s*\\/\\s*l\\b`), { min: min / 38.67, max: max / 38.67 });
  if (mmol != null) return Math.round(mmolCholesterolToMgdl(mmol) * 10) / 10;
  return null;
}

function parseCreatinine(text) {
  const mgdl = findNumber(text, [`\\b(?:creatinine|s\\.?cr|scr|cr)[:\\s]+${NUM}\\s*(?:mg\\s*\\/\\s*dl)?\\b`], { min: 0.2, max: 15 });
  if (mgdl != null) return mgdl;
  const umol = findNumber(text, [`\\b(?:creatinine|s\\.?cr|scr|cr)[:\\s]+${NUM}\\s*(?:u|µ)mol\\s*\\/\\s*l\\b`], { min: 20, max: 1300 });
  if (umol != null) return Math.round((umol / 88.4) * 100) / 100;
  return null;
}

function parseHeightCm(text) {
  // 5'10" / 5 ft 10 in / 5 feet 10 inches
  let m = text.match(/\b(\d)\s*(?:'|ft|feet)\s*(\d{1,2})\s*(?:"|in|inch(?:es)?)?\b/i);
  if (m) {
    const totalIn = parseInt(m[1], 10) * 12 + parseInt(m[2], 10);
    return Math.round(totalIn * 2.54 * 10) / 10;
  }
  // height 178 cm
  const cm = findNumber(text, [`\\bheight[:\\s]+${NUM}\\s*cm\\b`, `\\b${NUM}\\s*cm\\s*(?:tall|height)?\\b`], { min: 100, max: 230 });
  if (cm != null) return cm;
  // height in inches only, e.g. "70 in tall" / "height 70 inches"
  const inches = findNumber(text, [`\\bheight[:\\s]+${NUM}\\s*(?:in|inches)\\b`], { min: 40, max: 90 });
  if (inches != null) return Math.round(inches * 2.54 * 10) / 10;
  return null;
}

function parseWeightKg(text) {
  const kg = findNumber(text, [`\\bweight[:\\s]+${NUM}\\s*kg\\b`, `\\b${NUM}\\s*kg\\b`], { min: 25, max: 350 });
  if (kg != null) return kg;
  const lb = findNumber(text, [`\\bweight[:\\s]+${NUM}\\s*(?:lb|lbs|pounds?)\\b`, `\\b${NUM}\\s*(?:lb|lbs|pounds?)\\b`], { min: 60, max: 700 });
  if (lb != null) return Math.round((lb / 2.20462) * 10) / 10;
  return null;
}

const BP_MED_DRUGS = [
  "lisinopril", "enalapril", "ramipril", "benazepril", "captopril", "quinapril",
  "losartan", "valsartan", "olmesartan", "irbesartan", "candesartan", "telmisartan",
  "amlodipine", "nifedipine", "diltiazem", "verapamil",
  "hydrochlorothiazide", "hctz", "chlorthalidone", "indapamide", "furosemide", "lasix",
  "metoprolol", "atenolol", "carvedilol", "bisoprolol", "propranolol", "labetalol",
  "clonidine", "spironolactone", "hydralazine", "doxazosin", "terazosin", "sacubitril"
];

const STATIN_DRUGS = [
  "atorvastatin", "lipitor", "rosuvastatin", "crestor", "simvastatin", "zocor",
  "pravastatin", "pravachol", "lovastatin", "mevacor", "pitavastatin", "livalo",
  "fluvastatin", "lescol", "statin"
];

const DIABETES_DRUGS = [
  "metformin", "glipizide", "glyburide", "glimepiride", "sitagliptin", "januvia",
  "insulin", "lantus", "humalog", "novolog", "tresiba", "glargine"
];

export function parsePatientText(rawText) {
  const text = (rawText || "").replace(/\s+/g, " ").trim();
  if (!text) return {};

  const { sbp, dbp } = parseBloodPressure(text);

  const result = {
    age_years: parseAge(text),
    sex: parseSex(text),
    current_smoker: detectFlag(text, {
      positive: ["current smoker", "currently smokes", "smokes cigarettes", "\\bsmoker\\b", "smokes\\b", "\\bsmoke\\b"],
      negative: ["smoker", "smoking", "smokes", "smoke", "tobacco"]
    }),
    diabetes: Boolean(
      detectFlag(text, {
        positive: ["diabetes", "diabetic", "\\bdm\\b", "type\\s*2 diabetes", "\\bt2dm\\b"],
        negative: ["diabetes", "diabetic", "dm\\b"],
        drugNames: DIABETES_DRUGS
      })
    ),
    on_bp_meds: Boolean(
      detectFlag(text, {
        positive: ["antihypertensive", "blood pressure medication", "bp medication", "on bp meds"],
        negative: ["antihypertensive", "blood pressure medication", "bp med"],
        drugNames: BP_MED_DRUGS,
        negationGap: 50
      })
    ),
    on_statin: Boolean(
      detectFlag(text, {
        positive: ["statin therapy", "on a statin"],
        negative: ["statin"],
        drugNames: STATIN_DRUGS,
        negationGap: 50
      })
    ),
    known_cvd: detectFlag(text, {
      positive: [
        "heart attack", "myocardial infarction", "\\bmi\\b", "\\bstroke\\b", "\\btia\\b",
        "peripheral artery disease", "\\bpad\\b", "\\bstent\\b", "angioplasty",
        "\\bcabg\\b", "bypass surgery", "coronary artery disease", "\\bcad\\b", "revascularization"
      ],
      negative: [
        "heart attack", "myocardial infarction", "mi\\b", "stroke", "tia", "cvd",
        "cardiovascular disease", "cad", "known cvd"
      ]
    }),
    family_history_premature_ascvd: detectFlag(text, {
      positive: ["family history[^.;\\n]{0,40}(?:heart|cardiac|premature|\\bcad\\b|\\bmi\\b)"],
      negative: ["family history"]
    }),
    systolic_bp_mmhg: sbp,
    diastolic_bp_mmhg: dbp,
    total_cholesterol_mgdl: findCholesterolLike(text, ["\\btotal cholesterol\\b", "\\btotal chol\\b", "\\btc\\b"], { min: 100, max: 500 }),
    hdl_cholesterol_mgdl: findCholesterolLike(text, ["\\bhdl[-\\s]?c?\\b", "\\bhdl cholesterol\\b"], { min: 10, max: 150 }),
    ldl_cholesterol_mgdl: findCholesterolLike(text, ["\\bldl[-\\s]?c?\\b", "\\bldl cholesterol\\b"], { min: 20, max: 400 }),
    triglycerides_mgdl: findNumber(text, [`\\b(?:triglycerides|trig|tg)[:\\s]+${NUM}\\b`], { min: 20, max: 2000 }),
    hba1c_percent: findNumber(text, [`\\b(?:hba1c|hemoglobin a1c|a1c)[:\\s]+${NUM}\\s*%?\\b`], { min: 3, max: 18 }),
    serum_creatinine_mgdl: parseCreatinine(text),
    egfr_ml_min_1_73m2: findNumber(text, [`\\b(?:egfr|gfr)[:\\s]+${NUM}\\b`], { min: 5, max: 150 }),
    uacr_mg_g: findNumber(text, [`\\b(?:uacr|urine acr|albumin[- ]?(?:to[- ])?creatinine ratio|microalbumin(?:\\/creatinine)?)[:\\s]+${NUM}\\b`], { min: 0, max: 30000 }),
    height_cm: parseHeightCm(text),
    weight_kg: parseWeightKg(text),
    bmi_kg_m2: findNumber(text, [`\\bbmi[:\\s]+${NUM}\\b`], { min: 12, max: 70 }),
    waist_circumference_cm: findNumber(text, [`\\bwaist(?:\\s*circumference)?[:\\s]+${NUM}\\s*cm\\b`], { min: 50, max: 200 }),
    notes: null
  };

  return result;
}
