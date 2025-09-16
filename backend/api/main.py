from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import sys
import os

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from routes.generate import router as generate_router

# Initialize FastAPI app
app = FastAPI(
    title="Retrievus API", 
    description="A scalable RAG system backend using Pinecone and Google Gemini",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://retrievus-frontend.vercel.app",  # Your Vercel frontend URL
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate_router)

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