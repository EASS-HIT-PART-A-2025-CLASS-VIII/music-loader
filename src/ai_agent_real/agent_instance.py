from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent
import os
from functools import lru_cache

# Load .env from project root
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env", override=False)

def _get_model_name() -> str:
    return os.getenv("PYDANTIC_AI_MODEL") or "gateway/anthropic:claude-sonnet-4-5"

@lru_cache
def get_agent() -> Agent:
    if _get_model_name().startswith("gateway/"):
        if os.getenv("PYDANTIC_AI_GATEWAY_API_KEY") is None:
            raise RuntimeError("Missing PYDANTIC_AI_GATEWAY_API_KEY for gateway model")
    else:
        if os.getenv("ANTHROPIC_API_KEY") is None:
            raise RuntimeError("Missing ANTHROPIC_API_KEY for Anthropic model")
    return Agent(_get_model_name())
