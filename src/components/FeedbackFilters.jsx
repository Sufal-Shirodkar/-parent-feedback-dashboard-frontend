import { EMPTY_FILTERS } from "../utils/feedback";

export default function FeedbackFilters({ filters, classes, onChange, onReset }) {
  function update(name, value) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <section className="filters" aria-label="Feedback filters">
      <div className="filter-search">
        <label htmlFor="feedback-search">Search</label>
        <input
          id="feedback-search"
          type="search"
          placeholder="Parent, student, or class"
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
        />
      </div>

      <div className="filter-grid">
        <label>
          Priority
          <select
            value={filters.priority}
            onChange={(event) => update("priority", event.target.value)}
          >
            <option value="">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="handled">Handled</option>
          </select>
        </label>

        <label>
          Class
          <select
            value={filters.classLabel}
            onChange={(event) => update("classLabel", event.target.value)}
          >
            <option value="">All</option>
            {classes.map((classLabel) => (
              <option key={classLabel} value={classLabel}>
                {classLabel}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rating
          <select
            value={filters.rating}
            onChange={(event) => update("rating", event.target.value)}
          >
            <option value="">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>

        <label>
          From
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => update("dateFrom", event.target.value)}
          />
        </label>

        <label>
          To
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => update("dateTo", event.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        className="button button-secondary"
        onClick={() => onReset(EMPTY_FILTERS)}
      >
        Clear filters
      </button>
    </section>
  );
}
