import asyncio
import importlib.util

import pytest

if importlib.util.find_spec("pydantic_ai") is None:
    pytest.skip("pydantic_ai not installed", allow_module_level=True)

from src.scrapping import repository
from src.schemas.composer_piece_info import ComposerPieceInfo


def test_composer_info_returns_info_and_image(monkeypatch):
    captured = {}
    fake_agent = object()

    def fake_get_agent():
        return fake_agent

    async def fake_ai_infos(agent, composer_name: str):
        captured["ai_infos"] = (agent, composer_name)
        return "Composer info"

    def fake_google_search_images(name: str):
        captured["google_search_images"] = name
        return "http://example.com/image.jpg"

    monkeypatch.setattr(repository, "get_agent", fake_get_agent)
    monkeypatch.setattr(repository, "ai_infos", fake_ai_infos)
    monkeypatch.setattr(
        repository, "google_search_images", fake_google_search_images
    )

    result = asyncio.run(repository.composer_info("Bach"))
    assert isinstance(result, ComposerPieceInfo)
    assert result.info == "Composer info"
    assert result.image_url == "http://example.com/image.jpg"
    assert captured["ai_infos"] == (fake_agent, "Bach")
    assert captured["google_search_images"] == "Bach"


def test_composer_info_propagates_image_errors(monkeypatch):
    def fake_get_agent():
        return object()

    async def fake_ai_infos(_agent, _composer_name: str):
        return "Composer info"

    def fake_google_search_images(_name: str):
        raise RuntimeError("boom")

    monkeypatch.setattr(repository, "get_agent", fake_get_agent)
    monkeypatch.setattr(repository, "ai_infos", fake_ai_infos)
    monkeypatch.setattr(
        repository, "google_search_images", fake_google_search_images
    )

    with pytest.raises(RuntimeError, match="boom"):
        asyncio.run(repository.composer_info("Chopin"))
