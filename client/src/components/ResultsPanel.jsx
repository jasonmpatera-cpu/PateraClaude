import { riskCategory10yrASCVD } from "../lib/prevent.js";

function fmt(fraction) {
  return `${(fraction * 100).toFixed(1)}%`;
}

const TIER_LABEL = {
  base: "Base model",
  hba1c: "Base model + HbA1c",
  acr: "Base model + urine ACR",
  full: "Base model + HbA1c + urine ACR"
};

export default function ResultsPanel({ results }) {
  if (!results) return null;
  const { tier, risks } = results;
  const ascvdCategory = riskCategory10yrASCVD(risks.ascvd[10]);

  return (
    <div className="card">
      <h2>PREVENT risk estimates</h2>
      <p className="small-muted">
        Equations: {TIER_LABEL[tier]} · AHA PREVENT (Khan et al., Circulation 2024) ·{" "}
        <span className={`badge badge-${ascvdCategory}`}>{ascvdCategory} 10-yr ASCVD risk</span>
      </p>

      <h3 style={{ marginTop: "1rem" }}>10-year risk</h3>
      <div className="risk-grid">
        <div className="risk-tile">
          <div className="risk-value">{fmt(risks.cvd[10])}</div>
          <div className="risk-label">Total CVD</div>
        </div>
        <div className="risk-tile">
          <div className="risk-value">{fmt(risks.ascvd[10])}</div>
          <div className="risk-label">ASCVD</div>
        </div>
        <div className="risk-tile">
          <div className="risk-value">{fmt(risks.hf[10])}</div>
          <div className="risk-label">Heart failure</div>
        </div>
      </div>

      <h3 style={{ marginTop: "1.25rem" }}>30-year risk</h3>
      <div className="risk-grid">
        <div className="risk-tile">
          <div className="risk-value">{fmt(risks.cvd[30])}</div>
          <div className="risk-label">Total CVD</div>
        </div>
        <div className="risk-tile">
          <div className="risk-value">{fmt(risks.ascvd[30])}</div>
          <div className="risk-label">ASCVD</div>
        </div>
        <div className="risk-tile">
          <div className="risk-value">{fmt(risks.hf[30])}</div>
          <div className="risk-label">Heart failure</div>
        </div>
      </div>
      <p className="small-muted" style={{ marginTop: "0.75rem" }}>
        30-year estimates are intended for patients age 30-59; interpret with caution outside that range.
      </p>
    </div>
  );
}
