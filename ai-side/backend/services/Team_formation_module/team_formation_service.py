from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional

from pymongo import MongoClient
from pymongo.collection import Collection

from employee_scorer import score_all_employees
from team_builder import build_team_options

LOGGER = logging.getLogger(__name__)

# =========================
# MongoDB Config
# Pull from env or fallback to default
# =========================
from pymongo.uri_parser import parse_uri

# Parse the database name from URI if present
mongo_uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
mongo_uri = mongo_uri.strip('"').strip("'")

try:
    parsed_uri = parse_uri(mongo_uri)
    db_name_from_uri = parsed_uri.get("database")
except Exception:
    db_name_from_uri = None

db_name = db_name_from_uri or os.getenv("DB_NAME") or "crm-hrms-DB"
db_name = db_name.strip('"').strip("'")
if db_name == "crm+hrm":
    db_name = "crm-hrms-DB"

MONGO_URI = mongo_uri
MONGO_DB = db_name

class TeamFormationError(RuntimeError):
    """Raised when team formation fails."""


# =========================
# MongoDB Connection
# =========================
def _get_collection() -> Collection:
    client = MongoClient(MONGO_URI)
    db     = client[MONGO_DB]
    # Check if 'users' collection exists, otherwise fallback to 'employees'
    cols = db.list_collection_names()
    if "users" in cols:
        return db["users"]
    elif "employees" in cols:
        return db["employees"]
    return db["users"]


def _map_employee_fields(emp: Dict[str, Any]) -> Dict[str, Any]:
    # 1. Map skills from skills array or techStack
    skills = emp.get("skills")
    if not skills:
        tech_stack = emp.get("techStack")
        if tech_stack:
            ts_lower = tech_stack.lower()
            if "mern" in ts_lower:
                skills = ["React", "Node.js", "Express", "MongoDB", "MERN", "JavaScript", "HTML", "CSS"]
            elif "full stack" in ts_lower:
                skills = ["React", "Node.js", "Express", "MongoDB", "SQL", "JavaScript", "HTML", "CSS", "Full Stack"]
            elif "aiml" in ts_lower:
                skills = ["Python", "ML", "AI", "TensorFlow", "PyTorch", "AIML", "Data Science", "Machine Learning"]
            elif "frontend" in ts_lower:
                skills = ["React", "HTML", "CSS", "JavaScript", "Frontend", "TypeScript"]
            elif "backend" in ts_lower:
                skills = ["Node.js", "Express", "Python", "MongoDB", "SQL", "Backend", "REST API", "Java"]
            else:
                skills = [tech_stack]
        else:
            skills = []
    
    # Ensure all elements are strings
    skills = [str(s) for s in skills]

    # 2. Performance rating / score mapping
    perf = emp.get("performance_score") or emp.get("performance") or emp.get("performance_rating") or emp.get("performanceRating")
    if perf is None:
        perf = 80 # default healthy score
        
    # 3. Workload
    workload = emp.get("current_workload") or emp.get("currentWorkload")
    if workload is None:
        workload = 30 # default moderately available
        
    # 4. Role / designation
    role = emp.get("role") or emp.get("designation") or "Developer"
    
    return {
        "_id": str(emp.get("_id")),
        "name": emp.get("name", "Unknown"),
        "role": role,
        "skills": skills,
        "performance_score": perf,
        "current_workload": workload
    }


def _fetch_employees(required_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Fetch employees from MongoDB.

    Strategy:
    - First try to find employees with at least one matching skill
    - If too few results, fetch all active employees as fallback
    """
    collection = _get_collection()

    # Normalize skills for case-insensitive match
    skills_normalized = [s.strip().lower() for s in required_skills]

    # Query: active employees who have at least 1 required skill (support both status and isActive fields)
    active_clause = {"$or": [
        {"status": {"$in": ["active", "Active"]}},
        {"isActive": True},
        {"isActive": {"$exists": False}}
    ]}
    
    # We query all active employees first, and then filter/map them in Python
    # to support dynamic translation of fields like techStack -> skills.
    all_active = list(collection.find(active_clause))
    
    employees = []
    for emp in all_active:
        mapped = _map_employee_fields(emp)
        # Check if has at least one matching skill
        emp_skills_norm = [s.lower() for s in mapped["skills"]]
        has_matching_skill = False
        for req_skill in skills_normalized:
            if any(req_skill in es or es in req_skill for es in emp_skills_norm):
                has_matching_skill = True
                break
        if has_matching_skill:
            employees.append(mapped)

    # Fallback: if less than 5 matched, fetch all active employees
    if len(employees) < 5:
        LOGGER.warning("Few skill-matched employees found (%d). Fetching all active employees.", len(employees))
        employees = [_map_employee_fields(emp) for emp in all_active]

    # Convert ObjectId to string
    for emp in employees:
        if "_id" in emp:
            emp["_id"] = str(emp["_id"])

    LOGGER.info("Fetched %d employees from MongoDB.", len(employees))
    return employees


# =========================
# Core Service Function
# =========================
def recommend_team(
    project_type: str,
    required_skills: List[str],
    team_size: int = 3,
    top_n_options: int = 3,
) -> Dict[str, Any]:
    """
    Main entry point.

    Args:
        project_type:    e.g. "Web Development", "Data Science"
        required_skills: e.g. ["React", "Node.js", "MongoDB"]
        team_size:       how many members per team (default 3)
        top_n_options:   how many alternative teams to return (default 3)

    Returns:
        {
            "status": "success",
            "project": { ... },
            "recommended_team": { rank 1 team },
            "alternatives": [ rank 2, rank 3, ... ],
            "all_employee_scores": [ scored + ranked list of all employees ]
        }
    """
    try:
        if not required_skills:
            raise ValueError("required_skills cannot be empty.")
        if not project_type:
            raise ValueError("project_type cannot be empty.")
        if team_size < 1:
            raise ValueError("team_size must be at least 1.")

        # Step 1: Fetch employees from MongoDB
        employees = _fetch_employees(required_skills)

        if not employees:
            raise TeamFormationError("No active employees found in the database.")

        # Step 2: Score every employee
        scored_employees = score_all_employees(employees, required_skills, project_type)

        # Step 3: Build team combinations
        team_options = build_team_options(
            scored_employees,
            required_skills,
            team_size=team_size,
            top_n_options=top_n_options,
        )

        if not team_options:
            raise TeamFormationError("Could not generate any team options.")

        # Step 4: Separate best team from alternatives
        recommended = team_options[0]
        alternatives = team_options[1:]

        return {
            "status": "success",
            "project": {
                "project_type":    project_type,
                "required_skills": required_skills,
                "team_size":       team_size,
            },
            "recommended_team":    recommended,
            "alternatives":        alternatives,
            "all_employee_scores": [
                {
                    "employee_id":     e["employee_id"],
                    "name":            e["name"],
                    "role":            e["role"],
                    "final_score":     e["final_score"],
                    "score_breakdown": e["score_breakdown"],
                }
                for e in scored_employees
            ],
        }

    except TeamFormationError:
        raise
    except Exception as error:
        LOGGER.error("Team formation failed: %s", error)
        raise TeamFormationError(f"Team formation failed: {error}") from error
