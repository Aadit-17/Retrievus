from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .config import Config
from .routes import generate

# Initialize FastAPI app
app = FastAPI(
    title="Retrievus API", 
    description="A scalable RAG system backend using Pinecone and Google Gemini",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[Config.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate.router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Retrievus API",
        "version": "1.0.0", 
        "docs": "/docs",
        "endpoint": "/generate"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Retrievus API is running"
    }

handler = Mangum(app)