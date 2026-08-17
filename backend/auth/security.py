# ============================================================
# AI CODE TUTOR STUDIO
# auth/security.py
# ============================================================

import bcrypt


# ============================================================
# HASH PASSWORD
# ============================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode("utf-8")

    # bcrypt supports a maximum of 72 bytes
    if len(password_bytes) > 72:
        raise ValueError(
            "Password must be 72 bytes or fewer."
        )

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


# ============================================================
# VERIFY PASSWORD
# ============================================================

def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(
        password_bytes,
        hashed_bytes
    )