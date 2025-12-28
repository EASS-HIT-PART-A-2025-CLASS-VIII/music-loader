from src.ai_agent.agent_instance import get_agent
from src.ai_agent.infos_agents import ai_infos
from src.schemas.agent_output import AgentInfosOutput
from src.schemas.composer_piece_info import ComposerPieceInfo
from src.scrapping.google_image import google_search_images


async def composer_info(composer_name: str) -> AgentInfosOutput:
    info = await ai_infos(get_agent(), composer_name)
    try:
        image_url = google_search_images(composer_name)
    except Exception as e:
        raise e
    return ComposerPieceInfo(info=info, image_url=image_url)
