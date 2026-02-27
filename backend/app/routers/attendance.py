from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas import AttendanceCreate, AttendanceOut, AttendanceSummaryOut


router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("", response_model=AttendanceOut, status_code=201)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = crud.get_employee_by_employee_id(db, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    rec = crud.upsert_attendance(db, employee=employee, day=payload.day, status=payload.status)
    return rec


@router.get("/employee/{employee_id}", response_model=list[AttendanceOut])
def employee_attendance(
    employee_id: str,
    from_day: date | None = Query(default=None),
    to_day: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    employee = crud.get_employee_by_employee_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    return crud.list_attendance_for_employee(db, employee=employee, from_day=from_day, to_day=to_day)


@router.get("/employee/{employee_id}/summary", response_model=AttendanceSummaryOut)
def attendance_summary(
    employee_id: str,
    from_day: date | None = Query(default=None),
    to_day: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    employee = crud.get_employee_by_employee_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    present, absent = crud.attendance_summary(db, employee=employee, from_day=from_day, to_day=to_day)
    return AttendanceSummaryOut(employee_id=employee.employee_id, total_present=present, total_absent=absent)

