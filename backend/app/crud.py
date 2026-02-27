from __future__ import annotations

from datetime import date

from sqlalchemy import and_, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .models import Attendance, Employee
from .schemas import AttendanceStatus, EmployeeCreate


def create_employee(db: Session, payload: EmployeeCreate) -> Employee:
    employee = Employee(
        employee_id=payload.employee_id.strip(),
        full_name=payload.full_name.strip(),
        email=str(payload.email).strip().lower(),
        department=payload.department.strip(),
    )
    db.add(employee)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise e
    db.refresh(employee)
    return employee


def list_employees(db: Session) -> list[Employee]:
    stmt = select(Employee).order_by(Employee.created_at.desc())
    return list(db.scalars(stmt).all())


def get_employee_by_employee_id(db: Session, employee_id: str) -> Employee | None:
    stmt = select(Employee).where(Employee.employee_id == employee_id)
    return db.scalars(stmt).first()


def delete_employee(db: Session, employee: Employee) -> None:
    db.delete(employee)
    db.commit()


def upsert_attendance(
    db: Session, *, employee: Employee, day: date, status: AttendanceStatus
) -> Attendance:
    existing = db.scalars(
        select(Attendance).where(
            and_(Attendance.employee_id_fk == employee.id, Attendance.day == day)
        )
    ).first()
    if existing:
        existing.status = status.value
        db.commit()
        db.refresh(existing)
        return existing

    rec = Attendance(employee_id_fk=employee.id, day=day, status=status.value)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def list_attendance_for_employee(
    db: Session,
    *,
    employee: Employee,
    from_day: date | None = None,
    to_day: date | None = None,
) -> list[Attendance]:
    stmt = select(Attendance).where(Attendance.employee_id_fk == employee.id)
    if from_day:
        stmt = stmt.where(Attendance.day >= from_day)
    if to_day:
        stmt = stmt.where(Attendance.day <= to_day)
    stmt = stmt.order_by(Attendance.day.desc(), Attendance.created_at.desc())
    return list(db.scalars(stmt).all())


def attendance_summary(
    db: Session, *, employee: Employee, from_day: date | None = None, to_day: date | None = None
) -> tuple[int, int]:
    base = select(Attendance.status, func.count(Attendance.id)).where(
        Attendance.employee_id_fk == employee.id
    )
    if from_day:
        base = base.where(Attendance.day >= from_day)
    if to_day:
        base = base.where(Attendance.day <= to_day)
    base = base.group_by(Attendance.status)

    present = 0
    absent = 0
    for status, count in db.execute(base).all():
        if status == AttendanceStatus.Present.value:
            present = int(count)
        elif status == AttendanceStatus.Absent.value:
            absent = int(count)
    return present, absent

