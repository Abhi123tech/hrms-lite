import React, { useState } from "react";
import Employees from "./pages/Employees.jsx";
import Attendance from "./pages/Attendance.jsx";

function App() {
  const [tab, setTab] = useState("employees");

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo-row">
            <div className="app-logo">
              <span>HR</span>
            </div>
            <div>
              <div className="app-title">HRMS Lite</div>
              <div className="app-subtitle">Employee &amp; Attendance Management</div>
            </div>
          </div>
          <div className="app-header-meta" />
        </div>
      </header>

      <main className="app-main">
        <div className="app-shell">
          <aside className="app-sidebar">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Navigation</div>
                <div className="card-subtitle">Switch between core workflows</div>
              </div>
              <div className="nav-list">
                <button
                  onClick={() => setTab("employees")}
                  className={
                    tab === "employees" ? "nav-item nav-item-active" : "nav-item"
                  }
                >
                  <div className="nav-label">Employees</div>
                  <div className="nav-description">Add, view, and delete employees.</div>
                </button>
                <button
                  onClick={() => setTab("attendance")}
                  className={
                    tab === "attendance" ? "nav-item nav-item-active" : "nav-item"
                  }
                >
                  <div className="nav-label">Attendance</div>
                  <div className="nav-description">
                    Mark and review daily attendance.
                  </div>
                </button>
              </div>
            </div>

          </aside>

          <section className="app-content">
            <div className="card card-main">
              {tab === "employees" ? <Employees /> : <Attendance />}
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <div>HRMS Lite</div>
          <div>React · FastAPI · PostgreSQL</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

