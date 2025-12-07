import asyncio
from types import SimpleNamespace

from fastapi.responses import FileResponse
from pymongo.errors import PyMongoError

from src.routes import server


def test_read_root():
    assert asyncio.run(server.read_root()) == {"status": "ok"}
    assert asyncio.run(server.read_root_head()) == {}


def test_health_skips_db(monkeypatch):
    monkeypatch.setenv("HEALTHCHECK_DB", "false")
    assert asyncio.run(server.health()) == {"status": "ok", "db": "skipped"}
    assert asyncio.run(server.health_head()) == {}


def test_health_reports_ok(monkeypatch):
    monkeypatch.setenv("HEALTHCHECK_DB", "true")
    client = SimpleNamespace(admin=SimpleNamespace(command=lambda *_args: {"ok": 1}))
    monkeypatch.setattr(server, "get_db", lambda: SimpleNamespace(client=client))

    result = asyncio.run(server.health())
    assert result == {"status": "ok", "db": "ok"}


def test_health_reports_unhealthy(monkeypatch):
    monkeypatch.setenv("HEALTHCHECK_DB", "true")

    def failing_command(*_args, **_kwargs):
        raise PyMongoError("no ping")

    client = SimpleNamespace(admin=SimpleNamespace(command=failing_command))
    monkeypatch.setattr(server, "get_db", lambda: SimpleNamespace(client=client))

    result = asyncio.run(server.health())
    assert result == {"status": "ok", "db": "unhealthy"}


def test_favicon_returns_file_response():
    response = asyncio.run(server.favicon())
    assert isinstance(response, FileResponse)
    assert response.path.endswith("favicon.ico")
