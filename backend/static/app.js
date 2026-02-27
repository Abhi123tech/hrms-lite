const state = {
  employees: [],
  selectedEmployeeId: null,
  attendance: [],
  filterFrom: null,
  filterTo: null,
};

function qs(id) {
  return document.getElementById(id);
}

function setBanner(type, message) {
  const el = qs("banner");
  if (!message) {
    el.className = "hidden rounded-2xl border px-4 py-3 text-sm";
    el.textContent = "";
    return;
  }
  const styles =
    type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-slate-50 border-slate-200 text-slate-800";
  el.className = `rounded-2xl border px-4 py-3 text-sm ${styles}`;
  el.textContent = message;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      `Request failed (${res.status})`;
    const err = new Error(typeof msg === "string" ? msg : "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

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
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";
  if (status === "Present") return `<span class="${base} bg-emerald-50 text-emerald-700 border border-emerald-200">Present</span>`;
  return `<span class="${base} bg-red-50 text-red-700 border border-red-200">Absent</span>`;
}

function setTab(tab) {
  const btnEmp = qs("tabEmployees");
  const btnAtt = qs("tabAttendance");
  const viewEmp = qs("viewEmployees");
  const viewAtt = qs("viewAttendance");

  const active =
    "rounded-xl border bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white";
  const inactive =
    "rounded-xl border bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-50";

  if (tab === "employees") {
    btnEmp.className = active;
    btnAtt.className = inactive;
    viewEmp.classList.remove("hidden");
    viewAtt.classList.add("hidden");
  } else {
    btnAtt.className = active;
    btnEmp.className = inactive;
    viewAtt.classList.remove("hidden");
    viewEmp.classList.add("hidden");
  }
  setBanner(null, null);
}

function setLoading(id, on) {
  const el = qs(id);
  if (!el) return;
  el.classList.toggle("hidden", !on);
}

function setBlock(id, show) {
  const el = qs(id);
  if (!el) return;
  el.classList.toggle("hidden", !show);
}

function renderEmployeesTable() {
  qs("metricEmployees").textContent = String(state.employees.length);

  const tbody = qs("employeesTbody");
  tbody.innerHTML = "";

  if (state.employees.length === 0) {
    setBlock("employeesEmpty", true);
    return;
  }
  setBlock("employeesEmpty", false);

  for (const e of state.employees) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-3 font-medium text-slate-900">${escapeHtml(
        e.employee_id
      )}</td>
      <td class="px-4 py-3">${escapeHtml(e.full_name)}</td>
      <td class="px-4 py-3 text-slate-700">${escapeHtml(e.email)}</td>
      <td class="px-4 py-3">${escapeHtml(e.department)}</td>
      <td class="px-4 py-3 text-right">
        <button data-employee-id="${escapeAttr(
          e.employee_id
        )}" class="btnDelete rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const employeeId = btn.getAttribute("data-employee-id");
      if (!employeeId) return;
      const ok = confirm(`Delete employee ${employeeId}? This will also delete their attendance records.`);
      if (!ok) return;
      try {
        setBanner(null, null);
        await api(`/api/employees/${encodeURIComponent(employeeId)}`, {
          method: "DELETE",
        });
        await loadEmployees({ keepSelection: true });
        setBanner("success", "Employee deleted.");
      } catch (e) {
        setBanner("error", normalizeError(e));
      }
    });
  });
}

function renderAttendanceEmployeeSelect() {
  const sel = qs("attendanceEmployee");
  sel.innerHTML = "";

  if (state.employees.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Add an employee first";
    sel.appendChild(opt);
    sel.disabled = true;
    return;
  }
  sel.disabled = false;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select employee…";
  sel.appendChild(placeholder);

  for (const e of state.employees) {
    const opt = document.createElement("option");
    opt.value = e.employee_id;
    opt.textContent = `${e.employee_id} — ${e.full_name}`;
    sel.appendChild(opt);
  }

  if (state.selectedEmployeeId) {
    sel.value = state.selectedEmployeeId;
  }
}

