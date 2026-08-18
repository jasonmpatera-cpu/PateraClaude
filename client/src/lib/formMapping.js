import { calculateBMI, calculateEGFR } from "./prevent.js";

export const defaultFormData = {
  age: "",
  sex: "",
  smoker: false,
  diabetes: false,
  bpMeds: false,
  statin: false,
  familyHistory: false,
  // Granular ASCVD history — replaces a single "known ASCVD" checkbox so the
  // 2026 lipid guideline's "very high risk" secondary-prevention criteria
  // can be applied directly instead of approximated.
  priorMI: false,
  priorStroke: false,
  priorPAD: false,
  acsWithin12mo: false,
  priorRevasc: false,
  heartFailureHistory: false,
  atrialFibrillation: false,
  totalChol: "",
  hdl: "",
  ldl: "",
  triglycerides: "",
  sbp: "",
  dbp: "",
  heightCm: "",
  weightKg: "",
  bmi: "",
  creatinine: "",
  egfr: "",
  hba1c: "",
  uacr: "",
  waist: ""
};

// True if any granular history item indicates established ASCVD — drives
// secondary-prevention branches throughout the recommendation engine.
export function hasKnownCvd(formData) {
  return Boolean(
    formData.priorMI || formData.priorStroke || formData.priorPAD || formData.acsWithin12mo || formData.priorRevasc
  );
}

// Maps parsed-text field names -> [formKey, kind]. kind "num" fields are
// only applied when non-null; kind "bool" fields always overwrite, because
// the parser already defaults them to false rather than leaving them null.
const FIELD_MAP = {
  age_years: ["age", "num"],
  sex: ["sex", "raw"],
  current_smoker: ["smoker", "boolOrNull"],
  diabetes: ["diabetes", "bool"],
  on_bp_meds: ["bpMeds", "bool"],
  on_statin: ["statin", "bool"],
  family_history_premature_ascvd: ["familyHistory", "boolOrNull"],
  prior_mi: ["priorMI", "boolOrNull"],
  prior_stroke: ["priorStroke", "boolOrNull"],
  prior_pad: ["priorPAD", "boolOrNull"],
  acs_within_12mo: ["acsWithin12mo", "boolOrNull"],
  prior_revascularization: ["priorRevasc", "boolOrNull"],
  heart_failure_history: ["heartFailureHistory", "boolOrNull"],
  atrial_fibrillation: ["atrialFibrillation", "boolOrNull"],
  systolic_bp_mmhg: ["sbp", "num"],
  diastolic_bp_mmhg: ["dbp", "num"],
  total_cholesterol_mgdl: ["totalChol", "num"],
  hdl_cholesterol_mgdl: ["hdl", "num"],
  ldl_cholesterol_mgdl: ["ldl", "num"],
  triglycerides_mgdl: ["triglycerides", "num"],
  hba1c_percent: ["hba1c", "num"],
  serum_creatinine_mgdl: ["creatinine", "num"],
  egfr_ml_min_1_73m2: ["egfr", "num"],
  uacr_mg_g: ["uacr", "num"],
  height_cm: ["heightCm", "num"],
  weight_kg: ["weightKg", "num"],
  bmi_kg_m2: ["bmi", "num"],
  waist_circumference_cm: ["waist", "num"]
};

// Fills in BMI / eGFR from their raw ingredients (height+weight,
// creatinine+age+sex) whenever the derived field itself is blank. Used both
// after text/photo parsing and right before calculating from manually-typed
// data.
export function deriveFormData(formData) {
  const next = { ...formData };
  if (!next.bmi && next.heightCm && next.weightKg) {
    const bmi = calculateBMI(Number(next.heightCm), Number(next.weightKg));
    if (bmi) next.bmi = bmi.toFixed(1);
  }
  if (!next.egfr && next.creatinine && next.age && next.sex) {
    const egfr = calculateEGFR(Number(next.creatinine), Number(next.age), next.sex);
    if (egfr) next.egfr = egfr.toFixed(0);
  }
  return next;
}

export function applyExtraction(formData, extracted) {
  let next = { ...formData };
  for (const [parsedKey, [formKey, kind]] of Object.entries(FIELD_MAP)) {
    const value = extracted[parsedKey];
    if (kind === "num") {
      if (value != null && value !== "") next[formKey] = String(value);
    } else if (kind === "bool") {
      next[formKey] = Boolean(value);
    } else if (kind === "boolOrNull") {
      if (value != null) next[formKey] = Boolean(value);
    } else if (kind === "raw") {
      if (value != null) next[formKey] = value;
    }
  }

  return deriveFormData(next);
}

const REQUIRED = [
  ["age", "Age"],
  ["sex", "Sex"],
  ["totalChol", "Total cholesterol"],
  ["hdl", "HDL cholesterol"],
  ["sbp", "Systolic BP"],
  ["bmi", "BMI (or height + weight)"],
  ["egfr", "eGFR (or creatinine + age + sex)"]
];

export function missingRequiredFields(formData) {
  return REQUIRED.filter(([key]) => formData[key] === "" || formData[key] == null).map(([, label]) => label);
}

export function formToCalcInputs(formData) {
  return {
    age: Number(formData.age),
    sex: formData.sex,
    smoker: Boolean(formData.smoker),
    diabetes: Boolean(formData.diabetes),
    bpMeds: Boolean(formData.bpMeds),
    statin: Boolean(formData.statin),
    familyHistory: Boolean(formData.familyHistory),
    knownCvd: hasKnownCvd(formData),
    priorMI: Boolean(formData.priorMI),
    priorStroke: Boolean(formData.priorStroke),
    priorPAD: Boolean(formData.priorPAD),
    acsWithin12mo: Boolean(formData.acsWithin12mo),
    priorRevasc: Boolean(formData.priorRevasc),
    heartFailureHistory: Boolean(formData.heartFailureHistory),
    atrialFibrillation: Boolean(formData.atrialFibrillation),
    totalChol: Number(formData.totalChol),
    hdl: Number(formData.hdl),
    ldl: formData.ldl !== "" ? Number(formData.ldl) : null,
    triglycerides: formData.triglycerides !== "" ? Number(formData.triglycerides) : null,
    sbp: Number(formData.sbp),
    dbp: formData.dbp !== "" ? Number(formData.dbp) : null,
    bmi: Number(formData.bmi),
    egfr: Number(formData.egfr),
    hba1c: formData.hba1c !== "" ? Number(formData.hba1c) : null,
    uacr: formData.uacr !== "" ? Number(formData.uacr) : null,
    waist: formData.waist !== "" ? Number(formData.waist) : null,
    creatinine: formData.creatinine !== "" ? Number(formData.creatinine) : null
  };
}
