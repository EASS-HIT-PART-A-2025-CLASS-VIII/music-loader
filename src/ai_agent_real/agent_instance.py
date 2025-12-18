from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_ai import Agent


def _load_env_file(path: Path = Path(".env")) -> None:
    """Lightweight .env loader for local runs without extra deps."""
    if not path.exists():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _get_model_name() -> str:
    return os.getenv("PYDANTIC_AI_MODEL") or "gateway/anthropic:claude-sonnet-4-5"


@lru_cache
def get_agent() -> Agent:
    _load_env_file()
    if os.getenv("PYDANTIC_AI_GATEWAY_API_KEY") is None:
        raise RuntimeError("Missing PYDANTIC_AI_GATEWAY_API_KEY")
    return Agent(_get_model_name())
