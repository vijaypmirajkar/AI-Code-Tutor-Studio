from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest
from services.chat_service import chat_with_ai


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/")
async def chat(request: ChatRequest):

    print("========== CHAT ENDPOINT ==========")

    print("Question:")
    print(request.question)

    print("Language:")
    print(request.language)

    print("Code:")
    print(request.code)

    try:

        result = await chat_with_ai(
            request.question,
            request.code,
            request.language
        )

        print("========== CHAT SUCCESS ==========")

        print(result)

        return {
            "success": True,
            "answer": result
        }

    except Exception as e:

        print("========== CHAT ERROR ==========")

        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )