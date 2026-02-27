import React, { useEffect, useMemo, useState } from "react";
import AttendanceForm from "../components/AttendanceForm.jsx";
import AttendanceList from "../components/AttendanceList.jsx";
import {
  attendanceSummary,
  listEmployeeAttendance,
  listEmployees,
  markAttendance,
} from "../services/api.js";

function normalizeError(err) {
  if (!err) return "Something went wrong.";
  if (err.response?.data?.detail) {
    return typeof err.response.data.detail === "string"
      ? err.response.data.detail
      : "Request failed.";
  }
  if (err.message) return err.message;
  return "Something went wrong.";
}

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listEmployees();
        setEmployees(data);
      } catch (err) {
        setError(normalizeError(err));
      }
    };
    void load();
  }, []);

  const loadAttendance = async (employeeId, range) => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (range?.fromDay) params.from_day = range.fromDay;
      if (range?.toDay) params.to_day = range.toDay;

      const [recordsData, summaryData] = await Promise.all([
        listEmployeeAttendance(employeeId, params),
        attendanceSummary(employeeId, params),
      ]);
      setRecords(recordsData);
      setSummary(summaryData);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAttendance = async (payload) => {
    await markAttendance(payload);
    await loadAttendance(payload.employee_id, { fromDay, toDay });
  };

  const handleEmployeeChange = async (e) => {
    const id = e.target.value;
    setSelectedEmployeeId(id);
    await loadAttendance(id, { fromDay, toDay });
  };

  const handleApplyFilter = async () => {
    if (!selectedEmployeeId) return;
    await loadAttendance(selectedEmployeeId, { fromDay, toDay });
  };

  const handleClearFilter = async () => {
    setFromDay("");
    setToDay("");
    if (!selectedEmployeeId) return;
    await loadAttendance(selectedEmployeeId, {});
  };

  const rangeLabel = useMemo(() => {
    if (!fromDay && !toDay) return "All time";
    return `${fromDay || "…"} → ${toDay || "…"}`;
  }, [fromDay, toDay]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Attendance</div>
        <div className="page-subtitle">
          Mark attendance daily and review patterns per employee.
        </div>
      </div>

      <AttendanceForm
        employees={employees}
        onSubmit={handleSubmitAttendance}
        onError={(err) => err && setError(normalizeError(err))}
      />

      <div className="card-inner" style={{ marginTop: 14 }}>
        <div className="page-meta-row" style={{ marginBottom: 10 }}>
          <div className="page-metric">Records</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={selectedEmployeeId}
              onChange={handleEmployeeChange}
              className="field-select"
              style={{ minWidth: 180 }}
            >
              <option value="">Select employee…</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.employee_id} — {e.full_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={fromDay}
              onChange={(e) => setFromDay(e.target.value)}
              className="field-date"
            />
            <input
              type="date"
              value={toDay}
              onChange={(e) => setToDay(e.target.value)}
              className="field-date"
            />
            <button
              onClick={() => void handleApplyFilter()}
              type="button"
              className="ghost-button"
            >
              Filter
            </button>
            <button
              onClick={() => void handleClearFilter()}
              type="button"
              className="ghost-button"
            >
              Clear
            </button>
          </div>
        </div>

        <AttendanceList
          records={records}
          summary={summary}
          loading={loading}
          error={error}
          employeeSelected={!!selectedEmployeeId}
          rangeLabel={rangeLabel}
        />
      </div>
    </div>
  );
}

export default Attendance;

