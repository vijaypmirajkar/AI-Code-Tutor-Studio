# ============================================================
# AI CODE TUTOR STUDIO
# models/schemas.py
# ============================================================

from pydantic import BaseModel, EmailStr
from typing import List


# ============================================================
# ANALYZE
# ============================================================

class AnalyzeRequest(BaseModel):

    code: str

    language: str = "Python"

    level: str = "Beginner"


class Step(BaseModel):

    step: int

    title: str

    description: str


class AnalyzeResponse(BaseModel):

    title: str

    purpose: str

    steps: List[Step]

    algorithm: str

    time_complexity: str

    space_complexity: str

    errors: List[str]


# ============================================================
# CHAT
# ============================================================

class ChatRequest(BaseModel):

    question: str

    code: str

    language: str = "Python"


class ChatResponse(BaseModel):

    answer: str


# ============================================================
# ERROR ANALYSIS
# ============================================================

class ErrorRequest(BaseModel):

    code: str

    language: str = "Python"

    level: str = "Beginner"


class ErrorResponse(BaseModel):

    success: bool

    result: str


# ============================================================
# ALGORITHM ANALYSIS
# ============================================================

class AlgorithmRequest(BaseModel):

    code: str

    language: str = "Python"


class AlgorithmResponse(BaseModel):

    success: bool

    result: str


# ============================================================
# AUTHENTICATION
# ============================================================

class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str