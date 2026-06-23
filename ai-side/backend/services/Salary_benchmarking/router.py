import os
import sys
from pathlib import Path
from datetime import datetime
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

router = APIRouter(prefix="/salary", tags=["AI Salary Benchmarking"])

class SalaryBenchmarkRequest(BaseModel):
    employee_id: Optional[str] = Field(None, description="Employee ID to analyze. Omit to run organization-wide benchmark audit.")
    role: Optional[str] = Field(None, description="Override or specify role/designation.")
    experience_years: Optional[float] = Field(None, description="Override or specify years of experience.")
    current_salary: Optional[float] = Field(None, description="Override or specify current annual salary (CTC).")
    location: str = Field("India", description="Location for market rates comparison.")

# Helper to resolve MongoDB connection dynamically
def _get_db():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db_name = DB_NAME
    if db_name == "crm+hrm":
        db_name = "crm-hrms-DB"
    db = client[db_name]
    return db

def _get_employees_coll(db):
    if "users" in db.list_collection_names():
        return db["users"]
    return db["employees"]

def _get_salary_record(db, employee_id):
    from bson import ObjectId
    try:
        emp_obj = ObjectId(employee_id)
    except:
        emp_obj = None

    if "salarystructures" in db.list_collection_names():
        query = {"employee": emp_obj} if emp_obj else {"employee": employee_id}
        rec = db["salarystructures"].find_one(query)
        if not rec and emp_obj:
            rec = db["salarystructures"].find_one({"employee": employee_id})
        if rec:
            basic = rec.get("basicSalary", 0)
            hra = rec.get("hra", 0)
            bonus = rec.get("bonus", 0)
            pf = rec.get("pf", 0)
            return {"ctc": rec.get("totalSalary", basic + hra + bonus - pf) * 12}
            
    if "salary" in db.list_collection_names():
        rec = db["salary"].find_one({"employee_id": employee_id})
        if not rec and emp_obj:
            rec = db["salary"].find_one({"employee_id": emp_obj})
        if rec:
            return rec
    return None

def _get_all_salaries(db):
    salaries = {}
    if "salarystructures" in db.list_collection_names():
        for rec in db["salarystructures"].find({}):
            emp_id = str(rec.get("employee"))
            basic = rec.get("basicSalary", 0)
            hra = rec.get("hra", 0)
            bonus = rec.get("bonus", 0)
            pf = rec.get("pf", 0)
            ctc = rec.get("totalSalary", basic + hra + bonus - pf) * 12
            salaries[emp_id] = {"ctc": ctc}
    if "salary" in db.list_collection_names():
        for rec in db["salary"].find({}):
            emp_id = str(rec.get("employee_id"))
            salaries[emp_id] = rec
    return salaries

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
            temperature=0.3,
            transport="rest"
        )
    except Exception as e:
        print(f"[WARN] Failed to load Gemini LLM for Salary Benchmarking: {e}", flush=True)
        return None

# Built-in Market Rates Benchmarks (Annual CTC in INR)
MARKET_BENCHMARKS = {
    "software engineer": {
        "junior": (450000, 800000, 600000),      # min, max, avg
        "mid": (800000, 1500000, 1100000),
        "senior": (1500000, 2500000, 2000000),
        "lead": (2500000, 4500000, 3500000)
    },
    "backend engineer": {
        "junior": (450000, 800000, 600000),
        "mid": (800000, 1500000, 1100000),
        "senior": (1500000, 2500000, 2000000),
        "lead": (2500000, 4500000, 3500000)
    },
    "frontend engineer": {
        "junior": (400000, 750000, 550000),
        "mid": (750000, 1400000, 1000000),
        "senior": (1400000, 2300000, 1800000),
        "lead": (2300000, 4000000, 3100000)
    },
    "ml engineer": {
        "junior": (600000, 1000000, 800000),
        "mid": (1000000, 1800000, 1400000),
        "senior": (1800000, 3000000, 2400000),
        "lead": (3000000, 6000000, 4500000)
    },
    "devops engineer": {
        "junior": (500000, 900000, 700000),
        "mid": (900000, 1600000, 1250000),
        "senior": (1600000, 2700000, 2100000),
        "lead": (2700000, 4800000, 3600000)
    },
    "data engineer": {
        "junior": (500000, 850000, 650000),
        "mid": (850000, 1500000, 1150000),
        "senior": (1500000, 2600000, 2000000),
        "lead": (2600000, 4500000, 3400000)
    },
    "default": {
        "junior": (350000, 600000, 450000),
        "mid": (600000, 1200000, 900000),
        "senior": (1200000, 2000000, 1600000),
        "lead": (2000000, 4000000, 3000000)
    }
}

