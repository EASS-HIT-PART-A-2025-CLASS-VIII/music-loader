import re
from pydantic_ai import Agent
from pydantic_ai.exceptions import ModelHTTPError

from src.schemas.agent_output import AgentInfosOutput


async def ai_infos(agent, info_query: str):
    SYSTEM_PROMPT = """You are receiving a name of a music composer, or a name of a musical piece.
    Your task is to give informations about the composer, and make it interesting.
    If you have no information about the composer or the piece, say "No information available".
    If the input is a composer name, you also need to find a valid URL of an image of the composer, and return it along with the info.
    The output must be a json with the following structure:
    {
        "info": "<informations about the composer or the piece>",
        "image_url": "<valid URL of an image of the composer>" // only if the input is a composer name
    }
    """
    try:
        result = await agent.run(info_query, instructions=SYSTEM_PROMPT)
    except ModelHTTPError as e:
        if getattr(e, "status_code", None) == 403:
            fallback_agent = Agent("gateway/anthropic:claude-3-5-haiku-latest")
            result = await fallback_agent.run(info_query, instructions=SYSTEM_PROMPT)
        else:
            raise e

    def _strip_markdown_fence(text: str) -> str:
        cleaned = text.strip()
        fenced = re.match(r"```(?:json)?\s*(.*)```", cleaned, flags=re.DOTALL)
        return fenced.group(1).strip() if fenced else cleaned

    cleaned = _strip_markdown_fence(result.output)
    return AgentInfosOutput.model_validate_json(cleaned)
