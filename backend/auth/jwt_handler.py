# ============================================================
# AI CODE TUTOR STUDIO
# auth/jwt_handler.py
# ============================================================

import os

from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from jose import jwt


# ============================================================
# LOAD ENV
# ============================================================

load_dotenv()


# ============================================================
# CONFIG
# ============================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


if not SECRET_KEY:

    raise RuntimeError(
        "JWT_SECRET_KEY is missing from .env"
    )


# ============================================================
# CREATE TOKEN
# ============================================================

def create_access_token(data: dict):

    to_encode = data.copy()


    expire = (
        datetime.now(timezone.utc)
        +
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )


    to_encode.update(
        {
            "exp": expire
        }
    )


    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


    return encoded_jwt


# ============================================================
# DECODE TOKEN
# ============================================================

def decode_access_token(token: str):

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload
