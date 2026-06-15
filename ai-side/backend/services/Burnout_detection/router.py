import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from pymongo import MongoClient

# Ensure internal files can be imported
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

# Align MongoDB environment variables
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "crm-hrms-DB")

router = APIRouter(prefix="/burnout", tags=["Burnout & Engagement Detection"])

# Request/Response Pydantic schemas
class BurnoutDetectRequest(BaseModel):
    employee_id: Optional[str] = Field(None, description="Employee ID to analyze. Omit to run batch scan of all employees.")
    overtime_hours: Optional[float] = Field(None, description="Explicit override for overtime hours.")
    attendance_rate: Optional[float] = Field(None, description="Explicit override for attendance rate (0.0 to 1.0).")
    sentiment_score: Optional[float] = Field(None, description="Explicit override for sentiment score (0.0 to 1.0, where 1.0 is extremely positive).")
    window_days: int = Field(30, ge=1, le=90, description="Analysis window in days.")

class EmployeeBurnoutDetail(BaseModel):
    employee_id: str
    name: str
    team: str
    overtime_hours: float
    attendance_rate: float
    sentiment_score: float
    burnout_risk_score: float
    risk_level: str

# Helper to resolve MongoDB connection dynamically
def _get_db():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Check if database has timesheets or employees, fallback to defaults
    db = client[DB_NAME]
    # Verify if collections exist, else try another common DB name
    if "employees" not in db.list_collection_names() and "workload_balancing_ai" in client.list_database_names():
        return client["workload_balancing_ai"]
    if "employees" not in db.list_collection_names() and "hr_ai_system" in client.list_database_names():
        return client["hr_ai_system"]
    return db

def _get_llm():
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or "dummy" in api_key.lower():
            api_key = os.getenv("GOOGLE_API_KEY")
        
        if api_key and "dummy" not in api_key.lower():
            os.environ["GOOGLE_API_KEY"] = api_key
            
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=api_key,
            temperature=0.3
        )
    except Exception as e:
        print(f"[WARN] Failed to load Gemini LLM for Burnout router: {e}", flush=True)
        return None

def calculate_burnout_metrics(
    overtime: float, 
    attendance: float, 
    sentiment: float
) -> Dict[str, Any]:
    # Overtime factor: critical if overtime > 20 hrs in 30 days
    overtime_factor = min(overtime / 20.0, 1.0)
    
    # Attendance factor: deviation from optimal 85% attendance. 
    # Too high (100% with high overtime = no rest) or too low (disengagement) increases risk
    attendance_deviation = abs(attendance - 0.85)
    attendance_factor = min(attendance_deviation * 2.5, 1.0)
    
    # Sentiment factor: low sentiment (e.g. 0.1) increases burnout risk
    sentiment_factor = 1.0 - sentiment
    
    # Combined score
    score = (overtime_factor * 0.45) + (attendance_factor * 0.25) + (sentiment_factor * 0.30)
    burnout_risk_score = round(min(max(score, 0.0), 1.0), 3)
    
    if burnout_risk_score >= 0.7:
        risk_level = "High / Critical"
    elif burnout_risk_score >= 0.4:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
        
    return {
        "burnout_risk_score": burnout_risk_score,
        "risk_level": risk_level
    }