def get_market_rates(role: str, experience: float) -> tuple:
    role_lower = str(role).lower()
    selected_role = "default"
    for k in MARKET_BENCHMARKS.keys():
        if k in role_lower:
            selected_role = k
            break
            
    # Determine experience level
    if experience < 3:
        level = "junior"
    elif experience < 6:
        level = "mid"
    elif experience < 9:
        level = "senior"
    else:
        level = "lead"
        
    return MARKET_BENCHMARKS[selected_role][level]

@router.post("/benchmark", summary="Evaluate salary competitiveness and generate adjustment scenarios")
async def benchmark_salary(payload: SalaryBenchmarkRequest):
    """
    Exposes the AI Salary Benchmarking pipeline.
    
    If employee_id is specified:
      Performs an in-depth salary audit comparing CTC with internal peers and external market benchmarks.
      Fuses findings with performance ratings and attrition risks using Gemini to propose correction plans.
      
    If employee_id is omitted:
      Runs a complete organizational compensation audit across all active database records, identifying
      underpaid anomalies, computing internal pay equity details, and generating summary tables.
    """
    try:
        db = _get_db()
        
        # Scenario A: Single Employee Detailed Assessment
        if payload.employee_id:
            # 1. Fetch employee details
            coll = _get_employees_coll(db)
            from bson import ObjectId
            emp = coll.find_one({"employee_id": payload.employee_id})
            if not emp:
                try:
                    emp = coll.find_one({"_id": ObjectId(payload.employee_id)})
                except:
                    emp = coll.find_one({"_id": payload.employee_id})
            if not emp:
                raise HTTPException(status_code=404, detail=f"Employee {payload.employee_id} not found.")
                
            # Extract basic details with fallback overrides
            role = payload.role or emp.get("role") or emp.get("designation") or "Software Engineer"
            experience = payload.experience_years if payload.experience_years is not None else float(emp.get("experience_years") or emp.get("experienceYears") or 3)
            
            # Retrieve current CTC (check salary collection or fallback to employee schema CTC)
            current_salary = payload.current_salary
            if current_salary is None:
                salary_record = _get_salary_record(db, payload.employee_id)
                if salary_record:
                    current_salary = float(salary_record.get("ctc", 0))
                else:
                    current_salary = float(emp.get("salary") or emp.get("ctc") or 500000.0)
                    
            # 2. Get external market rates
            market_min, market_max, market_avg = get_market_rates(role, experience)
            
            # Determine comp-ratio
            comp_ratio = current_salary / market_avg
            if current_salary < market_min * 0.95:
                status = "Underpaid"
            elif current_salary > market_max * 1.05:
                status = "Overpaid"
            else:
                status = "Competitive (Market Rate)"
                
            # 3. Calculate internal equity benchmarks
            peers = list(coll.find({"$or": [{"role": role}, {"designation": role}]}))
            peer_ids = [p.get("employee_id") or str(p.get("_id")) for p in peers]
            
            peer_salaries = []
            all_salaries = _get_all_salaries(db)
            for pid in peer_ids:
                s_rec = all_salaries.get(pid)
                if s_rec:
                    peer_salaries.append(float(s_rec.get("ctc", 0)))
                
            if not peer_salaries:
                peer_salaries = [float(p.get("salary") or p.get("ctc") or 500000.0) for p in peers]
                
            if not peer_salaries:
                peer_salaries = [current_salary]
                
            peer_min = min(peer_salaries)
            peer_max = max(peer_salaries)
            peer_avg = sum(peer_salaries) / len(peer_salaries)
            
            # Determine performance rating
            perf_rating = emp.get("performance_rating") or emp.get("performance_score")
            if perf_rating is None:
                perf_rating = 3.5 # default moderate performance
            # Normalize to 5-scale if it's on a 100-scale
            if perf_rating > 10.0:
                perf_rating_normalized = round(perf_rating / 20.0, 2)
            else:
                perf_rating_normalized = float(perf_rating)
                
            # 4. Propose adjustment target
            recommended_increment_pct = 0.0
            if status == "Underpaid":
                # High performers get higher adjustments to mitigate attrition
                if perf_rating_normalized >= 4.0:
                    recommended_increment_pct = 20.0
                else:
                    recommended_increment_pct = 12.0
            elif perf_rating_normalized >= 4.5:
                recommended_increment_pct = 10.0
            elif perf_rating_normalized >= 4.0:
                recommended_increment_pct = 7.0
            else:
                recommended_increment_pct = 3.0
                
            target_salary = round(current_salary * (1 + recommended_increment_pct / 100.0), 2)
            
            # Attrition mitigation ROI
            replacement_cost_estimate = round(current_salary * 0.25, 2) # replacement is 25% of annual CTC
            adjustment_cost = round(target_salary - current_salary, 2)
            roi_savings = round(replacement_cost_estimate - adjustment_cost, 2)
            
            # 5. Invoke Gemini LLM for assessment report
            llm = _get_llm()
            report = ""
            if llm:
                prompt = f"""
You are a senior Compensation and Benefits expert.
Analyze the employee compensation benchmark data below and provide a professional assessment report with salary corrections.

Employee ID: {payload.employee_id}
Employee Name: {emp.get('name', 'Unknown')}
Role/Designation: {role}
Years of Experience: {experience}
Current Annual Salary (CTC): INR {current_salary:,.2f}
Performance Rating: {perf_rating_normalized:.2f} / 5.0

External Market Benchmarks:
- Min Market Rate: INR {market_min:,.2f}
- Max Market Rate: INR {market_max:,.2f}
- Avg Market Rate: INR {market_avg:,.2f}
- Market Comp-Ratio: {comp_ratio:.2f}
- Market Competitiveness Status: {status}

Internal Peer Benchmarks:
- Minimum Peer CTC: INR {peer_min:,.2f}
- Maximum Peer CTC: INR {peer_max:,.2f}
- Average Peer CTC: INR {peer_avg:,.2f}

Proposed Salary Adjustment:
- Recommended Increment %: {recommended_increment_pct:.1f}%
- Target Annual Salary: INR {target_salary:,.2f}
- Attrition Replacement Cost Saved: INR {replacement_cost_estimate:,.2f}
- Adjustment Cost: INR {adjustment_cost:,.2f}
- Net ROI Value (Savings - Cost): INR {roi_savings:,.2f}

Provide your analysis in the following exact format:

Summary:
- [Explain the employee's current compensation level and how it compares internally and externally]

Key Insights:
- [Insight 1 regarding internal equity or external market pressures]
- [Insight 2 detailing how performance aligns with compensation]

Risks:
- [Risk 1 detailing attrition probability or demotivation factors]
- [Risk 2 detailing organizational equity imbalance implications]

Recommended Correction:
- [Correction step detailing final suggested CTC adjustment and timeline]
- [Next action step for management communication]
"""
                try:
                    llm_response = llm.invoke(prompt)
                    report = llm_response.content
                except Exception as e:
                    report = f"LLM assessment failed: {str(e)}"
                    
            if not report or "LLM assessment failed" in report:
                report = (
                    "Summary:\n"
                    f"- Current CTC of INR {current_salary:,.2f} is classified as {status} compared to the external market average of INR {market_avg:,.2f}.\n\n"
                    "Key Insights:\n"
                    f"- Employee comp-ratio stands at {comp_ratio:.2f} relative to market rates.\n"
                    f"- Internal peer average for the same role is INR {peer_avg:,.2f}.\n\n"
                    "Risks:\n"
                    f"- Attrition replacement risk estimated at INR {replacement_cost_estimate:,.2f} if employee resigns due to compensation mismatch.\n\n"
                    "Recommended Correction:\n"
                    f"- Recommend adjusting CTC by {recommended_increment_pct:.1f}% to INR {target_salary:,.2f}.\n"
                    "- Apply adjustment in the next standard appraisal cycle."
                )
                
            return {
                "success": True,
                "employee_id": payload.employee_id,
                "name": emp.get("name"),
                "role": role,
                "experience_years": experience,
                "current_salary": current_salary,
                "performance_rating": perf_rating_normalized,
                "market_benchmarks": {
                    "min": market_min,
                    "max": market_max,
                    "average": market_avg,
                    "comp_ratio": comp_ratio,
                    "status": status
                },
                "internal_equity": {
                    "peer_min": peer_min,
                    "peer_max": peer_max,
                    "peer_average": peer_avg
                },
                "adjustment_scenario": {
                    "recommended_increment_pct": recommended_increment_pct,
                    "target_salary": target_salary,
                    "adjustment_cost": adjustment_cost,
                    "mitigated_replacement_cost": replacement_cost_estimate,
                    "net_roi": roi_savings
                },
                "report": report
            }
            
        # Scenario B: Organization-Wide Benchmarking Audit
        else:
            coll = _get_employees_coll(db)
            raw_employees = list(coll.find({}))
            employees = []
            for r in raw_employees:
                eid = r.get("employee_id") or str(r["_id"])
                employees.append({
                    "employee_id": eid,
                    "name": r.get("name", "Unknown"),
                    "team": r.get("team") or r.get("department") or "N/A",
                    "role": r.get("role") or r.get("designation") or "Software Engineer",
                    "experience_years": float(r.get("experience_years") or r.get("experienceYears") or 3)
                })
            if not employees:
                return {"success": True, "scan_timestamp": datetime.utcnow().isoformat(), "audit_records": []}
                
            # Fetch all salary records to match in memory
            salaries_by_emp = _get_all_salaries(db)
            
            audit_records = []
            underpaid_count = 0
            competitive_count = 0
            overpaid_count = 0
            
            for emp in employees:
                eid = emp["employee_id"]
                role = emp["role"]
                experience = emp["experience_years"]
                
                # Fetch CTC
                salary_rec = salaries_by_emp.get(eid, {})
                current_salary = float(salary_rec.get("ctc") or 500000.0)
                
                # Market rate comparison
                market_min, market_max, market_avg = get_market_rates(role, experience)
                comp_ratio = current_salary / market_avg
                
                if current_salary < market_min * 0.95:
                    status = "Underpaid"
                    underpaid_count += 1
                elif current_salary > market_max * 1.05:
                    status = "Overpaid"
                    overpaid_count += 1
                else:
                    status = "Competitive"
                    competitive_count += 1
                    
                audit_records.append({
                    "employee_id": eid,
                    "name": emp.get("name", "Unknown"),
                    "team": emp.get("team", "N/A"),
                    "role": role,
                    "experience_years": experience,
                    "current_salary": current_salary,
                    "market_average": market_avg,
                    "comp_ratio": round(comp_ratio, 2),
                    "status": status
                })
                
            # Compute aggregations
            total_employees = len(audit_records)
            average_comp_ratio = sum(r["comp_ratio"] for r in audit_records) / total_employees if total_employees > 0 else 0.0
            
            return {
                "success": True,
                "scan_timestamp": datetime.utcnow().isoformat(),
                "location": payload.location,
                "summary_stats": {
                    "total_audited": total_employees,
                    "underpaid_count": underpaid_count,
                    "competitive_count": competitive_count,
                    "overpaid_count": overpaid_count,
                    "average_comp_ratio": round(average_comp_ratio, 2),
                    "underpaid_percentage": round((underpaid_count / total_employees * 100), 1) if total_employees > 0 else 0.0
                },
                "audit_records": audit_records
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing salary benchmarking audit: {str(e)}"
        )
