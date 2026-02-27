import React, { useState, useEffect } from "react";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function AttendanceForm({ employees, onSubmit, onError }) {
  const [employeeId, setEmployeeId] = useState("");
  const [day, setDay] = useState(todayISO());
  const [status, setStatus] = useState("Present");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!employeeId && employees.length) {
      setEmployeeId(employees[0].employee_id);
    }
  }, [employees, employeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      onError?.(new Error("Select an employee first."));
      return;
    }
    setSubmitting(true);
    onError?.(null);
    try {
      await onSubmit?.({ employee_id: employeeId, day, status });
    } catch (err) {
      onError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-inner">
      <div className="form-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
        <label className="field">
          <span className="field-label">Employee</span>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="field-select"
          >
            {employees.length === 0 ? (
              <option value="">Add an employee first</option>
            ) : null}
            {employees.map((e) => (
              <option key={e.employee_id} value={e.employee_id}>
                {e.employee_id} — {e.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Date</span>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
            className="field-date"
          />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="field-select"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </label>
      </div>
      <div className="form-footer">
        <p>
          Re-marking the same date will update the existing record.
        </p>
        <button
          type="submit"
          disabled={submitting || employees.length === 0}
          className="primary-button"
        >
          {submitting ? "Saving..." : "Mark Attendance"}
        </button>
      </div>
    </form>
  );
}

export default AttendanceForm;