@router.post("/detect", summary="Compute burnout risk and engagement indicators")
async def detect_burnout(payload: BurnoutDetectRequest):
    """
    Exposes the Burnout & Engagement Detection pipeline.
    
    If employee_id is specified:
      Computes detailed burnout risk based on overtime logs, attendance logs, and sentiment.
      Uses Gemini to write a professional risk summary and recommendation list.
    
    If employee_id is omitted:
      Scans all active employees in MongoDB, computes their burnout risk scores, and returns
      a summary list of at-risk employees for the AI Center / HR portal.
    """
    try:
        db = _get_db()
        window_start = datetime.utcnow() - timedelta(days=payload.window_days)
        
        # Scenario A: Single Employee Detailed Analysis
        if payload.employee_id:
            emp = db["employees"].find_one({"employee_id": payload.employee_id})
            if not emp:
                raise HTTPException(status_code=404, detail=f"Employee {payload.employee_id} not found.")
                
            # 1. Overtime hours computation
            overtime_hours = payload.overtime_hours
            if overtime_hours is None:
                pipeline_ot = [
                    {"$match": {"employee_id": payload.employee_id, "date": {"$gte": window_start}}},
                    {"$group": {"_id": None, "total_ot": {"$sum": "$overtime_hours"}}}
                ]
                ot_rows = list(db["timesheets"].aggregate(pipeline_ot))
                overtime_hours = ot_rows[0]["total_ot"] if ot_rows else 0.0
                
            # 2. Attendance rate computation
            attendance_rate = payload.attendance_rate
            if attendance_rate is None:
                pipeline_att = [
                    {"$match": {"employee_id": payload.employee_id, "date": {"$gte": window_start}}},
                    {"$group": {
                        "_id": None, 
                        "worked_days": {"$sum": {"$cond": [{"$gt": ["$hours_worked", 0]}, 1, 0]}},
                        "total_days": {"$sum": 1}
                    }}
                ]
                att_rows = list(db["timesheets"].aggregate(pipeline_att))
                if att_rows and att_rows[0]["total_days"] > 0:
                    attendance_rate = att_rows[0]["worked_days"] / att_rows[0]["total_days"]
                else:
                    attendance_rate = 0.85 # Default healthy attendance
                    
            # 3. Sentiment score computation
            sentiment_score = payload.sentiment_score
            if sentiment_score is None:
                # Fallback to productivity score from timesheets as a proxy, or general default
                pipeline_sent = [
                    {"$match": {"employee_id": payload.employee_id, "date": {"$gte": window_start}}},
                    {"$group": {"_id": None, "avg_prod": {"$avg": "$productivity_score"}}}
                ]
                sent_rows = list(db["timesheets"].aggregate(pipeline_sent))
                if sent_rows and sent_rows[0]["avg_prod"]:
                    sentiment_score = sent_rows[0]["avg_prod"] / 100.0
                else:
                    sentiment_score = 0.70 # Default stable sentiment
                    
            # Run calculations
            metrics = calculate_burnout_metrics(overtime_hours, attendance_rate, sentiment_score)
            
            # 4. Generate LLM Enhanced Analysis Report
            llm = _get_llm()
            report = ""
            if llm:
                prompt = f"""
You are a senior HR analytics and organizational health expert.
Analyze the burnout risk and engagement metrics for this employee and write a professional assessment report.

Employee ID: {payload.employee_id}
Employee Name: {emp.get('name', 'Unknown')}
Team: {emp.get('team', 'N/A')}
Overtime Hours (last {payload.window_days} days): {overtime_hours:.1f} hours
Attendance Rate: {attendance_rate:.1%}
Sentiment Score (0.0 - 1.0): {sentiment_score:.2f}
Calculated Burnout Risk Score: {metrics['burnout_risk_score']:.1%}
Risk Level: {metrics['risk_level']}

Provide your analysis in the following exact format:

Summary:
- [Provide a concise summary explaining the employee's current state, work pressure, and overall burnout status]

Key Drivers:
- [Driver 1 explaining what factors contributed to this score]
- [Driver 2 explaining what factors contributed to this score]

Risks:
- [Risk 1 detailing potential business/health consequences if not addressed]
- [Risk 2 detailing potential business/health consequences if not addressed]

Final Recommendations:
- [Recommendation 1 giving actionable feedback for managers]
- [Recommendation 2 giving actionable feedback for managers]
"""
                try:
                    llm_response = llm.invoke(prompt)
                    report = llm_response.content
                except Exception as llm_err:
                    report = f"LLM analysis failed: {str(llm_err)}"
            
            # Fallback to rule-based report if LLM is unavailable
            if not report or "LLM analysis failed" in report:
                rec_list = []
                drivers_list = []
                risks_list = []
                
                if overtime_hours > 15:
                    drivers_list.append(f"Excessive overtime of {overtime_hours:.1f} hours worked in the last {payload.window_days} days.")
                    risks_list.append("High physical fatigue and mental exhaustion risk.")
                    rec_list.append("Mandate immediate workload redistribution and cap weekly working hours.")
                else:
                    drivers_list.append("Overtime hours are within normal operational limits.")
                    
                if attendance_rate > 0.95 and overtime_hours > 10:
                    drivers_list.append("Continuous attendance without leave usage combined with high work hours.")
                    risks_list.append("Lack of restorative personal downtime leading to chronic stress.")
                    rec_list.append("Encourage taking accrued leave days immediately.")
                elif attendance_rate < 0.6:
                    drivers_list.append(f"Low attendance rate of {attendance_rate:.1%}, indicating potential absenteeism.")
                    risks_list.append("Active disengagement or withdrawal behaviors.")
                    rec_list.append("Conduct a 1:1 check-in to investigate underlying reasons for absenteeism.")
                    
                if sentiment_score < 0.5:
                    drivers_list.append(f"Suboptimal sentiment score of {sentiment_score:.2f}.")
                    risks_list.append("Low job satisfaction and increased attrition probability.")
                    rec_list.append("Engage employee in feedback loops and address workplace frustrations.")
                    
                if not rec_list:
                    rec_list.append("Maintain current healthy workload and monitor metrics regularly.")
                if not risks_list:
                    risks_list.append("No immediate critical risks identified.")
                if not drivers_list:
                    drivers_list.append("Metrics are within healthy baseline parameters.")

                report = (
                    "Summary:\n"
                    f"- Employee exhibits a {metrics['risk_level']} burnout risk score of {metrics['burnout_risk_score']:.1%}.\n\n"
                    "Key Drivers:\n"
                    + "\n".join(f"- {d}" for d in drivers_list) + "\n\n"
                    "Risks:\n"
                    + "\n".join(f"- {r}" for r in risks_list) + "\n\n"
                    "Final Recommendations:\n"
                    + "\n".join(f"- {rec}" for rec in rec_list)
                )
                
            return {
                "success": True,
                "employee_id": payload.employee_id,
                "name": emp.get("name"),
                "team": emp.get("team"),
                "overtime_hours": overtime_hours,
                "attendance_rate": attendance_rate,
                "sentiment_score": sentiment_score,
                "burnout_risk_score": metrics["burnout_risk_score"],
                "risk_level": metrics["risk_level"],
                "report": report
            }
            
        # Scenario B: Leaderboard / All Employees Scan (for AI Center portal)
        else:
            employees = list(db["employees"].find({}, {"employee_id": 1, "name": 1, "team": 1}))
            if not employees:
                return {"success": True, "scan_timestamp": datetime.utcnow().isoformat(), "employees": []}
                
            # Aggregate timesheets for all employees
            pipeline_all = [
                {"$match": {"date": {"$gte": window_start}}},
                {"$group": {
                    "_id": "$employee_id",
                    "total_ot": {"$sum": "$overtime_hours"},
                    "avg_prod": {"$avg": "$productivity_score"},
                    "worked_days": {"$sum": {"$cond": [{"$gt": ["$hours_worked", 0]}, 1, 0]}},
                    "total_days": {"$sum": 1}
                }}
            ]
            agg_data = {row["_id"]: row for row in db["timesheets"].aggregate(pipeline_all)}
            
            results = []
            for emp in employees:
                eid = emp["employee_id"]
                stats = agg_data.get(eid, {})
                
                overtime = stats.get("total_ot", 0.0)
                avg_prod = stats.get("avg_prod", 70.0)
                sentiment = avg_prod / 100.0
                
                total_days = stats.get("total_days", 0)
                attendance = (stats.get("worked_days", 0) / total_days) if total_days > 0 else 0.85
                
                metrics = calculate_burnout_metrics(overtime, attendance, sentiment)
                
                results.append({
                    "employee_id": eid,
                    "name": emp.get("name", "Unknown"),
                    "team": emp.get("team", "N/A"),
                    "overtime_hours": round(overtime, 1),
                    "attendance_rate": round(attendance, 3),
                    "sentiment_score": round(sentiment, 2),
                    "burnout_risk_score": metrics["burnout_risk_score"],
                    "risk_level": metrics["risk_level"]
                })
                
            # Sort by burnout score descending (highest risk first)
            results.sort(key=lambda x: x["burnout_risk_score"], reverse=True)
            
            return {
                "success": True,
                "scan_timestamp": datetime.utcnow().isoformat(),
                "window_days": payload.window_days,
                "employees": results
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing burnout detection: {str(e)}"
        )
