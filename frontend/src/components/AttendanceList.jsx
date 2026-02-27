import React from "react";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateTime(dt) {
  return new Date(dt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badge(status) {
  const base =
    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border";
  if (status === "Present") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        Present
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
      Absent
    </span>
  );
}

function AttendanceList({
  records,
  summary,
  loading,
  error,
  employeeSelected,
  rangeLabel,
}) {
  if (!employeeSelected) {
    return (
      <div className="state-empty">
        Select an employee to view attendance records.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="state-loading">Loading attendance…</div>
    );
  }

  if (error) {
    return (
      <div className="state-error">{error}</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Present</div>
          <div className="kpi-value">
            {summary ? summary.total_present : "—"}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Absent</div>
          <div className="kpi-value">
            {summary ? summary.total_absent : "—"}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Selected Range</div>
          <div className="kpi-range">{rangeLabel}</div>
        </div>
      </div>

      <div className="data-card">
        {records.length === 0 ? (
          <div className="state-empty">
            No attendance records yet for this employee.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Marked At</th>
              </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.day)}</td>
                    <td>{badge(r.status)}</td>
                    <td>{formatDateTime(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceList;

