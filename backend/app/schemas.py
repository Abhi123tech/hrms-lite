from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AttendanceStatus(str, Enum):
    Present = "Present"
    Absent = "Absent"


class EmployeeCreate(BaseModel):
    employee_id: str = Field(min_length=1, max_length=64)
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    department: str = Field(min_length=1, max_length=120)


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    created_at: datetime


class AttendanceCreate(BaseModel):
    employee_id: str = Field(min_length=1, max_length=64)
    day: date
    status: AttendanceStatus


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day: date
    status: AttendanceStatus
    created_at: datetime


class AttendanceSummaryOut(BaseModel):
    employee_id: str
    total_present: int
    total_absent: int

