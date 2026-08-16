import { useState } from "react";
import ImageUpload from "./components/ImageUpload.jsx";
import ProseInput from "./components/ProseInput.jsx";
import PatientForm from "./components/PatientForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import RecommendationsPanel from "./components/RecommendationsPanel.jsx";
import { computePreventRisk } from "./lib/prevent.js";
import { generateRecommendations } from "./lib/guidelines.js";
import {
  defaultFormData,
  applyExtraction,
  deriveFormData,
  missingRequiredFields,
  formToCalcInputs
} from "./lib/formMapping.js";

export default function App() {
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [proseText, setProseText] = useState("");
  const [formData, setFormData] = useState(defaultFormData);

  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [extractNotes, setExtractNotes] = useState(null);

  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [calcError, setCalcError] = useState(null);

  async function handleExtract() {
    setExtracting(true);
    setExtractError(null);
    setExtractNotes(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, proseText })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Extraction failed.");
      setFormData((prev) => applyExtraction(prev, body.data));
      if (body.data.notes) setExtractNotes(body.data.notes);
    } catch (err) {
      setExtractError(err.message);
    } finally {
      setExtracting(false);
    }
  }

  function handleCalculate() {
    setCalcError(null);
    const derived = deriveFormData(formData);
    if (derived.bmi !== formData.bmi || derived.egfr !== formData.egfr) {
      setFormData(derived);
    }
    const missing = missingRequiredFields(derived);
    if (missing.length > 0) {
      setCalcError(`Please fill in: ${missing.join(", ")}`);
      setResults(null);
      setRecommendations(null);
      return;
    }
    try {
      const inputs = formToCalcInputs(derived);
      const computed = computePreventRisk(inputs);
      setResults(computed);
      setRecommendations(generateRecommendations(inputs, computed.risks));
    } catch (err) {
      setCalcError(err.message);
    }
  }

  const canExtract = Boolean(imageDataUrl || proseText.trim());

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>PREVENT Risk Suite</h1>
        <p>ASCVD · Total CVD · Heart Failure risk, calculated with the AHA PREVENT equations — plus guideline-based recommendations</p>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>1. Bring in patient data</h2>
          <div className="grid-2">
            <div>
              <h3>Photo of labs</h3>
              <ImageUpload onImageChange={setImageDataUrl} />
            </div>
            <div>
              <h3>Prose / dictated notes</h3>
              <ProseInput value={proseText} onChange={setProseText} />
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: "1rem" }}>
            <button className="btn btn-primary" disabled={!canExtract || extracting} onClick={handleExtract}>
              {extracting ? "Extracting..." : "Extract into form below"}
            </button>
            <span className="small-muted">
              Missing fields default to: no diabetes, no antihypertensive meds, no statin.
            </span>
          </div>
          {extractError && <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>{extractError}</div>}
          {extractNotes && <div className="alert" style={{ marginTop: "0.75rem" }}>Note from extraction: {extractNotes}</div>}
        </section>

        <section className="card">
          <h2>2. Review &amp; confirm patient data</h2>
          <p className="small-muted">Always double-check auto-extracted values before calculating.</p>
          <PatientForm formData={formData} setFormData={setFormData} />
          <div className="btn-row" style={{ marginTop: "0.5rem" }}>
            <button className="btn btn-primary" onClick={handleCalculate}>
              Calculate risk &amp; recommendations
            </button>
          </div>
          {calcError && <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>{calcError}</div>}
        </section>

        <ResultsPanel results={results} />
        <RecommendationsPanel recommendations={recommendations} />
      </main>

      <footer className="disclaimer">
        For clinical decision support only — not a substitute for clinical judgment. Verify all extracted data and
        guideline recommendations independently. PREVENT equations are validated for ages 30-79 without prior
        cardiovascular disease. AI-assisted extraction can make mistakes; review every field before calculating.
      </footer>
    </div>
  );
}
