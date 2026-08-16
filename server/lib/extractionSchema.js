// JSON schema for the structured patient/lab data we ask Claude to extract
// from a lab-report photo and/or free-text dictation. Used as an Anthropic
// tool definition to force structured output.

export const EXTRACTION_TOOL = {
  name: "record_patient_data",
  description:
    "Record structured patient demographic, vital sign, and laboratory data extracted from the supplied image and/or free text.",
  input_schema: {
    type: "object",
    properties: {
      age_years: {
        type: ["number", "null"],
        description: "Patient age in years."
      },
      sex: {
        type: ["string", "null"],
        enum: ["female", "male", null],
        description: "Sex used for risk-equation purposes (female/male)."
      },
      current_smoker: {
        type: ["boolean", "null"],
        description: "True only if text/image clearly indicates current tobacco smoking."
      },
      diabetes: {
        type: "boolean",
        description:
          "True only if diabetes is explicitly stated (diagnosis, on diabetes meds, or A1c/glucose clearly diagnostic). Default false if not mentioned."
      },
      on_bp_meds: {
        type: "boolean",
        description:
          "True only if antihypertensive medication use is explicitly stated. Default false if not mentioned."
      },
      on_statin: {
        type: "boolean",
        description:
          "True only if statin medication use is explicitly stated. Default false if not mentioned."
      },
      known_cvd: {
        type: ["boolean", "null"],
        description:
          "True if there is a stated history of myocardial infarction, stroke, TIA, peripheral artery disease, coronary/carotid revascularization, or other established ASCVD."
      },
      family_history_premature_ascvd: {
        type: ["boolean", "null"],
        description: "True if family history of premature ASCVD is stated."
      },
      systolic_bp_mmhg: { type: ["number", "null"] },
      diastolic_bp_mmhg: { type: ["number", "null"] },
      total_cholesterol_mgdl: { type: ["number", "null"] },
      hdl_cholesterol_mgdl: { type: ["number", "null"] },
      ldl_cholesterol_mgdl: {
        type: ["number", "null"],
        description: "Directly reported or calculated LDL-C if shown."
      },
      triglycerides_mgdl: { type: ["number", "null"] },
      hba1c_percent: { type: ["number", "null"] },
      fasting_glucose_mgdl: { type: ["number", "null"] },
      serum_creatinine_mgdl: { type: ["number", "null"] },
      egfr_ml_min_1_73m2: {
        type: ["number", "null"],
        description: "Only if eGFR is directly reported in the source; otherwise leave null and it will be calculated from creatinine."
      },
      uacr_mg_g: {
        type: ["number", "null"],
        description: "Urine albumin-to-creatinine ratio in mg/g, if present."
      },
      height_cm: { type: ["number", "null"] },
      weight_kg: { type: ["number", "null"] },
      bmi_kg_m2: {
        type: ["number", "null"],
        description: "Only if BMI is directly reported; otherwise leave null and it will be calculated from height/weight."
      },
      waist_circumference_cm: { type: ["number", "null"] },
      notes: {
        type: ["string", "null"],
        description:
          "Brief note on anything ambiguous, conflicting, or that could not be confidently parsed (e.g. unclear units, illegible values)."
      }
    },
    required: ["diabetes", "on_bp_meds", "on_statin"]
  }
};

export const SYSTEM_PROMPT = `You are a careful clinical data-entry assistant. You will be given a photo of a lab report and/or free-text/dictated notes describing a patient. Extract ONLY the fields defined in the record_patient_data tool.

Rules:
- Never invent or estimate a value that is not present in the source. If a field is not present or not legible, output null for it (numeric/enum fields) — EXCEPT diabetes, on_bp_meds, and on_statin.
- For diabetes, on_bp_meds, and on_statin specifically: default to false unless the source clearly and explicitly states the condition/medication is present. Absence of mention means false, not null.
- Convert units where the source uses non-US units (e.g., cholesterol in mmol/L, creatinine in umol/L, height in inches/feet, weight in lb) into the units requested by the schema (mg/dL, cm, kg). Show your conversion nowhere except the final numbers.
- Prose/dictated notes may list data in any order, using shorthand (e.g. "TC 210 HDL 45 SBP 138 smoker diabetic on lisinopril"). Parse these robustly.
- If the same field appears to have conflicting values between the image and the text, prefer the more specific/recent one and mention the conflict in "notes".
- Do not output any commentary outside of the tool call.`;
