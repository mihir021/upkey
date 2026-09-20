from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.matching_service import match_products

router = APIRouter(tags=["Recommendations"])


class RecommendationRequest(BaseModel):
    skin_type: Optional[str] = ""
    skin_tone: Optional[str] = ""
    concerns: Optional[List[str]] = []
    budget: Optional[float] = None
    limit: Optional[int] = Field(default=5, ge=1, le=20)


@router.post("/recommendations")
def get_recommendations(req: RecommendationRequest):
    user_profile = {
        "skin_type": req.skin_type or "",
        "skin_tone": req.skin_tone or "",
        "concerns": req.concerns or [],
        "budget": req.budget,
    }
    return match_products(user_profile, limit=req.limit or 5)
