"""
SkillAssess — AI-Powered Skill Assessment & Learning Plan Agent
Main FastAPI application entry point.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 SkillAssess API starting up...")
    logger.info(f"   Model: {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}")
    llm_ready = bool(os.getenv("OPENAI_API_KEY", "").startswith("sk-"))
    logger.info(f"   LLM: {'✅ Ready' if llm_ready else '⚠️  No API key — using fallback mode'}")
    yield
    logger.info("👋 SkillAssess API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="SkillAssess API",
    description="AI-Powered Skill Assessment & Personalized Learning Plan Agent",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow frontend dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # Production frontend
        "*"  # TODO: restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from app.api.upload import router as upload_router
from app.api.assess import router as assess_router

app.include_router(upload_router)
app.include_router(assess_router)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from app.services.llm_client import is_llm_available
    from app.services.session_manager import get_active_session_count
    
    return {
        "status": "ok",
        "version": "1.0.0",
        "services": {
            "api": "ok",
            "llm": "ready" if is_llm_available() else "fallback_mode",
            "sessions": get_active_session_count()
        }
    }


@app.get("/")
async def root():
    """Root endpoint — API info."""
    return {
        "name": "SkillAssess API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "demo_data": "GET /api/upload/demo-data",
            "start_assessment": "POST /api/assess/start",
            "submit_answer": "POST /api/assess/{session_id}/answer",
            "complete": "POST /api/assess/{session_id}/complete",
            "results": "GET /api/assess/{session_id}/results"
        }
    }
