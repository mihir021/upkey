from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from app.services.agent_service import process_message, process_message_with_llm

router = APIRouter(prefix="/agent", tags=["AI Shopping Agent"])


class AgentMessageRequest(BaseModel):
    message: str
    user_profile: Optional[Dict[str, Any]] = None
    product_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None


@router.post("/message")
def agent_message(req: AgentMessageRequest):
    """LLM-powered shopping agent. Falls back to deterministic if LLM is unavailable."""
    return process_message_with_llm(
        message=req.message,
        user_profile=req.user_profile,
        product_id=req.product_id,
        conversation_history=req.conversation_history,
    )


@router.post("/message/deterministic")
def agent_message_deterministic(req: AgentMessageRequest):
    """Deterministic (non-LLM) shopping agent — always available."""
    return process_message(
        message=req.message,
        user_profile=req.user_profile,
        product_id=req.product_id,
    )
