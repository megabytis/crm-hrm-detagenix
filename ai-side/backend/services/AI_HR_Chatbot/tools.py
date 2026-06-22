from pymongo import MongoClient
from langchain_core.tools import tool
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone
import os
from dotenv import load_dotenv
from policies import vectorstore

from bson import ObjectId
from pathlib import Path

# -----------------------------
# DB CONNECTION (DYNAMIC)
# -----------------------------
load_dotenv()
# Also search parent directory for Node .env
parent_env = Path(__file__).resolve().parents[4] / ".env"
if parent_env.exists():
    load_dotenv(dotenv_path=parent_env)

from pymongo.uri_parser import parse_uri

mongo_uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
mongo_uri = mongo_uri.strip('"').strip("'")

# Parse the database name from URI if present
try:
    parsed_uri = parse_uri(mongo_uri)
    db_name_from_uri = parsed_uri.get("database")
except Exception:
    db_name_from_uri = None

db_name = db_name_from_uri or os.getenv("DB_NAME") or "crm-hrms-DB"
db_name = db_name.strip('"').strip("'")

# Force crm-hrms-DB if the parsed/env database matches the empty test db placeholder
if db_name == "crm+hrm":
    db_name = "crm-hrms-DB"

client = MongoClient(mongo_uri)
db = client[db_name]


def _get_leave_balance(employee_id: str):
    # Parse ObjectId if possible
    try:
        emp_id = ObjectId(employee_id)
        is_obj = True
    except Exception:
        emp_id = employee_id
        is_obj = False

    # 1. Query leavebalances collection
    balance_record = db.leavebalances.find_one({"employee": emp_id})
    
    # 2. If not found, check if it exists in users collection (fallback)
    if not balance_record:
        user_record = db.users.find_one({"_id": emp_id})
        if user_record:
            total = user_record.get("totalLeaves", 20)
            used = user_record.get("usedLeaves", 0)
            balance_record = {
                "totalLeaves": total,
                "remainingLeaves": total - used
            }
        else:
            # Try searching by string/object cross matches
            if is_obj:
                balance_record = db.leavebalances.find_one({"employee": employee_id})
            else:
                try:
                    balance_record = db.leavebalances.find_one({"employee": ObjectId(employee_id)})
                except:
                    pass

    if not balance_record:
        return {"status": "error", "message": "Leave balance record not found"}

    # 3. Query leaves collection for detailed breakdown & pending requests
    leaves_query = {"employee": emp_id}
    leaves_history = list(db.leaves.find(leaves_query))
    if not leaves_history and is_obj:
        leaves_history = list(db.leaves.find({"employee": employee_id}))

    pending_count = sum(1 for l in leaves_history if l.get("status") == "Pending")
    
    used_breakdown = {"Sick": 0, "Casual": 0, "Earned": 0}
    for l in leaves_history:
        if l.get("status") == "Approved":
            ltype = l.get("leaveType", "Casual")
            from_d = l.get("fromDate")
            to_d = l.get("toDate")
            days = 1
            if from_d and to_d:
                try:
                    days = max(1, (to_d - from_d).days + 1)
                except:
                    pass
            if ltype in used_breakdown:
                used_breakdown[ltype] += days
            else:
                used_breakdown[ltype] = days

    total_leaves = balance_record.get("totalLeaves", 20)
    remaining_leaves = balance_record.get("remainingLeaves", 20)
    used_leaves = total_leaves - remaining_leaves

    return {
        "status": "success",
        "total": total_leaves,
        "used": used_leaves,
        "remaining": remaining_leaves,
        "breakdown": {
            "sick": {"total": 6, "used": used_breakdown.get("Sick", 0), "remaining": max(0, 6 - used_breakdown.get("Sick", 0))},
            "casual": {"total": 8, "used": used_breakdown.get("Casual", 0), "remaining": max(0, 8 - used_breakdown.get("Casual", 0))},
            "earned": {"total": max(0, total_leaves - 14), "used": used_breakdown.get("Earned", 0), "remaining": max(0, max(0, total_leaves - 14) - used_breakdown.get("Earned", 0))}
        },
        "pending_requests": pending_count,
        "last_leave_taken": "N/A"
    }


