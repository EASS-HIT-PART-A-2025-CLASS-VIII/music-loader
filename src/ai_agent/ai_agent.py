import contextlib
import os

from pydantic import Field

from pydantic import Field
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

#SETTINGS
def load_dotenv_if_present() -> None:
    """Load environment variables from nearby .env files without extra deps."""

    try:
        parents = Path(__file__).resolve().parents
    except Exception:
        return

    candidates: list[Path] = []
    if len(parents) >= 4:
        candidates.append(parents[3] / ".env")  # repo root
    if len(parents) >= 3:
        candidates.append(parents[2] / ".env")  # backend/.env

    for env_path in candidates:
        if not env_path.is_file():
            continue
        try:
            for raw_line in env_path.read_text(encoding="utf-8").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#"):
                    continue
                if line.startswith("export "):
                    line = line[len("export ") :].strip()
                if "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
        except OSError:
            pass
        break
    
    

class GroqAgentSettings(BaseSettings):
    """Environment-backed settings for the Groq-backed pydantic-ai agent."""

    groq_api_key: str | None = Field(None, alias="GROQ_API_KEY")
    groq_model: str | None = Field(None, alias="GROQ_MODEL")
    pydantic_ai_model: str | None = Field(None, alias="PYDANTIC_AI_MODEL")
    model_config = SettingsConfigDict(extra="ignore")

    @property
    def model_name(self) -> str:
        return self.groq_model or self.pydantic_ai_model or "groq:openai/gpt-oss-120b"


@lru_cache
def get_groq_settings() -> GroqAgentSettings:
    load_dotenv_if_present()
    return GroqAgentSettings()



#FILE: src/ai_agent/ai_agent.py