from fastapi import APIRouter, HTTPException
from auth.security import hash_password
from db_collections import users_collection
from models.schemas import RegisterRequest

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(user: RegisterRequest):

    existing = users_collection.find_one(
        {"email": user.email}
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password)
    }

    users_collection.insert_one(new_user)

    return {
        "success": True,
        "message": "User registered successfully."
    }
