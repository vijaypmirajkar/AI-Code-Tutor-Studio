from fastapi import APIRouter, HTTPException

from models.schemas import AnalyzeRequest
from services.openai_service import analyze_code

router = APIRouter(
    prefix="/analyze",
    tags=["Analyze"]
)


@router.post("/")
async def analyze(request: AnalyzeRequest):

    print("========== ANALYZE ENDPOINT ==========")
    print("Request received:")
    print(request)

    try:
        result = await analyze_code(
            request.code,
            request.language,
            request.level
        )

        print("========== OPENAI RESPONSE ==========")
        print(result)

        return {
            "success": True,
            "result": result
        }

    except Exception as e:
        print("========== ERROR ==========")
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
