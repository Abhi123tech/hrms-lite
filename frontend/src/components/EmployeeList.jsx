import React from "react";

function EmployeeList({ employees, loading, error, onDelete }) {
  if (loading) {
    return (
      <div className="state-loading">Loading employees…</div>
    );
  }

  if (error) {
    return (
      <div className="state-error">{error}</div>
    );
  }

  if (!employees.length) {
    return (
      <div className="state-empty">
        No employees yet. Add your first employee above.
      </div>
    );
  }

  return (
    <div className="data-card">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
          </thead>
          <tbody>
          {employees.map((e) => (
            <tr key={e.employee_id}>
              <td>{e.employee_id}</td>
              <td>{e.full_name}</td>
              <td>{e.email}</td>
              <td>{e.department}</td>
              <td style={{ textAlign: "right" }}>
                <button
                  onClick={() => onDelete?.(e.employee_id)}
                  className="pill-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;

