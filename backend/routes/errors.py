from fastapi import APIRouter, HTTPException

from models.schemas import AnalyzeRequest
from services.errors_service import analyze_errors


router = APIRouter(
    prefix="/errors",
    tags=["Errors"]
)


@router.post("/")
async def errors(request: AnalyzeRequest):

    print("\n========== ERRORS ENDPOINT ==========")

    print("Request received:")
    print(request)

    try:

        result = await analyze_errors(
            request.code,
            request.language
        )

        print("\n========== ERRORS RESULT ==========")
        print(result)

        return {
            "success": True,
            "result": result
        }

    except Exception as e:

        print("\n========== ERRORS ERROR ==========")
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
