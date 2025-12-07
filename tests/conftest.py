import re
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Iterable

from bs4 import BeautifulSoup

# Ensure the project root is on sys.path so `import src...` works in tests.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class FakeCollection:
    def __init__(self, docs: Iterable[dict] | None = None):
        self.docs = list(docs or [])
        self.inserted: list[dict] = []
        self.deleted_queries: list[dict] = []

    def insert_one(self, doc: dict) -> None:
        self.inserted.append(doc)
        self.docs.append(doc)

    def delete_many(self, query: dict) -> None:
        self.deleted_queries.append(query)
        self.docs.clear()

    def find(self, query: dict) -> list[dict]:
        results: list[dict] = []
        if "title" in query:
            regex = query["title"]["$regex"]
            flags = query["title"].get("$options") == "i"
            matcher = re.compile(regex, re.IGNORECASE if flags else 0)
            for doc in self.docs:
                if matcher.search(doc.get("title", "")):
                    results.append(dict(doc))
        elif "style" in query:
            candidates = set(query["style"].get("$in", []))
            for doc in self.docs:
                if doc.get("style") in candidates:
                    results.append(dict(doc))
        return results


class FakeDatabase:
    def __init__(self) -> None:
        self.pieces_collection = FakeCollection()
        self.client = SimpleNamespace(admin=SimpleNamespace(command=lambda *_: {"ok": 1}))


class FakePieceDAO:
    def __init__(self):
        self.inserted: list[Any] = []
        self.title_queries: list[str] = []
        self.style_queries: list[str] = []
        self.by_title_result: list[dict] = []
        self.by_style_result: list[dict] = []

    def insert_object_to_db(self, piece: Any) -> None:
        self.inserted.append(piece)

    def get_pieces_by_title(self, title: str) -> list[dict]:
        self.title_queries.append(title)
        return list(self.by_title_result)

    def get_pieces_by_style(self, style: str) -> list[dict]:
        self.style_queries.append(style)
        return list(self.by_style_result)


def make_soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")