def _get_salary(employee_id: str):
    try:
        emp_id = ObjectId(employee_id)
        is_obj = True
    except Exception:
        emp_id = employee_id
        is_obj = False

    record = db.salarystructures.find_one({"employee": emp_id})
    if not record and is_obj:
        record = db.salarystructures.find_one({"employee": employee_id})
    if not record and not is_obj:
        try:
            record = db.salarystructures.find_one({"employee": ObjectId(employee_id)})
        except:
            pass

    if not record:
        return {"status": "error", "message": "Salary structure record not found"}

    basic = record.get("basicSalary", 0)
    hra = record.get("hra", 0)
    pf = record.get("pf", 0)
    bonus = record.get("bonus", 0)
    total = record.get("totalSalary", basic + hra + bonus - pf)

    return {
        "status": "success",
        "ctc": total * 12,
        "earnings": {
            "basic": basic,
            "hra": hra,
            "bonus": bonus
        },
        "total_earnings": basic + hra + bonus,
        "deductions": {
            "pf": pf
        },
        "total_deductions": pf,
        "net_salary": total,
        "pay_grade": "N/A",
        "last_increment_date": "N/A",
        "increment_percentage": 0
    }


def _get_employee_info(employee_id: str):
    try:
        emp_id = ObjectId(employee_id)
        is_obj = True
    except Exception:
        emp_id = employee_id
        is_obj = False

    record = db.users.find_one({"_id": emp_id})
    if not record and is_obj:
        record = db.users.find_one({"_id": employee_id})
    if not record and not is_obj:
        try:
            record = db.users.find_one({"_id": ObjectId(employee_id)})
        except:
            pass

    if not record:
        return {"status": "error", "message": "Employee record not found"}

    manager_name = "N/A"
    manager_id = record.get("reportingTo")
    if manager_id:
        try:
            manager_record = db.users.find_one({"_id": ObjectId(manager_id)})
            if manager_record:
                manager_name = manager_record.get("name", "N/A")
        except:
            pass

    return {
        "status": "success",
        "employee_code": str(record.get("_id"))[:8].upper(),
        "name": record.get("name"),
        "email": record.get("email"),
        "phone": record.get("phone", "N/A"),
        "role": record.get("role"),
        "department": record.get("department", "N/A"),
        "designation": record.get("designation", "N/A"),
        "manager_id": str(manager_id) if manager_id else "N/A",
        "manager_name": manager_name,
        "date_of_joining": str(record.get("createdAt"))[:10] if record.get("createdAt") else "N/A",
        "employment_type": "Full-time",
        "work_mode": "Office",
        "location": "N/A",
        "status": "Active" if record.get("isActive", True) else "Inactive",
        "skills": [record.get("techStack")] if record.get("techStack") else [],
        "performance_rating": "N/A",
        "bank_masked": f"...{str(record.get('accountNumber'))[-4:]}" if record.get("accountNumber") else "XXXX"
    }


def _query_policy_rag(query: str) -> str:
    if vectorstore is None:
        return "Company policies query is currently unavailable (Pinecone API Key is not configured)."

    docs = vectorstore.similarity_search(query, k=3)

    if not docs:
        return "No relevant policy found."

    context = "\n".join([doc.page_content for doc in docs])[:1500]

    return f"""Use the following company policy context to answer the user's question clearly:

    {context}

    Answer:"""

# =====================================================
# TOOL WRAPPER (LLM SAFE)
# =====================================================

