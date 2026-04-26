"""
In-memory session manager for assessment sessions.
No database needed — all state held in Python dict.
Sessions expire after 2 hours.
"""
import uuid
import time
import logging
from typing import Optional
from app.models.session import AssessmentSession, AssessmentStatus

logger = logging.getLogger(__name__)

# In-memory store: session_id → AssessmentSession
_sessions: dict[str, AssessmentSession] = {}

SESSION_TTL_SECONDS = 2 * 60 * 60  # 2 hours


def create_session(
    resume_text: str,
    jd_text: str,
    is_demo: bool = False
) -> AssessmentSession:
    """Create a new assessment session and return it."""
    session_id = str(uuid.uuid4())
    session = AssessmentSession(
        id=session_id,
        status=AssessmentStatus.STARTED,
        resume_text=resume_text,
        jd_text=jd_text,
        is_demo=is_demo,
        created_at=time.time()
    )
    _sessions[session_id] = session
    logger.info(f"Created session {session_id} (demo={is_demo})")
    return session


def get_session(session_id: str) -> Optional[AssessmentSession]:
    """Get a session by ID. Returns None if not found or expired."""
    _cleanup_expired()
    session = _sessions.get(session_id)
    if session is None:
        logger.warning(f"Session {session_id} not found")
    return session


def update_session(session_id: str, **kwargs) -> Optional[AssessmentSession]:
    """Update session fields. Returns updated session or None."""
    session = get_session(session_id)
    if session is None:
        return None
    
    for key, value in kwargs.items():
        if hasattr(session, key):
            setattr(session, key, value)
        else:
            logger.warning(f"Session has no attribute '{key}'")
    
    _sessions[session_id] = session
    return session


def add_answer(session_id: str, evaluation: dict) -> Optional[AssessmentSession]:
    """Append an evaluation result to the session's answers list."""
    session = get_session(session_id)
    if session is None:
        return None
    
    session.answers.append(evaluation)
    session.status = AssessmentStatus.IN_PROGRESS
    _sessions[session_id] = session
    return session


def complete_session(session_id: str, results: dict, learning_plan: dict) -> Optional[AssessmentSession]:
    """Mark session as completed with final results."""
    session = get_session(session_id)
    if session is None:
        return None
    
    session.status = AssessmentStatus.COMPLETED
    session.results = results
    session.learning_plan = learning_plan
    session.completed_at = time.time()
    _sessions[session_id] = session
    logger.info(f"Session {session_id} completed")
    return session


def delete_session(session_id: str) -> bool:
    """Delete a session. Returns True if deleted."""
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def _cleanup_expired() -> None:
    """Remove expired sessions (older than TTL)."""
    now = time.time()
    expired = [
        sid for sid, session in _sessions.items()
        if now - session.created_at > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        del _sessions[sid]
        logger.info(f"Cleaned up expired session {sid}")


def get_active_session_count() -> int:
    """Get count of active (non-expired) sessions."""
    _cleanup_expired()
    return len(_sessions)
