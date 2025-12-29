import pytest

from src.scrapping import image_api


class FakeResponse:
    def __init__(self, payload: dict):
        self._payload = payload
        self.raise_called = False

    def raise_for_status(self) -> None:
        self.raise_called = True

    def json(self) -> dict:
        return self._payload


def test_search_images_returns_original(monkeypatch):
    response = FakeResponse(
        {"photos": [{"src": {"original": "http://example.com/original.jpg"}}]}
    )
    captured = {}

    def fake_get(url, headers=None, params=None, timeout=None):
        captured["url"] = url
        captured["headers"] = headers
        captured["params"] = params
        captured["timeout"] = timeout
        return response

    monkeypatch.setattr(image_api.requests, "get", fake_get)
    monkeypatch.setattr(image_api.random, "randint", lambda *_args: 0)

    result = image_api.search_images("cats", per_page=3)
    assert result == "http://example.com/original.jpg"
    assert response.raise_called is True
    assert captured["url"] == image_api.PEXELS_SEARCH_URL
    assert captured["headers"]["Authorization"] == (
        "t4uY3dVfiC0a9W5q5uf99kI8kjalf3gZJ1lJqrvPdPkLoshmQtAqE9fC"
    )
    assert captured["params"] == {"query": "cats", "per_page": 3}
    assert captured["timeout"] == 15


def test_search_images_falls_back_to_url(monkeypatch):
    response = FakeResponse({"photos": [{"url": "http://example.com/fallback.jpg"}]})
    monkeypatch.setattr(image_api.requests, "get", lambda *_args, **_kwargs: response)
    monkeypatch.setattr(image_api.random, "randint", lambda *_args: 0)

    result = image_api.search_images("dogs")
    assert result == "http://example.com/fallback.jpg"


def test_search_images_raises_on_empty_results(monkeypatch):
    response = FakeResponse({"photos": []})
    monkeypatch.setattr(image_api.requests, "get", lambda *_args, **_kwargs: response)

    with pytest.raises(ValueError, match="No photos returned for query"):
        image_api.search_images("birds")
