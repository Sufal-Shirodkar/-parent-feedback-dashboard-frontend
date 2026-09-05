import { useState } from "react";
import { getWeeklyDigest, isEmptyWeeklyDigest } from "../api/digestApi";
import { useAuth } from "../hooks/useAuth";

function DigestBlock({ title, children }) {
  return (
    <article className="digest-block">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function DigestList({ items, emptyLabel }) {
  if (!items.length) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function WeeklyDigest() {
  const { getAccessContext } = useAuth();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const nextDigest = await getWeeklyDigest(getAccessContext);
      setDigest(nextDigest);
      setHasGenerated(true);
    } catch (generateError) {
      setDigest(null);
      setHasGenerated(true);
      setError(generateError.message || "Unable to generate the weekly digest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = hasGenerated && !error && isEmptyWeeklyDigest(digest);

  return (
    <section className="digest" aria-labelledby="weekly-digest-title">
      <div className="digest-header">
        <div>
          <h2 id="weekly-digest-title">What happened this week?</h2>
          <p>An AI summary of recent parent feedback.</p>
        </div>
        <button
          type="button"
          className="button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : hasGenerated
              ? "Refresh digest"
              : "Generate weekly digest"}
        </button>
      </div>

      {loading && (
        <p className="muted" role="status">
          Generating weekly digest...
        </p>
      )}

      {error && (
        <p className="form-message is-error" role="alert">
          {error}
        </p>
      )}

      {isEmpty && (
        <p className="muted" role="status">
          No parent feedback was received this week.
        </p>
      )}

      {!loading && digest && !isEmpty && (
        <div className="digest-grid">
          <DigestBlock title="Overall vibe">
            <p>{digest.overallVibe || "No overall vibe was returned."}</p>
          </DigestBlock>
          <DigestBlock title="Urgent fires">
            <DigestList
              items={digest.urgentFires}
              emptyLabel="No urgent fires this week."
            />
          </DigestBlock>
          <DigestBlock title="Big themes">
            <DigestList
              items={digest.bigThemes}
              emptyLabel="No big themes were identified."
            />
          </DigestBlock>
          <DigestBlock title="High-priority flags">
            <DigestList
              items={digest.highPriorityFlags}
              emptyLabel="No high-priority flags this week."
            />
          </DigestBlock>
        </div>
      )}
    </section>
  );
}
