import asyncio
import os
from types import SimpleNamespace

import pytest

from src.utils import util


def test_is_pdf_text_variants():
    assert util.is_pdf_text("A4 PDF")
    assert util.is_pdf_text("  pdf A4  ")
    assert not util.is_pdf_text("not a pdf")


def test_download_pdf_writes_once(tmp_path, monkeypatch):
    saved_requests = {}

    class FakeResponse:
        def __init__(self):
            self.content = b"content"

        def raise_for_status(self):
            return None

    class FakeSession:
        def get(self, url, timeout=60):
            saved_requests["url"] = url
            return FakeResponse()

    monkeypatch.setattr(util, "session", FakeSession())

    pdf_url = "https://example.com/file.pdf"
    util.download_pdf(pdf_url, tmp_path)
    util.download_pdf(pdf_url, tmp_path)  # second call should no-op

    dest_path = tmp_path / "file.pdf"
    assert dest_path.read_bytes() == b"content"
    assert saved_requests["url"] == pdf_url


def test_wait_for_mongo_retries_then_succeeds(monkeypatch):
    calls = {"count": 0}

    class FlakyAdmin:
        def command(self, *_args, **_kwargs):
            calls["count"] += 1
            if calls["count"] < 2:
                raise RuntimeError("not ready")
            return {"ok": 1}

    client = SimpleNamespace(admin=FlakyAdmin())

    asyncio.run(util.wait_for_mongo(client, retries=2, delay=0))
    assert calls["count"] == 2


def test_wait_for_mongo_propagates_after_retries():
    class AlwaysFailAdmin:
        def command(self, *_args, **_kwargs):
            raise RuntimeError("still down")

    client = SimpleNamespace(admin=AlwaysFailAdmin())

    with pytest.raises(RuntimeError):
        asyncio.run(util.wait_for_mongo(client, retries=2, delay=0))
