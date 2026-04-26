"""
LLM Client — OpenAI API wrapper with fallback handling.
Supports both regular and streaming calls.
"""
import os
import json
import re
import logging
from typing import Optional, AsyncGenerator
from openai import AsyncOpenAI, OpenAI

logger = logging.getLogger(__name__)

# Initialize clients
_client: Optional[AsyncOpenAI] = None
_sync_client: Optional[OpenAI] = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY", "")
        _client = AsyncOpenAI(api_key=api_key)
    return _client


def is_llm_available() -> bool:
    """Check if OpenAI API key is configured."""
    key = os.getenv("OPENAI_API_KEY", "")
    return bool(key and key.startswith("sk-") and len(key) > 20)


MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def call_llm(
    prompt: str,
    system_message: str = "You are a helpful AI assistant.",
    temperature: float = 0.3,
    max_tokens: int = 2000
) -> str:
    """
    Call LLM and return raw text response.
    Returns empty string on failure.
    """
    if not is_llm_available():
        logger.warning("OpenAI API key not configured — LLM unavailable")
        return ""

    try:
        client = get_client()
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=30
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return ""


async def call_llm_json(
    prompt: str,
    system_message: str = "You are a helpful AI assistant. Always respond with valid JSON.",
    temperature: float = 0.2
) -> Optional[dict]:
    """
    Call LLM and parse JSON from response.
    Returns None on failure.
    """
    json_system = system_message + "\nCRITICAL: Respond ONLY with valid JSON. No markdown, no explanation outside the JSON."
    
    raw = await call_llm(prompt, json_system, temperature, max_tokens=3000)
    
    if not raw:
        return None

    # Try to extract JSON from response
    try:
        # First: direct parse
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Second: find JSON block in markdown
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Third: find first { ... } block
    brace_match = re.search(r'(\{[\s\S]*\})', raw)
    if brace_match:
        try:
            return json.loads(brace_match.group(1))
        except json.JSONDecodeError:
            pass

    logger.error(f"Failed to parse JSON from LLM response: {raw[:200]}")
    return None


async def stream_llm(
    prompt: str,
    system_message: str = "You are a helpful AI assistant.",
    temperature: float = 0.5
) -> AsyncGenerator[str, None]:
    """
    Stream LLM response token by token.
    Yields text chunks as they arrive.
    """
    if not is_llm_available():
        yield "AI evaluation in progress..."
        return

    try:
        client = get_client()
        stream = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=1000,
            stream=True,
            timeout=30
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as e:
        logger.error(f"LLM streaming failed: {e}")
        yield f"[Evaluation unavailable: {str(e)[:50]}]"
