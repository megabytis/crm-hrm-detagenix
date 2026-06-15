import sys
from pathlib import Path
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

# Ensure internal modules (employee_scorer, team_builder, team_formation_service) are importable
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

# Align MongoDB settings dynamically with backend .env configurations prior to import
if "MONGODB_URI" in os.environ:
    os.environ["MONGO_URI"] = os.environ["MONGODB_URI"]
if "DB_NAME" in os.environ:
    os.environ["MONGO_DB"] = os.environ["DB_NAME"]

from team_formation_service import recommend_team, TeamFormationError

router = APIRouter(prefix="/team", tags=["Intelligent Team Formation"])

class TeamRecommendationRequest(BaseModel):
    project_type: str = Field(..., description="Type of project (e.g., 'Web Development', 'DevOps')")
    required_skills: List[str] = Field(..., description="List of required skills for the team")
    team_size: int = Field(3, ge=1, description="Number of members per team")
    top_n_options: int = Field(3, ge=1, description="Number of alternate team options to return")

@router.post("/recommend", summary="Recommend the best team configurations from active employees")
async def get_team_recommendation(payload: TeamRecommendationRequest):
    """
    Exposes the Intelligent Team Formation pipeline.
    
    Takes the project type, size, and required skills, scores all matching active employees,
    and returns the highest-ranking team recommendation alongside alternative configurations
    and details on employee availability, skills, and performance.
    """
    try:
        result = recommend_team(
            project_type=payload.project_type,
            required_skills=payload.required_skills,
            team_size=payload.team_size,
            top_n_options=payload.top_n_options
        )
        return result
    except TeamFormationError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing team recommendation: {str(e)}"
        )
