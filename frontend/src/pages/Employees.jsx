import React, { useEffect, useState } from "react";
import EmployeeForm from "../components/EmployeeForm.jsx";
import EmployeeList from "../components/EmployeeList.jsx";
import { createEmployee, deleteEmployee, listEmployees } from "../services/api.js";

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

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleCreated = async (payload) => {
    await createEmployee(payload);
    await refresh();
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm(`Delete employee ${employeeId}?`)) return;
    await deleteEmployee(employeeId);
    await refresh();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Employees</div>
        <div className="page-subtitle">
          Create and manage employee records across your organisation.
        </div>
      </div>

      <EmployeeForm
        onCreated={handleCreated}
        onError={(err) => err && setError(normalizeError(err))}
      />

      <div className="page-meta-row">
        <div className="page-metric">
          Employees in system: <span>{employees.length}</span>
        </div>
        <button
          onClick={() => void refresh()}
          className="ghost-button"
          type="button"
        >
          Refresh list
        </button>
      </div>

      <EmployeeList
        employees={employees}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Employees;

