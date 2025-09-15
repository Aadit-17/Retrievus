import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    # Pinecone settings - match the ingestion script
    PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "retrievus")
    PINECONE_NAMESPACE = "roles"  # Match the namespace from create_docs_batched.py
    PINECONE_CLOUD = "aws"
    PINECONE_REGION = "us-east-1"
    EMBEDDING_MODEL = "llama-text-embed-v2"
    RERANK_MODEL = "bge-reranker-v2-m3"
    
    # Gemini settings
    GEMINI_MODEL = "gemini-2.5-flash-lite"

    # Frontend Origin
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
