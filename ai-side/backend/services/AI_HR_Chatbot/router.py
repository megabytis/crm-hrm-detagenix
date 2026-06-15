import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Ensure internal modules (llm_layer, tools, etc.) are importable from this subdirectory
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

from llm_layer import create_hr_agent, safe_chat
from langchain_core.messages import HumanMessage, AIMessage

router = APIRouter(prefix="/hr-chatbot", tags=["AI HR Chatbot"])

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class HRMessageRequest(BaseModel):
    message: str
    employee_id: str
    history: Optional[List[ChatMessage]] = None

@router.post("/chat", summary="Query employee leave, salary, and company policies")
async def hr_chatbot_chat(payload: HRMessageRequest):
    """
    Exposes the secure AI HR Chatbot (Internal Employee Assistant) pipeline.
    
    Accepts user message, employee ID, and message history. Runs the secure ReAct agent (Gemini 2.0)
    scoped to the specific employee, querying MongoDB for leave/salary info or searching company policy PDFs in Pinecone.
    """
    try:
        # 1. Initialize agent scoped strictly to the employee's ID (prevents cross-user leaks)
        agent = create_hr_agent(payload.employee_id)

        # 2. Re-create LangChain message history list from input payload
        langchain_history = []
        if payload.history:
            for msg in payload.history:
                if msg.role == "user":
                    langchain_history.append(HumanMessage(content=msg.content))
                elif msg.role in ["assistant", "ai"]:
                    langchain_history.append(AIMessage(content=msg.content))

        # 3. Run safe_chat turn with guardrails, LLM calls, and audit logging
        reply, updated_history = safe_chat(agent, payload.employee_id, payload.message, langchain_history)

        # 4. Serialize updated message history back into a JSON-friendly format
        formatted_history = []
        for msg in updated_history:
            if isinstance(msg, HumanMessage):
                formatted_history.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                formatted_history.append({"role": "assistant", "content": msg.content})

        return {
            "success": True,
            "response": reply,
            "history": formatted_history
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing HR Chatbot pipeline: {str(e)}"
        )
