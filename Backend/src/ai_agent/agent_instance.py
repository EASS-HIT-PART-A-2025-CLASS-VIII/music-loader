from pathlib import Path
from dotenv import load_dotenv
from pydantic_ai import Agent
import os
from functools import lru_cache

# Default to a widely-available Anthropic model through the gateway (Haiku tier is commonly allowed).
DEFAULT_MODEL = "gateway/anthropic:claude-3-5-haiku-latest"

ENV_ROOT = Path(__file__).resolve().parents[2]
for env_name in (".env.local", ".env.docker", ".env"):
    env_path = ENV_ROOT / env_name
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=False)
        break


def _get_model_name() -> str:
    return (os.getenv("PYDANTIC_AI_MODEL") or DEFAULT_MODEL).strip()

@lru_cache
def get_agent() -> Agent:
    if _get_model_name().startswith("gateway/"):
        if os.getenv("PYDANTIC_AI_GATEWAY_API_KEY") is None:
            raise RuntimeError("Missing PYDANTIC_AI_GATEWAY_API_KEY for gateway model")
    else:
        if os.getenv("ANTHROPIC_API_KEY") is None:
            raise RuntimeError("Missing ANTHROPIC_API_KEY for Anthropic model")
    return Agent(_get_model_name())
