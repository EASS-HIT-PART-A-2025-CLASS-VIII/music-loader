import asyncio
import types

import importlib


def test_create_app_includes_routes(monkeypatch):
    main = importlib.import_module("main")
    app = main.create_app()
    paths = {route.path for route in app.router.routes}
    assert "/start-scrapping" in paths
    assert "/pieces/styles/{style}" in paths


def test_lifespan_attaches_db(monkeypatch):
    main = importlib.import_module("main")

    closed = {}

    class FakeClient:
        def close(self):
            closed["closed"] = True

    fake_container = types.SimpleNamespace(db=types.SimpleNamespace(client=FakeClient()))
    monkeypatch.setattr(main, "get_container", lambda: fake_container)

    app = main.create_app()
    async def _run():
        async with main.lifespan(app):
            assert app.state.db is fake_container.db
        assert closed["closed"] is True

    asyncio.run(_run())