def get_tools(employee_id: str):

    @tool
    def leave_balance_tool() -> str:
        """
        Fetch the current employee's leave balance including:
        - total leaves
        - used leaves
        - remaining leaves
        - leave type breakdown (casual, sick, earned)
        - pending leave requests
        - last leave taken

        MUST be used for:
        - leave balance queries
        - leave eligibility questions (e.g., "Can I take leave?")
        
        If the query also involves company rules,
        call this tool FIRST, then policy_rag_tool.
        """

        data = _get_leave_balance(employee_id)

        if data.get("status") == "error":
            return data["message"]

        breakdown_text = "\n".join([
            f"{k.capitalize()}: {v['remaining']} remaining (Used: {v['used']}/{v['total']})"
            for k, v in data["breakdown"].items()
        ])

        return (
            f"Leave Summary:\n"
            f"- Total: {data['total']}\n"
            f"- Used: {data['used']}\n"
            f"- Remaining: {data['remaining']}\n\n"
            f"- Breakdown:\n{breakdown_text}\n\n"
            f"- Pending Requests: {data['pending_requests']}\n"
            f"- Last Leave Taken: {data['last_leave_taken']}"
        )

    @tool
    def salary_tool() -> str:
        """
        Fetch the current employee's salary details including:
        - CTC
        - monthly earnings breakdown
        - deductions breakdown
        - net salary
        - pay grade
        - last increment info

        MUST be used for:
        - salary queries
        - salary breakdown
        - payslip explanation
        - compensation comparison

        If query involves company policy,
        call this tool FIRST, then policy_rag_tool.
        """

        data = _get_salary(employee_id)

        if data.get("status") == "error":
            return data["message"]

        earnings_text = "\n".join([
            f"{k.replace('_', ' ').title()}: ₹{v}"
            for k, v in data["earnings"].items()
        ])

        deductions_text = "\n".join([
            f"{k.upper()}: ₹{v}"
            for k, v in data["deductions"].items()
        ])

        return (
            f"Salary Summary:\n"
            f"- CTC: ₹{data['ctc']}\n"
            f"- Net Salary: ₹{data['net_salary']}\n\n"

            f"Earnings Breakdown:\n{earnings_text}\n"
            f"Total Earnings: ₹{data['total_earnings']}\n\n"

            f"Deductions:\n{deductions_text}\n"
            f"Total Deductions: ₹{data['total_deductions']}\n\n"

            f"Pay Grade: {data['pay_grade']}\n"
            f"Last Increment: {data['last_increment_date']} "
            f"({data['increment_percentage']}%)"
        )

    @tool
    def employee_info_tool() -> str:
        """
        Fetch the current employee's profile information including:
        - personal details
        - job role, department, designation
        - manager
        - skills & performance
        - employment details

        MUST be used for:
        - profile queries
        - role-based eligibility
        - promotion / appraisal queries

        If query involves company policy,
        call this tool FIRST, then policy_rag_tool.
        """

        data = _get_employee_info(employee_id)

        if data.get("status") == "error":
            return data["message"]

        skills_text = ", ".join(data["skills"]) if data["skills"] else "Not specified"

        return (
            f"👤 Employee Profile:\n"
            f"- Name: {data['name']}\n"
            f"- Employee Code: {data['employee_code']}\n"
            f"- Email: {data['email']}\n"
            f"- Phone: {data['phone']}\n\n"

            f"💼 Job Details:\n"
            f"- Role: {data['role']}\n"
            f"- Department: {data['department']}\n"
            f"- Designation: {data['designation']}\n"
            f"- Manager ID: {data['manager_id']}\n\n"

            f"📅 Employment Info:\n"
            f"- Joining Date: {data['date_of_joining']}\n"
            f"- Type: {data['employment_type']}\n"
            f"- Work Mode: {data['work_mode']}\n"
            f"- Location: {data['location']}\n"
            f"- Status: {data['status']}\n\n"

            f"🧠 Skills: {skills_text}\n"
            f"⭐ Performance Rating: {data['performance_rating']}\n\n"

            f"🏦 Bank: {data['bank_masked']} (masked)"
        )

    @tool
    def policy_rag_tool(query: str) -> str:
        """
        Retrieve official company HR policies such as:
        - leave rules
        - salary structure
        - WFH rules
        - attendance policies
        - eligibility criteria

        MUST be used for:
        - any company policy or rule-related query

        IMPORTANT:
        - If the user query involves employee-specific data,
        this tool MUST be called AFTER the relevant employee tool
        (leave_balance_tool, salary_tool, or employee_info_tool).
        - Never use this tool alone when personalization is required.
        """
        return _query_policy_rag(query)
        

    return [
        leave_balance_tool,
        salary_tool,
        employee_info_tool,
        policy_rag_tool
    ]