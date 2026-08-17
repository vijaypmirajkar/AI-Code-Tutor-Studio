# ============================================================
# AI CODE TUTOR STUDIO
# auth/auth.py
# ============================================================

from fastapi import APIRouter, HTTPException, Header

from google.oauth2 import id_token
from google.auth.transport import requests

from auth.security import hash_password, verify_password
from auth.jwt_handler import (
    create_access_token,
    decode_access_token
)

from db_collections import users_collection
from models.schemas import RegisterRequest, LoginRequest


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# GOOGLE CLIENT ID
# ============================================================

GOOGLE_CLIENT_ID = (
    "221221986548-23g9vo9mm06mtuo6hhohsmg8ujseudh5"
    ".apps.googleusercontent.com"
)


# ============================================================
# DEFAULT NOTIFICATION SETTINGS
# ============================================================

DEFAULT_NOTIFICATIONS = {
    "learningNotifications": True,
    "aiNotifications": True,
    "projectNotifications": True,
    "emailNotifications": False
}


# ============================================================
# AUTH STATUS
# ============================================================

@router.get("/")
async def auth_status():

    return {
        "message": "Authentication API Ready"
    }


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
async def register(user: RegisterRequest):

    existing = users_collection.find_one(
        {
            "email": user.email
        }
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(
            user.password
        ),
        "auth_provider": "local",

        # ----------------------------------------
        # DEFAULT NOTIFICATIONS
        # ----------------------------------------

        "notifications": DEFAULT_NOTIFICATIONS.copy()
    }

    users_collection.insert_one(
        new_user
    )

    return {
        "success": True,
        "message": "User registered successfully."
    }


# ============================================================
# EMAIL LOGIN
# ============================================================

