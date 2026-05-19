from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import random
import logging

router = APIRouter(tags=["HR AI"])

class ResumeScreeningRequest(BaseModel):
    applicant_name: str
    resume_text: str
    job_description: str
    requirements: Optional[str] = None

class AttritionPredictionRequest(BaseModel):
    employee_id: str
    tenure_years: float
    performance_score: float
    job_satisfaction: float
    salary_hike_percent: float

@router.post("/resume-screening/screen")
async def screen_resume(payload: ResumeScreeningRequest):
    try:
        # In a fully integrated scenario, we would import from Smart_Resume_Screening
        # and run the full NLP pipeline here. 
        # For this bridge, we will return a simulated AI response structure.
        match_score = random.randint(65, 95)
        
        return {
            "success": True,
            "applicant_name": payload.applicant_name,
            "match_score": match_score,
            "verdict": "Strong Match" if match_score >= 80 else "Average Match",
            "key_skills_found": ["Communication", "Problem Solving", "Relevant Technical Skills"],
            "missing_skills": ["Specific Domain Knowledge"] if match_score < 80 else [],
            "analysis_summary": f"The candidate shows a {match_score}% alignment with the provided job description."
        }
    except Exception as e:
        logging.error(f"Error in resume screening: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/employee-attrition/predict")
async def predict_attrition(payload: AttritionPredictionRequest):
    try:
        # Here we would load attrition_model.pkl and predict
        # Returning a simulated prediction based on payload inputs
        risk_score = 0.5
        
        # Simple heuristics to simulate the ML model's weights
        if payload.job_satisfaction >= 4 and payload.performance_score >= 3:
            risk_score = 0.15
        elif payload.job_satisfaction <= 2:
            risk_score = 0.85
        elif payload.salary_hike_percent < 5:
            risk_score = 0.70
            
        return {
            "success": True,
            "employee_id": payload.employee_id,
            "attrition_probability": round(risk_score, 2),
            "risk_level": "High" if risk_score >= 0.7 else ("Medium" if risk_score >= 0.4 else "Low"),
            "key_factors": {
                "job_satisfaction_impact": "Negative" if payload.job_satisfaction <= 2 else "Positive",
                "salary_hike_impact": "Negative" if payload.salary_hike_percent < 5 else "Positive"
            }
        }
    except Exception as e:
        logging.error(f"Error in attrition prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
