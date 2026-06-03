from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

from .ai_recommender import generate_recommendation
from .data_processor import FollowupDataError, process_data
from .pattern_analyzer import analyze_patterns

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/followup",tags=["Follow-up Optimization"],)

class FollowupInteraction(BaseModel):
    sent_time: datetime
    reply_time: Optional[datetime] = None
    channel: str = Field(
        min_length=1,
        max_length=100,
        description="Communication channel (email, linkedin, sms, etc.)",
    )

    @model_validator(mode="after")
    def validate_fields(self):
        self.channel = self.channel.strip()

        if not self.channel:
            raise ValueError("channel cannot be empty")

        if (
            self.reply_time is not None
            and self.reply_time < self.sent_time
        ):
            raise ValueError(
                "reply_time cannot be before sent_time"
            )

        return self

class FollowupOptimizationRequest(BaseModel):
    lead_id: str = Field(
        min_length=1,
        max_length=100,
    )
    interactions: List[FollowupInteraction] = Field(
        min_length=1,
        description="Historical interaction records",
    )

class FollowupOptimizationResponse(BaseModel):
    lead_id: str
    best_day: str
    best_time: str
    best_channel: str
    confidence: str
    model: str
    reason: str


@router.post("/optimize", response_model=FollowupOptimizationResponse, summary="Optimize Follow-up Timing",)
async def optimize_followup(request: FollowupOptimizationRequest) -> FollowupOptimizationResponse:
    """
    Analyze historical interaction patterns and recommend
    the optimal follow-up day, time, and channel.
    """
    try:
        payload = [interaction.model_dump() for interaction in request.interactions]
        df = process_data(payload)
        insights = analyze_patterns(df)
        recommendation = generate_recommendation(request.lead_id,insights,)

        return FollowupOptimizationResponse(**recommendation)

    except FollowupDataError as exc:
        raise HTTPException(status_code=400,detail=str(exc),) from exc

    except Exception as exc:
        logger.exception("Follow-up optimization failed")

        raise HTTPException(status_code=500,detail="Failed to optimize follow-up strategy") from exc