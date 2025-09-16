from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import List
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.pinecone_service import PineconeService
from services.gemini_service import GeminiService

router = APIRouter(tags=["generate"])
pinecone_service = PineconeService()
gemini_service = GeminiService()


class Role(str, Enum):
    INTERN = "intern"
    EMPLOYEE = "employee"
    MANAGER = "manager"
    EXECUTIVE = "executive"

class RetrievalMode(str, Enum):
    DENSE = "dense"
    SPARSE = "sparse"
    HYBRID = "hybrid"

class RetrievedChunk(BaseModel):
    id: str
    text: str
    role: str
    score: float

class UserInput(BaseModel):
    query: str
    retrieval_mode: str
    role: str
    rerank: bool
    top_k: int

class GenerateResponse(BaseModel):
    user_input: UserInput
    retrieved_chunks: List[RetrievedChunk]
    llm_output: str

class GenerateRequest(BaseModel):
    query: str
    retrieval_mode: RetrievalMode = RetrievalMode.DENSE
    role: Role
    rerank: bool = False
    top_k: int = 5

@router.post("/generate", response_model=GenerateResponse)
async def generate_response(request: GenerateRequest):
    """Generate AI response using retrieved chunks and Gemini"""
    
    # Search for relevant documents
    search_result = pinecone_service.search_documents(
        query=request.query,
        role=request.role.value,
        retrieval_mode=request.retrieval_mode.value,
        rerank=request.rerank,
        top_k=request.top_k
    )
    
    if not search_result["success"]:
        raise HTTPException(status_code=400, detail=search_result.get("message", "Search failed"))
    
    retrieved_chunks = search_result["chunks"]
    
    # Generate response using Gemini
    generation_result = gemini_service.generate_response(
        query=request.query,
        retrieved_chunks=retrieved_chunks
    )
    
    if not generation_result["success"]:
        raise HTTPException(status_code=500, detail=generation_result["response"])
    
    # Format response according to specification
    user_input = UserInput(
        query=request.query,
        retrieval_mode=request.retrieval_mode.value,
        role=request.role.value,
        rerank=request.rerank,
        top_k=request.top_k
    )
    
    formatted_chunks = [
        RetrievedChunk(
            id=chunk["id"],
            text=chunk["text"],
            role=chunk["role"],
            score=chunk["score"]
        )
        for chunk in retrieved_chunks
    ]
    
    return GenerateResponse(
        user_input=user_input,
        retrieved_chunks=formatted_chunks,
        llm_output=generation_result["response"]
    )