import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Ensure internal modules (model_loader, performance_prediction_service, etc.) are importable from this subdirectory
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

from performance_prediction_service import predict_employee_performance

router = APIRouter(prefix="/performance", tags=["Performance Prediction"])

class PerformanceInput(BaseModel):
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0-100)")
    task_completion_rate: float = Field(..., ge=0.0, le=1.0, description="Task completion rate decimal (0.0-1.0)")
    peer_reviews: float = Field(..., ge=1.0, le=5.0, description="Peer reviews rating (1.0-5.0)")
    project_success_rate: float = Field(..., ge=0.0, le=1.0, description="Project success rate decimal (0.0-1.0)")

@router.post("/predict", summary="Predict employee performance category, promotion readiness, and skill gap")
async def predict_performance(payload: PerformanceInput):
    """
    Exposes the Performance Prediction Model pipeline.
    
    Accepts metrics including attendance percentage, task completion rate, peer reviews, 
    and project success rate, and evaluates the employee's performance level,
    promotion eligibility, and skill improvement need using trained Random Forest models.
    """
    try:
        data = payload.model_dump()
        result = predict_employee_performance(data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing performance prediction: {str(e)}"
        )
