"""
Text extraction utilities for PDF, DOCX, and plain text files.
"""
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_TEXT_LENGTH = 50_000            # 50K characters


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyPDF2."""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Could not read PDF file: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        raise ValueError(f"Could not read DOCX file: {str(e)}")


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from plain text bytes."""
    try:
        return file_bytes.decode("utf-8", errors="replace")
    except Exception as e:
        logger.error(f"TXT extraction failed: {e}")
        raise ValueError(f"Could not read text file: {str(e)}")


def extract_text(file_bytes: bytes, filename: str, content_type: str = "") -> str:
    """
    Auto-detect file type and extract text.
    Returns cleaned text string.
    """
    # Validate size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size is 10MB.")

    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf") or "pdf" in content_type:
        text = extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith(".docx") or "docx" in content_type or "openxmlformats" in content_type:
        text = extract_text_from_docx(file_bytes)
    elif filename_lower.endswith((".txt", ".md")) or "text/plain" in content_type:
        text = extract_text_from_txt(file_bytes)
    else:
        # Try plain text as fallback
        try:
            text = file_bytes.decode("utf-8", errors="replace")
        except Exception:
            raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")

    # Truncate if too long
    if len(text) > MAX_TEXT_LENGTH:
        logger.warning(f"Text truncated from {len(text)} to {MAX_TEXT_LENGTH} chars")
        text = text[:MAX_TEXT_LENGTH]

    return text.strip()


def validate_file(filename: str, file_size: int) -> None:
    """Validate file before processing."""
    if file_size > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size is 10MB, got {file_size / 1024 / 1024:.1f}MB.")
    
    allowed_extensions = {".pdf", ".docx", ".txt", ".md"}
    import os
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_extensions:
        raise ValueError(f"Unsupported file type '{ext}'. Please upload PDF, DOCX, or TXT.")
