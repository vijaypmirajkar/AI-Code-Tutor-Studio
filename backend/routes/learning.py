# ============================================================
# AI CODE TUTOR STUDIO
# routes/learning.py
# MongoDB Learning Statistics
# ============================================================

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime

from db_collections import users_collection, learning_collection
from auth.jwt_handler import decode_access_token


router = APIRouter(
    prefix="/learning",
    tags=["Learning"]
)


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(authorization: str):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token missing."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format."
        )

    token = authorization.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Token missing."
        )

    try:
        payload = decode_access_token(token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    email = payload.get("email")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="User information missing from token."
        )

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return user


# ============================================================
# SAVE LEARNING SESSION
# ============================================================

@router.post("/session")
def save_learning_session(
    data: dict,
    authorization: str = Header(None)
):

    user = get_current_user(
        authorization
    )

    email = user["email"]

    # --------------------------------------------------------
    # GET VALUES FROM WORKSPACE
    # --------------------------------------------------------

    duration_seconds = data.get(
        "duration_seconds",
        0
    )

    progress = data.get(
        "progress",
        0
    )

    # --------------------------------------------------------
    # SAFE VALUES
    # --------------------------------------------------------

    try:
        duration_seconds = float(
            duration_seconds
        )
    except (ValueError, TypeError):
        duration_seconds = 0

    try:
        progress = float(
            progress
        )
    except (ValueError, TypeError):
        progress = 0

    duration_seconds = max(
        0,
        duration_seconds
    )

    progress = max(
        0,
        min(100, progress)
    )

    # --------------------------------------------------------
    # FIND EXISTING USER LEARNING DATA
    # --------------------------------------------------------

    existing = learning_collection.find_one({
        "user_email": email
    })

    # --------------------------------------------------------
    # CREATE USER RECORD
    # --------------------------------------------------------

    if not existing:

        learning_collection.insert_one({

            "user_email": email,

            "total_seconds":
                duration_seconds,

            "progress":
                round(progress),

            "updated_at":
                datetime.utcnow()

        })

    # --------------------------------------------------------
    # UPDATE USER RECORD
    # --------------------------------------------------------

    else:

        old_seconds = existing.get(
            "total_seconds",
            0
        )

        old_progress = existing.get(
            "progress",
            0
        )

        try:
            old_seconds = float(
                old_seconds
            )
        except (ValueError, TypeError):
            old_seconds = 0

        try:
            old_progress = float(
                old_progress
            )
        except (ValueError, TypeError):
            old_progress = 0

        # Add new workspace time
        new_seconds = (
            old_seconds +
            duration_seconds
        )

        # Keep highest progress
        new_progress = max(
            old_progress,
            progress
        )

        learning_collection.update_one(

            {
                "user_email": email
            },

            {
                "$set": {

                    "total_seconds":
                        new_seconds,

                    "progress":
                        round(
                            new_progress
                        ),

                    "updated_at":
                        datetime.utcnow()

                }
            }

        )

    return {

        "success": True,

        "message":
            "Learning session saved."

    }


# ============================================================
# GET LEARNING STATISTICS
# ============================================================

@router.get("/")
def get_learning_statistics(
    authorization: str = Header(None)
):

    user = get_current_user(
        authorization
    )

    email = user["email"]

    learning = learning_collection.find_one({
        "user_email": email
    })

    if not learning:

        return {

            "success": True,

            "learning_time":
                "0h",

            "progress":
                0

        }

    total_seconds = learning.get(
        "total_seconds",
        0
    )

    try:
        total_seconds = float(
            total_seconds
        )
    except (ValueError, TypeError):
        total_seconds = 0

    total_hours = round(
        total_seconds / 3600,
        1
    )

    progress = learning.get(
        "progress",
        0
    )

    return {

        "success": True,

        "learning_time":
            f"{total_hours:g}h",

        "progress":
            round(progress)

    }