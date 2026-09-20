from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services import shopping_tools

router = APIRouter(prefix="/shopping", tags=["Shopping Tools"])


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class CompareRequest(BaseModel):
    product_ids: List[str] = Field(..., min_length=2, max_length=4)


class RecommendRequest(BaseModel):
    skin_type: Optional[str] = ""
    skin_tone: Optional[str] = ""
    concerns: Optional[List[str]] = []
    budget: Optional[float] = None
    limit: Optional[int] = Field(default=5, ge=1, le=20)


class RoutineRequest(BaseModel):
    skin_type: Optional[str] = ""
    skin_tone: Optional[str] = ""
    concerns: Optional[List[str]] = []
    goals: Optional[List[str]] = []
    budget: Optional[float] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/search")
def search(q: str = Query(..., min_length=1), limit: int = Query(default=10, ge=1, le=50)):
    return shopping_tools.search_products(q, limit=limit)


@router.get("/product/{product_id}")
def get_product(product_id: str):
    return shopping_tools.get_product(product_id)


@router.post("/compare")
def compare(req: CompareRequest):
    return shopping_tools.compare_products(req.product_ids)


@router.get("/dupes/{product_id}")
def find_dupes(product_id: str):
    return shopping_tools.find_dupes(product_id)


@router.post("/recommend")
def recommend(req: RecommendRequest):
    user_profile = {
        "skin_type": req.skin_type or "",
        "skin_tone": req.skin_tone or "",
        "concerns": req.concerns or [],
        "budget": req.budget,
    }
    return shopping_tools.recommend_products(user_profile, limit=req.limit or 5)


@router.post("/routine")
def build_routine(req: RoutineRequest):
    user_profile = {
        "skin_type": req.skin_type or "",
        "skin_tone": req.skin_tone or "",
        "concerns": req.concerns or [],
    }
    return shopping_tools.build_routine(
        user_profile,
        goals=req.goals or [],
        budget=req.budget,
    )
