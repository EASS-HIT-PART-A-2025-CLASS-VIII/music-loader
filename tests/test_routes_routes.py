import asyncio

import pytest
from pymongo.errors import PyMongoError

from src.routes import routes
from tests.conftest import FakePieceDAO


def test_get_pieces_by_style(monkeypatch):
    fake = FakePieceDAO()
    fake.by_style_result = [{"title": "A"}]
    monkeypatch.setattr(routes, "piece_dao", fake)

    result = asyncio.run(routes.get_pieces_by_style("jazz"))
    assert result == [{"title": "A"}]
    assert fake.style_queries == ["jazz"]


def test_get_pieces_by_name(monkeypatch):
    fake = FakePieceDAO()
    fake.by_title_result = [{"title": "B"}]
    monkeypatch.setattr(routes, "piece_dao", fake)

    result = asyncio.run(routes.get_pieces_by_name("nocturne"))
    assert result == [{"title": "B"}]
    assert fake.title_queries == ["nocturne"]


def test_get_pieces_by_style_raises_on_db_error(monkeypatch):
    class BoomDAO(FakePieceDAO):
        def get_pieces_by_style(self, style: str):
            raise PyMongoError("db down")

    monkeypatch.setattr(routes, "piece_dao", BoomDAO())

    with pytest.raises(routes.HTTPException) as exc:
        asyncio.run(routes.get_pieces_by_style("jazz"))
    assert exc.value.status_code == 500


def test_start_scrapping_endpoint_invokes_scraper(monkeypatch):
    called = {}

    def fake_start_scrapping(max_pieces, delay):
        called["args"] = (max_pieces, delay)

    monkeypatch.setattr(routes.mutopia, "start_scrapping", fake_start_scrapping)

    result = asyncio.run(routes.start_scrapping_endpoint())
    assert result == {"status": "started"}
    assert called["args"][0] == routes.config.MAX_PIECES


def test_start_scrapping_endpoint_respects_query_param(monkeypatch):
    called = {}

    def fake_start_scrapping(max_pieces, delay):
        called["args"] = (max_pieces, delay)

    monkeypatch.setattr(routes.mutopia, "start_scrapping", fake_start_scrapping)

    result = asyncio.run(routes.start_scrapping_endpoint(max_pieces=5))
    assert result == {"status": "started"}
    assert called["args"][0] == 5
