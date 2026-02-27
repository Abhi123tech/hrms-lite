import React, { useState } from "react";

function EmployeeForm({ onCreated, onError }) {
  const [form, setForm] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    onError?.(null);
    try {
      await onCreated?.({
        employee_id: form.employee_id.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
      });
      setForm({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
      });
    } catch (err) {
      onError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-inner">
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Employee ID</span>
          <input
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            required
            placeholder="EMP-001"
            className="field-input"
          />
        </label>
        <label className="field">
          <span className="field-label">Full Name</span>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            placeholder="Ayesha Khan"
            className="field-input"
          />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="ayesha@company.com"
            className="field-input"
          />
        </label>
        <label className="field">
          <span className="field-label">Department</span>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            placeholder="Engineering"
            className="field-input"
          />
        </label>
      </div>
      <div className="form-footer">
        <p>
          All fields are required. Email and Employee ID must be unique.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="primary-button"
        >
          {submitting ? "Saving..." : "Add Employee"}
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;

