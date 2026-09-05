export default function SummaryCards({ counts }) {
  const cards = [
    { label: "Total Feedback", value: counts.total },
    { label: "High / Urgent", value: counts.highUrgent },
    { label: "Contact Requested", value: counts.contactRequested },
    { label: "Not Continuing", value: counts.notContinuing },
    { label: "Open", value: counts.open },
    { label: "Handled", value: counts.handled },
  ];

  return (
    <section className="summary-grid" aria-label="Feedback summary">
      {cards.map((card) => (
        <article key={card.label} className="summary-card">
          <p>{card.label}</p>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