function renderAttendanceTable() {
  qs("metricRecords").textContent = state.selectedEmployeeId
    ? String(state.attendance.length)
    : "—";

  const tbody = qs("attendanceTbody");
  tbody.innerHTML = "";

  if (!state.selectedEmployeeId) {
    setBlock("attendanceEmpty", true);
    qs("attendanceEmpty").textContent = "Select an employee to view attendance records.";
    return;
  }

  if (state.attendance.length === 0) {
    setBlock("attendanceEmpty", true);
    qs("attendanceEmpty").textContent =
      "No attendance records yet for the selected employee.";
    return;
  }
  setBlock("attendanceEmpty", false);

  for (const r of state.attendance) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-3">${formatDate(r.day)}</td>
      <td class="px-4 py-3">${badge(r.status)}</td>
      <td class="px-4 py-3 text-slate-600">${formatDateTime(r.created_at)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function setSummary(present, absent) {
  qs("summaryPresent").textContent = present ?? "—";
  qs("summaryAbsent").textContent = absent ?? "—";

  const from = state.filterFrom;
  const to = state.filterTo;
  if (!from && !to) {
    qs("summaryRange").textContent = "All time";
  } else {
    qs("summaryRange").textContent = `${from || "…"} → ${to || "…"}`;
  }
}

async function loadHealth() {
  try {
    await api("/api/health");
    qs("healthDot").className = "h-2 w-2 rounded-full bg-emerald-500";
    qs("healthText").textContent = "API online";
  } catch {
    qs("healthDot").className = "h-2 w-2 rounded-full bg-red-500";
    qs("healthText").textContent = "API offline";
  }
}

async function loadEmployees({ keepSelection } = {}) {
  setLoading("employeesLoading", true);
  setBlock("employeesError", false);
  try {
    const employees = await api("/api/employees");
    state.employees = employees;
    qs("employeesError").textContent = "";

    if (!keepSelection) state.selectedEmployeeId = null;
    if (
      keepSelection &&
      state.selectedEmployeeId &&
      !state.employees.some((e) => e.employee_id === state.selectedEmployeeId)
    ) {
      state.selectedEmployeeId = null;
    }

    renderEmployeesTable();
    renderAttendanceEmployeeSelect();
  } catch (e) {
    setBlock("employeesError", true);
    qs("employeesError").textContent = normalizeError(e);
    state.employees = [];
    renderEmployeesTable();
    renderAttendanceEmployeeSelect();
  } finally {
    setLoading("employeesLoading", false);
  }
}

function buildAttendanceQuery() {
  const params = new URLSearchParams();
  if (state.filterFrom) params.set("from_day", state.filterFrom);
  if (state.filterTo) params.set("to_day", state.filterTo);
  const q = params.toString();
  return q ? `?${q}` : "";
}

async function loadAttendanceAndSummary() {
  setLoading("attendanceLoading", true);
  setBlock("attendanceError", false);
  try {
    if (!state.selectedEmployeeId) {
      state.attendance = [];
      renderAttendanceTable();
      setSummary(null, null);
      return;
    }
    const q = buildAttendanceQuery();
    const [records, summary] = await Promise.all([
      api(`/api/employees/${encodeURIComponent(state.selectedEmployeeId)}/attendance${q}`),
      api(
        `/api/employees/${encodeURIComponent(
          state.selectedEmployeeId
        )}/attendance/summary${q}`
      ),
    ]);
    state.attendance = records;
    renderAttendanceTable();
    setSummary(summary.total_present, summary.total_absent);
  } catch (e) {
    setBlock("attendanceError", true);
    qs("attendanceError").textContent = normalizeError(e);
  } finally {
    setLoading("attendanceLoading", false);
  }
}

function normalizeError(e) {
  if (!e) return "Something went wrong.";
  if (typeof e.message === "string") return e.message;
  return "Something went wrong.";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s) {
  return escapeHtml(s).replaceAll("`", "&#096;");
}

function setTodayDefault() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  qs("attendanceDay").value = `${yyyy}-${mm}-${dd}`;
}

function bindEvents() {
  qs("tabEmployees").addEventListener("click", () => setTab("employees"));
  qs("tabAttendance").addEventListener("click", () => setTab("attendance"));

  qs("btnRefreshEmployees").addEventListener("click", () =>
    loadEmployees({ keepSelection: true })
  );
  qs("btnRefreshAttendance").addEventListener("click", () =>
    loadAttendanceAndSummary()
  );

  qs("formAddEmployee").addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const payload = {
      employee_id: String(fd.get("employee_id") || "").trim(),
      full_name: String(fd.get("full_name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      department: String(fd.get("department") || "").trim(),
    };

    try {
      setBanner(null, null);
      await api("/api/employees", { method: "POST", body: JSON.stringify(payload) });
      evt.target.reset();
      await loadEmployees({ keepSelection: true });
      setBanner("success", "Employee added.");
    } catch (e) {
      setBanner("error", normalizeError(e));
    }
  });

  qs("attendanceEmployee").addEventListener("change", async (evt) => {
    state.selectedEmployeeId = evt.target.value || null;
    await loadAttendanceAndSummary();
  });

  qs("formMarkAttendance").addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const employee_id = qs("attendanceEmployee").value;
    const day = qs("attendanceDay").value;
    const status = qs("attendanceStatus").value;

    if (!employee_id) {
      setBanner("error", "Select an employee first.");
      return;
    }

    try {
      setBanner(null, null);
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ employee_id, day, status }),
      });
      setBanner("success", "Attendance saved.");
      await loadAttendanceAndSummary();
    } catch (e) {
      setBanner("error", normalizeError(e));
    }
  });

  qs("btnApplyFilter").addEventListener("click", async () => {
    state.filterFrom = qs("filterFrom").value || null;
    state.filterTo = qs("filterTo").value || null;
    await loadAttendanceAndSummary();
  });

  qs("btnClearFilter").addEventListener("click", async () => {
    qs("filterFrom").value = "";
    qs("filterTo").value = "";
    state.filterFrom = null;
    state.filterTo = null;
    await loadAttendanceAndSummary();
  });
}

async function init() {
  bindEvents();
  setTab("employees");
  setTodayDefault();
  await loadHealth();
  await loadEmployees({ keepSelection: false });
  renderAttendanceEmployeeSelect();
  renderAttendanceTable();
  setSummary(null, null);
}

init();

