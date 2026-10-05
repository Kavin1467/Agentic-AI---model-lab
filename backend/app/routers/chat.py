import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import ChatMessageDB, ChatRequest, ChatResponse
from ..agent import FinancialAIAgent

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

@router.post("", response_model=ChatResponse)
async def chat_with_agent(req: ChatRequest, db: Session = Depends(get_db)):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_msg_text = req.message.strip()

    # Save user message to database
    user_record = ChatMessageDB(
        role="user",
        content=user_msg_text,
        timestamp=datetime.utcnow()
    )
    db.add(user_record)
    db.commit()

    # Instantiate AI agent and execute
    try:
        agent = FinancialAIAgent(db=db, user_api_key=req.api_key)
        agent_output = await agent.execute_agent(user_msg_text)
    except Exception as e:
        print(f"Error during agent execution: {e}")
        agent_output = {
            "reply": f"⚠️ I encountered a temporary issue reading the analytics: {str(e)}. Please try asking again!",
            "suggested_actions": ["What is this project?", "How much did I spend this week?"]
        }

    # Save assistant response
    metadata = {}
    if agent_output.get("chart_data"):
        metadata["chart_data"] = agent_output["chart_data"]
    if agent_output.get("suggested_actions"):
        metadata["suggested_actions"] = agent_output["suggested_actions"]

    assistant_record = ChatMessageDB(
        role="assistant",
        content=agent_output["reply"],
        timestamp=datetime.utcnow(),
        metadata_json=json.dumps(metadata) if metadata else None
    )
    db.add(assistant_record)
    db.commit()

    return ChatResponse(
        reply=agent_output["reply"],
        suggested_actions=agent_output.get("suggested_actions", []),
        data_summary=agent_output.get("data_summary"),
        chart_data=agent_output.get("chart_data")
    )


@router.get("/history")
def get_chat_history(limit: int = 50, db: Session = Depends(get_db)):
    messages = db.query(ChatMessageDB).order_by(ChatMessageDB.timestamp.asc()).limit(limit).all()
    out = []
    for m in messages:
        meta = json.loads(m.metadata_json) if m.metadata_json else {}
        out.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "timestamp": m.timestamp.isoformat(),
            "metadata": meta
        })
    return out


@router.delete("/history")
def clear_chat_history(db: Session = Depends(get_db)):
    db.query(ChatMessageDB).delete()
    db.commit()
    return {"status": "success", "message": "Chat history cleared"}
