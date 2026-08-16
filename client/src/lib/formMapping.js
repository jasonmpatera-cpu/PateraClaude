import { calculateBMI, calculateEGFR } from "./prevent.js";

export const defaultFormData = {
  age: "",
  sex: "",
  smoker: false,
  diabetes: false,
  bpMeds: false,
  statin: false,
  knownCvd: false,
  familyHistory: false,
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

// Maps server extraction field names -> [formKey, kind]. kind "num" fields
// are only applied when non-null; kind "bool" fields always overwrite,
// because the extraction prompt already defaults them to false.
const FIELD_MAP = {
  age_years: ["age", "num"],
  sex: ["sex", "raw"],
  current_smoker: ["smoker", "boolOrNull"],
  diabetes: ["diabetes", "bool"],
  on_bp_meds: ["bpMeds", "bool"],
  on_statin: ["statin", "bool"],
  known_cvd: ["knownCvd", "boolOrNull"],
  family_history_premature_ascvd: ["familyHistory", "boolOrNull"],
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
// after AI extraction and right before calculating from manually-typed data.
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
  for (const [serverKey, [formKey, kind]] of Object.entries(FIELD_MAP)) {
    const value = extracted[serverKey];
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
    knownCvd: Boolean(formData.knownCvd),
    familyHistory: Boolean(formData.familyHistory),
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
    waist: formData.waist !== "" ? Number(formData.waist) : null
  };
}