@router.post("/login")
async def login(user: LoginRequest):

    existing_user = users_collection.find_one(
        {
            "email": user.email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # Google accounts don't have a password
    if "password" not in existing_user:

        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses Google Login. "
                "Please continue with Google."
            )
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    # ----------------------------------------
    # CREATE DEFAULT NOTIFICATIONS
    # FOR OLD USERS
    # ----------------------------------------

    if "notifications" not in existing_user:

        users_collection.update_one(
            {
                "_id": existing_user["_id"]
            },
            {
                "$set": {
                    "notifications":
                        DEFAULT_NOTIFICATIONS.copy()
                }
            }
        )

    token = create_access_token(
        {
            "email": existing_user["email"],
            "name": existing_user.get(
                "name",
                "Developer"
            )
        }
    )

    return {

        "success": True,

        "access_token": token,

        "token_type": "bearer",

        "user": {

            "name": existing_user.get(
                "name",
                "Developer"
            ),

            "email": existing_user["email"]

        }

    }


# ============================================================
# GOOGLE LOGIN
# ============================================================

@router.post("/google")
async def google_login(data: dict):

    credential = data.get(
        "credential"
    )

    if not credential:

        raise HTTPException(
            status_code=400,
            detail="Google credential missing."
        )

    # --------------------------------------------------------
    # VERIFY GOOGLE TOKEN
    # --------------------------------------------------------

    try:

        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except Exception as error:

        print(
            "GOOGLE TOKEN ERROR:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid Google authentication."
        )

    # --------------------------------------------------------
    # GOOGLE DATA
    # --------------------------------------------------------

    google_id = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name")

    if not google_id or not email:

        raise HTTPException(
            status_code=400,
            detail="Google account information missing."
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    if not existing_user:

        new_user = {

            "name":
                name or email.split("@")[0],

            "email":
                email,

            "google_id":
                google_id,

            "auth_provider":
                "google",

            # ----------------------------------------
            # DEFAULT NOTIFICATIONS
            # ----------------------------------------

            "notifications":
                DEFAULT_NOTIFICATIONS.copy()
        }

        result = users_collection.insert_one(
            new_user
        )

        existing_user = users_collection.find_one(
            {
                "_id":
                    result.inserted_id
            }
        )

    # --------------------------------------------------------
    # UPDATE GOOGLE INFORMATION
    # --------------------------------------------------------

    else:

        update_data = {}

        if not existing_user.get(
            "google_id"
        ):

            update_data[
                "google_id"
            ] = google_id

        if not existing_user.get(
            "auth_provider"
        ):

            update_data[
                "auth_provider"
            ] = "google"

        # ----------------------------------------
        # ADD NOTIFICATIONS TO OLD USERS
        # ----------------------------------------

        if "notifications" not in existing_user:

            update_data[
                "notifications"
            ] = DEFAULT_NOTIFICATIONS.copy()

        if update_data:

            users_collection.update_one(
                {
                    "_id":
                        existing_user["_id"]
                },
                {
                    "$set":
                        update_data
                }
            )

            existing_user = users_collection.find_one(
                {
                    "_id":
                        existing_user["_id"]
                }
            )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    token = create_access_token(
        {
            "email":
                existing_user["email"],

            "name":
                existing_user.get(
                    "name",
                    "Developer"
                )
        }
    )

    return {

        "success": True,

        "message":
            "Google login successful.",

        "access_token":
            token,

        "token_type":
            "bearer",

        "user": {

            "name":
                existing_user.get(
                    "name",
                    "Developer"
                ),

            "email":
                existing_user["email"]

        }

    }


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get("/me")
async def get_current_user(
    authorization: str = Header(
        default=None
    )
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authorization token missing."
        )

    try:

        # ----------------------------------------------------
        # EXTRACT TOKEN
        # ----------------------------------------------------

        if authorization.lower().startswith(
            "bearer "
        ):

            token = authorization[7:].strip()

        else:

            token = authorization.strip()

        if not token:

            raise HTTPException(
                status_code=401,
                detail="Authorization token missing."
            )

        # ----------------------------------------------------
        # DECODE TOKEN
        # ----------------------------------------------------

        payload = decode_access_token(
            token
        )

        # ----------------------------------------------------
        # EMAIL
        # ----------------------------------------------------

        email = payload.get(
            "email"
        )

        if not email:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------

        user = users_collection.find_one(
            {
                "email": email
            }
        )

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # ----------------------------------------------------
        # RETURN USER
        # ----------------------------------------------------

        return {

            "success": True,

            "user": {

                "name":
                    user.get(
                        "name",
                        "Developer"
                    ),

                "email":
                    user.get(
                        "email",
                        ""
                    ),

                "auth_provider":
                    user.get(
                        "auth_provider",
                        "local"
                    )

            }

        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            "AUTH ME ERROR:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/profile")
async def update_profile(
    data: dict,
    authorization: str = Header(
        default=None
    )
):

    print(
        "========================================"
    )

    print(
        "PROFILE UPDATE REQUEST"
    )

    print(
        "AUTH HEADER:",
        authorization
    )

    print(
        "========================================"
    )

    # --------------------------------------------------------
    # CHECK AUTHORIZATION
    # --------------------------------------------------------

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authorization token missing."
        )

    try:

        # ----------------------------------------------------
        # EXTRACT TOKEN
        # ----------------------------------------------------

        if authorization.lower().startswith(
            "bearer "
        ):

            token = authorization[7:].strip()

        else:

            token = authorization.strip()

        if not token:

            raise HTTPException(
                status_code=401,
                detail="Authorization token missing."
            )

        # ----------------------------------------------------
        # DECODE JWT
        # ----------------------------------------------------

        payload = decode_access_token(
            token
        )

        print(
            "JWT PAYLOAD:",
            payload
        )

        # ----------------------------------------------------
        # GET EMAIL
        # ----------------------------------------------------

        email = payload.get(
            "email"
        )

        if not email:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        # ----------------------------------------------------
        # GET NAME
        # ----------------------------------------------------

        name = data.get(
            "name",
            ""
        )

        if not isinstance(
            name,
            str
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid name."
            )

        name = name.strip()

        if not name:

            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty."
            )

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------

        existing_user = users_collection.find_one(
            {
                "email": email
            }
        )

        if not existing_user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # ----------------------------------------------------
        # UPDATE MONGODB
        # ----------------------------------------------------

        result = users_collection.update_one(
            {
                "email": email
            },
            {
                "$set": {
                    "name": name
                }
            }
        )

        print(
            "MONGODB UPDATE MATCHED:",
            result.matched_count
        )

        print(
            "MONGODB UPDATE MODIFIED:",
            result.modified_count
        )

        # ----------------------------------------------------
        # GET UPDATED USER
        # ----------------------------------------------------

        updated_user = users_collection.find_one(
            {
                "email": email
            }
        )

        print(
            "UPDATED USER:",
            updated_user
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {

            "success": True,

            "message":
                "Profile updated successfully.",

            "user": {

                "name":
                    updated_user.get(
                        "name",
                        name
                    ),

                "email":
                    updated_user.get(
                        "email",
                        email
                    ),

                "auth_provider":
                    updated_user.get(
                        "auth_provider",
                        "local"
                    )

            }

        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            "PROFILE UPDATE ERROR:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )


# ============================================================
# GET NOTIFICATION SETTINGS
# ============================================================

@router.get("/notifications")
async def get_notifications(
    authorization: str = Header(
        default=None
    )
):

    print(
        "========================================"
    )

    print(
        "GET NOTIFICATION SETTINGS"
    )

    print(
        "========================================"
    )

    # --------------------------------------------------------
    # CHECK AUTHORIZATION
    # --------------------------------------------------------

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authorization token missing."
        )

    try:

        # ----------------------------------------------------
        # EXTRACT TOKEN
        # ----------------------------------------------------

        if authorization.lower().startswith(
            "bearer "
        ):

            token = authorization[7:].strip()

        else:

            token = authorization.strip()

        if not token:

            raise HTTPException(
                status_code=401,
                detail="Authorization token missing."
            )

        # ----------------------------------------------------
        # DECODE TOKEN
        # ----------------------------------------------------

        payload = decode_access_token(
            token
        )

        email = payload.get(
            "email"
        )

        if not email:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------

        user = users_collection.find_one(
            {
                "email": email
            }
        )

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # ----------------------------------------------------
        # GET SAVED NOTIFICATIONS
        # ----------------------------------------------------

        notifications = user.get(
            "notifications"
        )

        # ----------------------------------------------------
        # CREATE DEFAULTS FOR OLD USERS
        # ----------------------------------------------------

        if not notifications:

            notifications = (
                DEFAULT_NOTIFICATIONS.copy()
            )

            users_collection.update_one(
                {
                    "email": email
                },
                {
                    "$set": {
                        "notifications":
                            notifications
                    }
                }
            )

        else:

            # Make sure missing keys are added
            updated = False

            for key, default_value in (
                DEFAULT_NOTIFICATIONS.items()
            ):

                if key not in notifications:

                    notifications[key] = (
                        default_value
                    )

                    updated = True

            if updated:

                users_collection.update_one(
                    {
                        "email": email
                    },
                    {
                        "$set": {
                            "notifications":
                                notifications
                        }
                    }
                )

        print(
            "NOTIFICATIONS FROM MONGODB:",
            notifications
        )

        return {

            "success": True,

            "notifications":
                notifications

        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            "GET NOTIFICATIONS ERROR:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )


# ============================================================
# UPDATE NOTIFICATION SETTINGS
# ============================================================

@router.put("/notifications")
async def update_notifications(
    data: dict,
    authorization: str = Header(
        default=None
    )
):

    print(
        "========================================"
    )

    print(
        "UPDATE NOTIFICATION SETTINGS"
    )

    print(
        "========================================"
    )

    # --------------------------------------------------------
    # CHECK AUTHORIZATION
    # --------------------------------------------------------

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authorization token missing."
        )

    try:

        # ----------------------------------------------------
        # EXTRACT TOKEN
        # ----------------------------------------------------

        if authorization.lower().startswith(
            "bearer "
        ):

            token = authorization[7:].strip()

        else:

            token = authorization.strip()

        if not token:

            raise HTTPException(
                status_code=401,
                detail="Authorization token missing."
            )

        # ----------------------------------------------------
        # DECODE JWT
        # ----------------------------------------------------

        payload = decode_access_token(
            token
        )

        email = payload.get(
            "email"
        )

        if not email:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------

        existing_user = users_collection.find_one(
            {
                "email": email
            }
        )

        if not existing_user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # ----------------------------------------------------
        # CURRENT SETTINGS
        # ----------------------------------------------------

        current_notifications = (
            existing_user.get(
                "notifications",
                DEFAULT_NOTIFICATIONS.copy()
            )
        )

        # ----------------------------------------------------
        # VALID SETTINGS
        # ----------------------------------------------------

        allowed_keys = set(
            DEFAULT_NOTIFICATIONS.keys()
        )

        # ----------------------------------------------------
        # BUILD UPDATED SETTINGS
        # ----------------------------------------------------

        updated_notifications = {}

        for key in allowed_keys:

            if key in data:

                value = data[key]

                if not isinstance(
                    value,
                    bool
                ):

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"{key} must be "
                            "true or false."
                        )
                    )

                updated_notifications[key] = value

            else:

                updated_notifications[key] = (
                    current_notifications.get(
                        key,
                        DEFAULT_NOTIFICATIONS[key]
                    )
                )

        # ----------------------------------------------------
        # SAVE TO MONGODB
        # ----------------------------------------------------

        users_collection.update_one(
            {
                "email": email
            },
            {
                "$set": {
                    "notifications":
                        updated_notifications
                }
            }
        )

        print(
            "NOTIFICATIONS SAVED:",
            email,
            updated_notifications
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {

            "success": True,

            "message":
                "Notification settings updated successfully.",

            "notifications":
                updated_notifications

        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            "UPDATE NOTIFICATIONS ERROR:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        ) 



















































































# ============================================================
# AI CODE TUTOR STUDIO
# db_collections.py
# ============================================================

from database import db


# ============================================================
# USERS
# ============================================================

users_collection = db["users"]


# ============================================================
# HISTORY
# ============================================================

history_collection = db["history"]


# ============================================================
# CHAT
# ============================================================

chat_collection = db["chat"]


# ============================================================
# PROJECTS
# ============================================================
# Keep this because other parts of the application
# may still use projects.

projects_collection = db["projects"]


# ============================================================
# LEARNING
# ============================================================
# Stores:
# - Total workspace learning time
# - Overall learning progress
# - Last update time

learning_collection = db["learning"]


# ============================================================
# DEBUG
# ============================================================

print("====================================")
print("MongoDB Collections Loaded")
print("====================================")

print(
    "users_collection   :",
    users_collection.name
)

print(
    "history_collection :",
    history_collection.name
)

print(
    "chat_collection    :",
    chat_collection.name
)



print(
    "learning_collection:",
    learning_collection.name
)

print("====================================")