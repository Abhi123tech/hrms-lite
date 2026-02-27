# HRMS Lite (Full‑Stack Assignment)

A lightweight Human Resource Management System that lets a single admin:

- Manage employees (create, list, delete)
- Track attendance (mark Present/Absent by date, view per employee, filter by date, view totals)

The focus is on a clean, production-style architecture that matches the assignment brief.

## Tech Stack

- **Frontend**: React (Vite), Axios, Tailwind utility classes
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Pydantic
- **Database**:
  - SQLite for local development
  - PostgreSQL for production (Render)

## Features Checklist

- **Employee Management**
  - Add employee (unique Employee ID, validated email)
  - List all employees
  - Delete employee (also deletes their attendance records)
- **Attendance Management**
  - Mark attendance (date + status)
  - View attendance per employee
  - **Filter** by date range (bonus)
  - **Totals** present/absent per employee (bonus)
- **Error handling**
  - Meaningful messages and correct HTTP status codes (404, 409, 422, etc.)

## Project Structure

```text
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router registration
│   │   ├── database.py          # Engine + SessionLocal from DATABASE_URL
│   │   ├── models.py            # Employee, Attendance SQLAlchemy models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── crud.py              # Business logic helpers
│   │   ├── core/
│   │   │   └── config.py        # Settings (DATABASE_URL, CORS_ORIGINS)
│   │   └── routers/
│   │       ├── employees.py     # /employees endpoints
│   │       └── attendance.py    # /attendance endpoints
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.mts
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles.css
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── EmployeeForm.jsx
        │   ├── EmployeeList.jsx
        │   ├── AttendanceForm.jsx
        │   └── AttendanceList.jsx
        └── pages/
            ├── Employees.jsx
            └── Attendance.jsx
```

## Backend – Local Setup

From the project root:

```bash
python -m ensurepip --upgrade
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

API docs: `http://127.0.0.1:8000/docs`  
Health: `http://127.0.0.1:8000/health`

By default the backend uses SQLite (`DATABASE_URL=sqlite:///./hrms_lite.sqlite3`).  
In production you will override this with a PostgreSQL URL.

## Frontend – Local Setup

> Note: Node.js and npm must be installed locally.

```bash
cd frontend
npm install
# point VITE_API_BASE_URL to backend, e.g.:
#   VITE_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```

Frontend dev server: `http://127.0.0.1:5173/`

## API Endpoints (Summary)

- `GET  /health`
- `POST /employees`
- `GET  /employees`
- `DELETE /employees/{employee_id}`
- `POST /attendance`
- `GET  /attendance/employee/{employee_id}?from_day=YYYY-MM-DD&to_day=YYYY-MM-DD`
- `GET  /attendance/employee/{employee_id}/summary?from_day=YYYY-MM-DD&to_day=YYYY-MM-DD`

## Assumptions / Limitations

- Single admin user (no auth)
- Attendance is **unique per employee per day** (re-marking the same date updates status)
- No payroll / leave management (out of scope as per brief)

## Deployment (Render + Vercel)

### Backend on Render

1. Push this repository to GitHub.
2. Create a **Web Service** on Render pointing to the repo.
3. Add a **PostgreSQL** instance on Render and copy its connection string.
4. Set environment variables on the Web Service:
   - `DATABASE_URL=<render-postgres-connection-string>`
   - `CORS_ORIGINS=*` (or your frontend URL)
5. Configure:

   - **Build command**:

     ```bash
     python -m ensurepip --upgrade && python -m pip install -r backend/requirements.txt
     ```

   - **Start command**:

     ```bash
     python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```

### Frontend on Vercel

1. Import the same GitHub repo into Vercel (root = `frontend`).
2. Set **framework** to Vite/React if not auto-detected.
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`
4. Deploy.

Your final submission will include:

- **Live Frontend URL** (Vercel)
- **Live Backend API URL** (Render)
- **GitHub Repository Link**


