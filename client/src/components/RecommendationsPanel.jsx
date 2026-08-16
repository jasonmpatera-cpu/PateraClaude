function Section({ section }) {
  return (
    <div className="rec-section">
      <h3>{section.title}</h3>
      <div className="rec-guideline">{section.guideline}</div>
      {section.riskGroup && <div className="badge badge-intermediate">{section.riskGroup}</div>}
      <ul>
        {section.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {section.note && <div className="rec-note">{section.note}</div>}
    </div>
  );
}

export default function RecommendationsPanel({ recommendations }) {
  if (!recommendations) return null;
  const { lipid, bp, heartFailure, ckm } = recommendations;

  return (
    <div className="card">
      <h2>Guideline-based recommendations</h2>
      <Section section={lipid} />
      <Section section={bp} />
      <Section section={heartFailure} />
      <Section section={ckm} />
    </div>
  );
}
