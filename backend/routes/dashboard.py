# ============================================================
# AI CODE TUTOR STUDIO
# routes/dashboard.py
# Dashboard API
# ============================================================

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime

from db_collections import (
    users_collection,
    projects_collection,
    learning_collection
)

from auth.jwt_handler import decode_access_token


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(authorization: str):

    # --------------------------------------------------------
    # CHECK AUTHORIZATION HEADER
    # --------------------------------------------------------

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authorization token missing."
        )

    # --------------------------------------------------------
    # CHECK BEARER FORMAT
    # --------------------------------------------------------

    if not authorization.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format."
        )

    # --------------------------------------------------------
    # EXTRACT TOKEN
    # --------------------------------------------------------

    token = authorization.split(
        " ",
        1
    )[1].strip()

    if not token:

        raise HTTPException(
            status_code=401,
            detail="Token missing."
        )

    # --------------------------------------------------------
    # DECODE JWT
    # --------------------------------------------------------

    try:

        payload = decode_access_token(
            token
        )

    except Exception as error:

        print(
            "JWT decode error:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    # --------------------------------------------------------
    # CHECK PAYLOAD
    # --------------------------------------------------------

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    # --------------------------------------------------------
    # GET EMAIL
    # --------------------------------------------------------

    email = payload.get(
        "email"
    )

    if not email:

        raise HTTPException(
            status_code=401,
            detail="User information missing from token."
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

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
# SAFE NUMBER
# ============================================================

def safe_number(
    value,
    default=0
):

    try:

        if value is None:

            return default

        return float(
            value
        )

    except (
        ValueError,
        TypeError
    ):

        return default


# ============================================================
# GET DASHBOARD
# ============================================================

@router.get("/")
def get_dashboard(
    authorization: str = Header(None)
):

    print(
        "=========================================="
    )

    print(
        "DASHBOARD REQUEST"
    )

    print(
        "=========================================="
    )

    # ========================================================
    # CURRENT USER
    # ========================================================

    user = get_current_user(
        authorization
    )

    email = user.get(
        "email"
    )

    print(
        "Dashboard user:",
        email
    )


    # ========================================================
    # GET PROJECT / LEARNING RECORDS
    # ========================================================
    #
    # projects_collection is used for:
    #
    # - Continue Learning
    # - Title
    # - Step
    # - Language
    # - Individual project progress
    #
    # ========================================================

    learning_data = list(
        projects_collection.find({
            "user_email": email
        })
    )

    print(
        "Project learning records found:",
        len(learning_data)
    )


    # ========================================================
    # GET GLOBAL LEARNING STATISTICS
    # ========================================================
    #
    # learning_collection contains:
    #
    # total_seconds
    # progress
    #
    # ========================================================

    learning_record = learning_collection.find_one({
        "user_email": email
    })


    # ========================================================
    # LEARNING TIME
    # ========================================================

    total_seconds = 0

    if learning_record:

        total_seconds = safe_number(
            learning_record.get(
                "total_seconds",
                0
            )
        )

    # --------------------------------------------------------
    # PREVENT NEGATIVE VALUES
    # --------------------------------------------------------

    total_seconds = max(
        0,
        total_seconds
    )

    # --------------------------------------------------------
    # SECONDS → HOURS
    # --------------------------------------------------------

    learning_hours = round(
        total_seconds / 3600,
        1
    )


    # ========================================================
    # OVERALL PROGRESS
    # ========================================================
    #
    # Progress now comes from learning_collection.
    #
    # ========================================================

    if learning_record:

        average_progress = safe_number(
            learning_record.get(
                "progress",
                0
            )
        )

    else:

        average_progress = 0


    # --------------------------------------------------------
    # KEEP PROGRESS BETWEEN 0 AND 100
    # --------------------------------------------------------

    average_progress = max(
        0,
        min(
            100,
            average_progress
        )
    )

    average_progress = round(
        average_progress
    )


    # ========================================================
    # CONTINUE LEARNING
    # ========================================================

    learning = []


    for item in learning_data:

        progress = safe_number(
            item.get(
                "progress",
                0
            )
        )

        # ----------------------------------------------------
        # KEEP PROJECT PROGRESS BETWEEN 0 AND 100
        # ----------------------------------------------------

        progress = max(
            0,
            min(
                100,
                progress
            )
        )

        learning.append({

            "title":
                item.get(
                    "title",
                    "Untitled"
                ),

            "step":
                item.get(
                    "step",
                    "Step 1 of 1"
                ),

            "progress":
                round(
                    progress
                ),

            "language":
                item.get(
                    "language",
                    "Code"
                )

        })


    # ========================================================
    # SORT CONTINUE LEARNING
    # ========================================================

    learning.sort(

        key=lambda item:
            item.get(
                "progress",
                0
            ),

        reverse=True

    )


    # ========================================================
    # USER INFORMATION
    # ========================================================

    user_data = {

        "name":
            user.get(
                "name",
                user.get(
                    "username",
                    "Developer"
                )
            ),

        "email":
            user.get(
                "email",
                ""
            )

    }


    # ========================================================
    # FINAL DASHBOARD RESPONSE
    # ========================================================

    response = {

        "success": True,

        "user":
            user_data,

        "statistics": {

            "learning_time":
                f"{learning_hours:g}h",

            "progress":
                average_progress

        },

        "learning":
            learning[:3]

    }


    # ========================================================
    # DEBUG
    # ========================================================

    print(
        "=========================================="
    )

    print(
        "DASHBOARD STATISTICS"
    )

    print(
        "=========================================="
    )

    print(
        "Learning Time:",
        f"{learning_hours:g}h"
    )

    print(
        "Progress:",
        f"{average_progress}%"
    )

    print(
        "Continue Learning:",
        len(
            learning[:3]
        )
    )

    print(
        "=========================================="
    )


    return response


# ============================================================
# SAVE WORKSPACE LEARNING SESSION
# ============================================================


class LearningSessionRequest(BaseModel):

    learning_minutes: float = 0

    progress: float = 0

    title: str = "Workspace Learning"

    step: str = "Step 1 of 1"

    language: str = "Code"


# ============================================================
# SAVE LEARNING SESSION
# ============================================================

@router.post("/learning-session")
def save_learning_session(

    request: LearningSessionRequest,

    authorization: str = Header(None)

):

    # ========================================================
    # GET CURRENT USER
    # ========================================================

    user = get_current_user(
        authorization
    )

    email = user.get(
        "email"
    )


    # ========================================================
    # CLEAN LEARNING MINUTES
    # ========================================================

    learning_minutes = max(

        0,

        safe_number(
            request.learning_minutes
        )

    )


    # ========================================================
    # CLEAN PROGRESS
    # ========================================================

    progress = max(

        0,

        min(

            100,

            safe_number(
                request.progress
            )

        )

    )


    # ========================================================
    # FIND EXISTING PROJECT
    # ========================================================

    existing = projects_collection.find_one({

        "user_email":
            email,

        "title":
            request.title

    })


    # ========================================================
    # UPDATE EXISTING PROJECT
    # ========================================================

    if existing:

        projects_collection.update_one(

            {
                "_id":
                    existing["_id"]
            },

            {
                "$set": {

                    "learning_minutes":
                        learning_minutes,

                    "progress":
                        progress,

                    "step":
                        request.step,

                    "language":
                        request.language,

                    "updated_at":
                        datetime.utcnow()

                }
            }

        )

        record_id = str(
            existing["_id"]
        )


    # ========================================================
    # CREATE NEW PROJECT
    # ========================================================

    else:

        result = projects_collection.insert_one({

            "user_email":
                email,

            "title":
                request.title,

            "learning_minutes":
                learning_minutes,

            "progress":
                progress,

            "step":
                request.step,

            "language":
                request.language,

            "created_at":
                datetime.utcnow(),

            "updated_at":
                datetime.utcnow()

        })

        record_id = str(
            result.inserted_id
        )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "success":
            True,

        "message":
            "Learning session saved.",

        "learning_minutes":
            learning_minutes,

        "progress":
            round(
                progress
            ),

        "id":
            record_id

    }

