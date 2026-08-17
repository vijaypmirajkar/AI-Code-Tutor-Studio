from fastapi import APIRouter, HTTPException

from models.schemas import AlgorithmRequest
from services.openai_service import analyze_algorithm

router = APIRouter(
    prefix="/algorithm",
    tags=["Algorithm"]
)


@router.post("/")
async def algorithm(request: AlgorithmRequest):

    try:

        result = await analyze_algorithm(request.code)

        return {
            "success": True,
            "result": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )