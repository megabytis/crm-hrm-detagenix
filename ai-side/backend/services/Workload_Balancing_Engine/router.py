import sys
from pathlib import Path
import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

# Ensure internal modules (ai_engine, tools) are importable
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

# Align database settings prior to import
if "MONGODB_URI" in os.environ:
    os.environ["MONGO_URI"] = os.environ["MONGODB_URI"]
if "DB_NAME" in os.environ:
    os.environ["MONGO_DB"] = os.environ["DB_NAME"]

from ai_engine import run_workload_analysis
from tools import _get_db

router = APIRouter(prefix="/workload", tags=["Workload Balancing Engine"])

@router.post("/balance", summary="Analyze team task loads and generate task reassignments")
async def balance_workload():
    """
    Exposes the Workload Balancing Engine.
    
    Runs the Gemini 2.0 ReAct agent to scan team workloads, identify overloaded employees, 
    detect burnout risks, query eligible candidate lists, save task redistribution suggestions
    to the database, and return both the formatted report and structured suggestions.
    """
    try:
        # Run agent analysis
        report = run_workload_analysis()

        # Fetch saved pending suggestions from MongoDB
        db = _get_db()
        suggestions_cursor = db["redistribution_suggestions"].find({"status": "pending"})
        suggestions = []
        for s in suggestions_cursor:
            s["_id"] = str(s["_id"])
            if "created_at" in s:
                s["created_at"] = s["created_at"].isoformat()
            suggestions.append(s)

        return {
            "success": True,
            "report": report,
            "suggestions": suggestions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing workload balancing engine: {str(e)}"
        )
