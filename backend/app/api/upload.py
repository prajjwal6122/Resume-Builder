"""
Upload API routes — handle resume and JD file uploads.
Supports PDF, DOCX, TXT. Also exposes demo data endpoint.
"""
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.utils.text_extractor import extract_text, validate_file
from app.data.sample_data import SAMPLE_RESUME, SAMPLE_JD

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

# In-memory file store (session_id → text)
_uploaded_files: dict = {}


class JDTextRequest(BaseModel):
    jd_text: str


@router.post("/resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and extract text from a resume file (PDF, DOCX, TXT).
    Returns extracted text and a resume_id for session use.
    """
    try:
        file_bytes = await file.read()
        validate_file(file.filename or "file.txt", len(file_bytes))
        
        text = extract_text(
            file_bytes,
            file.filename or "resume.txt",
            file.content_type or ""
        )
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file. Please check the file is not empty or corrupted.")
        
        resume_id = str(uuid.uuid4())
        _uploaded_files[resume_id] = {"type": "resume", "text": text}
        
        logger.info(f"Resume uploaded: {resume_id} ({len(text)} chars)")
        
        return {
            "success": True,
            "resume": {
                "id": resume_id,
                "extracted_text": text[:500] + "..." if len(text) > 500 else text,
                "char_count": len(text),
                "filename": file.filename
            }
        }
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Resume upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/jd")
async def upload_jd(
    file: UploadFile = File(None),
    jd_text: str = Form(None)
):
    """
    Upload JD as a file OR as raw text.
    Returns extracted text and a jd_id for session use.
    """
    text = None
    filename = "job_description.txt"
    
    # Option 1: File upload
    if file and file.filename:
        try:
            file_bytes = await file.read()
            validate_file(file.filename, len(file_bytes))
            text = extract_text(file_bytes, file.filename, file.content_type or "")
            filename = file.filename
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # Option 2: Raw text
    elif jd_text:
        text = jd_text.strip()
    
    else:
        raise HTTPException(status_code=400, detail="Provide either a file or jd_text in the request body.")
    
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Job description text is empty.")
    
    jd_id = str(uuid.uuid4())
    _uploaded_files[jd_id] = {"type": "jd", "text": text}
    
    logger.info(f"JD uploaded: {jd_id} ({len(text)} chars)")
    
    return {
        "success": True,
        "jd": {
            "id": jd_id,
            "extracted_text": text[:500] + "..." if len(text) > 500 else text,
            "char_count": len(text),
            "filename": filename
        }
    }


@router.post("/jd-text")
async def upload_jd_text(request: JDTextRequest):
    """
    Upload JD as JSON with raw text body.
    Simpler endpoint for frontend form submission.
    """
    text = request.jd_text.strip()
    
    if not text:
        raise HTTPException(status_code=400, detail="Job description text is empty.")
    
    if len(text) < 50:
        raise HTTPException(status_code=400, detail="Job description too short. Please provide more detail.")
    
    jd_id = str(uuid.uuid4())
    _uploaded_files[jd_id] = {"type": "jd", "text": text}
    
    return {
        "success": True,
        "jd": {
            "id": jd_id,
            "char_count": len(text)
        }
    }


@router.get("/demo-data")
async def get_demo_data():
    """
    Return hardcoded sample resume and JD for quick demo.
    The 'Jane Developer' persona — specifically designed to show gaps.
    """
    resume_id = "demo-resume-001"
    jd_id = "demo-jd-001"
    
    # Store demo data in file store
    _uploaded_files[resume_id] = {"type": "resume", "text": SAMPLE_RESUME}
    _uploaded_files[jd_id] = {"type": "jd", "text": SAMPLE_JD}
    
    return {
        "success": True,
        "resume_id": resume_id,
        "jd_id": jd_id,
        "resume_preview": SAMPLE_RESUME[:300] + "...",
        "jd_preview": SAMPLE_JD[:300] + "...",
        "is_demo": True
    }


def get_uploaded_text(file_id: str) -> str | None:
    """Helper to retrieve uploaded text by ID."""
    entry = _uploaded_files.get(file_id)
    return entry["text"] if entry else None


def get_sample_text() -> tuple[str, str]:
    """Return the sample resume and JD text directly."""
    return SAMPLE_RESUME, SAMPLE_JD
