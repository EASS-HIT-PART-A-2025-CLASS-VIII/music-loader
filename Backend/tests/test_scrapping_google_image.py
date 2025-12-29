import pytest

from src.scrapping import google_image


class FakeResponse:
    def __init__(self, payload: dict, text: str = "ok"):
        self._payload = payload
        self.text = text
        self.raise_called = False

    def raise_for_status(self) -> None:
        self.raise_called = True

    def json(self) -> dict:
        return self._payload


def test_google_search_images_requires_api_key(monkeypatch):
    monkeypatch.delenv("GOOGLE_IMAGE_API", raising=False)
    monkeypatch.setenv("GOOGLE_IMAGE_CX", "cx")

    with pytest.raises(ValueError, match="Missing GOOGLE_IMAGE_API"):
        google_image.google_search_images("mozart")


def test_google_search_images_requires_cse_id(monkeypatch):
    monkeypatch.setenv("GOOGLE_IMAGE_API", "api")
    monkeypatch.delenv("GOOGLE_IMAGE_CX", raising=False)

    with pytest.raises(ValueError, match="Missing Google Custom Search engine id"):
        google_image.google_search_images("mozart")


def test_google_search_images_success(monkeypatch):
    monkeypatch.setenv("GOOGLE_IMAGE_API", "api")
    monkeypatch.setenv("GOOGLE_IMAGE_CX", "cx")

    response = FakeResponse({"items": [{"link": "http://example.com/img.jpg"}]})
    captured = {}

    def fake_get(url, params=None, timeout=None):
        captured["url"] = url
        captured["params"] = params
        captured["timeout"] = timeout
        return response

    monkeypatch.setattr(google_image.requests, "get", fake_get)

    result = google_image.google_search_images("beethoven")
    assert result == "http://example.com/img.jpg"
    assert response.raise_called is True
    assert captured["url"] == google_image.GOOGLE_CUSTOM_SEARCH_URL
    assert captured["timeout"] == 15
    assert captured["params"] == {
        "key": "api",
        "cx": "cx",
        "q": "beethoven",
        "searchType": "image",
        "num": 1,
        "safe": "active",
        "imgType": "photo",
    }


def test_google_search_images_raises_on_empty_results(monkeypatch):
    monkeypatch.setenv("GOOGLE_IMAGE_API", "api")
    monkeypatch.setenv("GOOGLE_IMAGE_CX", "cx")
    monkeypatch.setattr(
        google_image.requests, "get", lambda *args, **kwargs: FakeResponse({"items": []})
    )

    with pytest.raises(ValueError, match="No image results returned for query"):
        google_image.google_search_images("haydn")


def test_google_search_images_raises_on_missing_link(monkeypatch):
    monkeypatch.setenv("GOOGLE_IMAGE_API", "api")
    monkeypatch.setenv("GOOGLE_IMAGE_CX", "cx")
    monkeypatch.setattr(
        google_image.requests,
        "get",
        lambda *args, **kwargs: FakeResponse({"items": [{}]}),
    )

    with pytest.raises(ValueError, match="Image result missing link"):
        google_image.google_search_images("schubert")
