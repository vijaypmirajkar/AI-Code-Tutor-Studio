# ============================================================
# AI CODE TUTOR STUDIO
# routes/dashboard.py
# Dashboard API
# ============================================================

from fastapi import APIRouter, HTTPException, Header

from db_collections import users_collection, projects_collection
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

    token = authorization.split(
        " ",
        1
    )[1].strip()

    if not token:

        raise HTTPException(
            status_code=401,
            detail="Token missing."
        )

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

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    email = payload.get(
        "email"
    )

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
# SAFE NUMBER
# ============================================================

def safe_number(
    value,
    default=0
):

    try:

        if value is None:
            return default

        return float(value)

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
    # GET LEARNING DATA
    # ========================================================
    #
    # Projects are NO LONGER returned as a statistic.
    # Concepts are completely removed.
    #
    # Existing learning information is still read from
    # MongoDB so Learning Hours and Progress can work.
    #
    # ========================================================

    learning_data = list(
        projects_collection.find({
            "user_email": email
        })
    )

    print(
        "Learning records found:",
        len(learning_data)
    )


    # ========================================================
    # LEARNING TIME
    # ========================================================

    learning_minutes = 0

    for item in learning_data:

        value = item.get(
            "learning_minutes",
            item.get(
                "minutes",
                0
            )
        )

        learning_minutes += safe_number(
            value
        )


    # --------------------------------------------------------
    # MINUTES → HOURS
    # --------------------------------------------------------

    learning_hours = round(
        learning_minutes / 60,
        1
    )


    # ========================================================
    # OVERALL PROGRESS
    # ========================================================

    progress_values = []


    for item in learning_data:

        progress = safe_number(
            item.get(
                "progress",
                0
            )
        )


        # Keep between 0 and 100

        progress = max(
            0,
            min(
                100,
                progress
            )
        )


        progress_values.append(
            progress
        )


    # ========================================================
    # AVERAGE PROGRESS
    # ========================================================

    if progress_values:

        average_progress = round(
            sum(progress_values)
            /
            len(progress_values)
        )

    else:

        average_progress = 0


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
    # SORT LEARNING
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
        "=========================================="
    )


    return response