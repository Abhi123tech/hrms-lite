import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getHealth() {
  const res = await api.get("/health");
  return res.data;
}

export async function listEmployees() {
  const res = await api.get("/employees");
  return res.data;
}

export async function createEmployee(payload) {
  const res = await api.post("/employees", payload);
  return res.data;
}

export async function deleteEmployee(employeeId) {
  await api.delete(`/employees/${encodeURIComponent(employeeId)}`);
}

export async function markAttendance(payload) {
  const res = await api.post("/attendance", payload);
  return res.data;
}

export async function listEmployeeAttendance(employeeId, params = {}) {
  const res = await api.get(`/attendance/employee/${encodeURIComponent(employeeId)}`, {
    params,
  });
  return res.data;
}

export async function attendanceSummary(employeeId, params = {}) {
  const res = await api.get(
    `/attendance/employee/${encodeURIComponent(employeeId)}/summary`,
    { params },
  );
  return res.data;
}

