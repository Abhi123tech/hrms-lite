from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas import EmployeeCreate, EmployeeOut


router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
  try:
    employee = crud.create_employee(db, payload)
  except IntegrityError:
    raise HTTPException(
      status_code=409,
      detail="Employee ID or email already exists.",
    )
  return employee


@router.get("", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
  return crud.list_employees(db)


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
  employee = crud.get_employee_by_employee_id(db, employee_id)
  if not employee:
    raise HTTPException(status_code=404, detail="Employee not found.")
  crud.delete_employee(db, employee)
  return None

