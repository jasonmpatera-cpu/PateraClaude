function Section({ section }) {
  if (!section) return null;
  return (
    <details className="rec-section" open>
      <summary>
        <h3>{section.title}</h3>
        {section.riskGroup && <div className="badge badge-intermediate">{section.riskGroup}</div>}
      </summary>
      <div className="rec-guideline">{section.guideline}</div>
      <ul>
        {section.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {section.note && <div className="rec-note">{section.note}</div>}
    </details>
  );
}

export default function RecommendationsPanel({ recommendations }) {
  if (!recommendations) return null;
  const { lipid, bp, aspirin, diabetes, ckd, heartFailure, cha2ds2vasc, ckm } = recommendations;

  return (
    <div className="card" id="recommendations-printable">
      <h2>Guideline-based recommendations</h2>
      <Section section={lipid} />
      <Section section={bp} />
      <Section section={aspirin} />
      <Section section={diabetes} />
      <Section section={ckd} />
      <Section section={heartFailure} />
      {cha2ds2vasc && <Section section={cha2ds2vasc} />}
      <Section section={ckm} />
    </div>
  );
}
