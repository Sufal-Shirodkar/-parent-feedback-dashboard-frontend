function Badge({ tone, children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function PriorityBadge({ priority }) {
  const value = String(priority || "").toLowerCase();
  const labels = {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  if (!labels[value]) {
    return <span className="muted">—</span>;
  }

  return <Badge tone={value}>{labels[value]}</Badge>;
}

export function StatusBadge({ status }) {
  const value = String(status || "").toLowerCase();

  if (value === "handled") {
    return <Badge tone="handled">Handled</Badge>;
  }

  if (value === "open") {
    return <Badge tone="open">Open</Badge>;
  }

  return <span className="muted">—</span>;
}
