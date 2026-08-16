function NumField({ formData, setField, name, label, unit, step = "any" }) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label} {unit ? <span className="small-muted">({unit})</span> : null}
      </label>
      <input
        id={name}
        type="number"
        step={step}
        value={formData[name]}
        onChange={(e) => setField(name, e.target.value)}
      />
    </div>
  );
}

function ToggleField({ formData, setField, name, label }) {
  return (
    <div className="toggle-row">
      <input
        id={name}
        type="checkbox"
        checked={Boolean(formData[name])}
        onChange={(e) => setField(name, e.target.checked)}
      />
      <label htmlFor={name}>{label}</label>
    </div>
  );
}

export default function PatientForm({ formData, setFormData }) {
  function setField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div>
      <h3>Demographics &amp; vitals</h3>
      <div className="field-row">
        <NumField formData={formData} setField={setField} name="age" label="Age" unit="years" step="1" />
        <div className="field">
          <label htmlFor="sex">Sex</label>
          <select id="sex" value={formData.sex} onChange={(e) => setField("sex", e.target.value)}>
            <option value="">Select...</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <NumField formData={formData} setField={setField} name="sbp" label="Systolic BP" unit="mmHg" step="1" />
        <NumField formData={formData} setField={setField} name="dbp" label="Diastolic BP" unit="mmHg" step="1" />
      </div>

      <h3>Lipid panel</h3>
      <div className="field-row">
        <NumField formData={formData} setField={setField} name="totalChol" label="Total cholesterol" unit="mg/dL" />
        <NumField formData={formData} setField={setField} name="hdl" label="HDL-C" unit="mg/dL" />
        <NumField formData={formData} setField={setField} name="ldl" label="LDL-C" unit="mg/dL" />
        <NumField formData={formData} setField={setField} name="triglycerides" label="Triglycerides" unit="mg/dL" />
      </div>

      <h3>Kidney function</h3>
      <div className="field-row">
        <NumField formData={formData} setField={setField} name="creatinine" label="Serum creatinine" unit="mg/dL" />
        <NumField formData={formData} setField={setField} name="egfr" label="eGFR" unit="mL/min/1.73m²" step="1" />
        <NumField formData={formData} setField={setField} name="uacr" label="Urine ACR (optional)" unit="mg/g" />
      </div>
      <p className="small-muted">eGFR auto-calculates from creatinine + age + sex (2021 CKD-EPI, race-free) if left blank.</p>

      <h3>Body measurements</h3>
      <div className="field-row">
        <NumField formData={formData} setField={setField} name="heightCm" label="Height" unit="cm" />
        <NumField formData={formData} setField={setField} name="weightKg" label="Weight" unit="kg" />
        <NumField formData={formData} setField={setField} name="bmi" label="BMI" unit="kg/m²" />
        <NumField formData={formData} setField={setField} name="waist" label="Waist circumference (optional)" unit="cm" />
      </div>
      <p className="small-muted">BMI auto-calculates from height + weight if left blank.</p>

      <h3>Other labs (optional, improves accuracy)</h3>
      <div className="field-row">
        <NumField formData={formData} setField={setField} name="hba1c" label="Hemoglobin A1c" unit="%" />
      </div>

      <h3>History &amp; medications</h3>
      <p className="small-muted">Assumed "No" unless checked — matches the requested default of no diabetes, no antihypertensive therapy, and no statin unless stated.</p>
      <div className="field-row">
        <ToggleField formData={formData} setField={setField} name="smoker" label="Current smoker" />
        <ToggleField formData={formData} setField={setField} name="diabetes" label="Diabetes" />
        <ToggleField formData={formData} setField={setField} name="bpMeds" label="On antihypertensive medication" />
        <ToggleField formData={formData} setField={setField} name="statin" label="On statin therapy" />
        <ToggleField formData={formData} setField={setField} name="knownCvd" label="Known ASCVD (prior MI/stroke/PAD/revasc.)" />
        <ToggleField formData={formData} setField={setField} name="familyHistory" label="Family history of premature ASCVD" />
      </div>
    </div>
  );
}
