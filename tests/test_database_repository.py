from src.database.db_repository import Repository
from src.schemas.models import MusicalPiece
from tests.conftest import FakeCollection


def test_serialize_valid_document():
    collection = FakeCollection()
    repo = Repository(collection, MusicalPiece)
    doc = {"_id": 1, "title": "Nocturne", "style": "Romantic"}

    serialized = repo._serialize(doc)

    assert serialized["_id"] == "1"
    assert serialized["title"] == "Nocturne"
    assert serialized["style"] == "Romantic"


def test_serialize_invalid_document_returns_none():
    collection = FakeCollection()
    repo = Repository(collection, MusicalPiece)
    doc = {"_id": 1, "title": "   "}

    assert repo._serialize(doc) is None


def test_insert_and_delete_methods_delegate():
    collection = FakeCollection()
    repo = Repository(collection, MusicalPiece)
    piece = MusicalPiece.model_validate({"title": "Prelude"})

    repo.insert_object_to_db(piece)
    assert collection.inserted == [piece.model_dump(by_alias=True)]

    repo.delete_all_objects_from_db()
    assert collection.deleted_queries == [{}]
    assert collection.docs == []


def test_get_object_by_title_filters_with_regex():
    docs = [
        {"_id": 1, "title": "Nocturne in E-flat major"},
        {"_id": 2, "title": "Sonata in C"},
    ]
    collection = FakeCollection(docs)
    repo = Repository(collection, MusicalPiece)

    results = repo.get_object_by_title("nocturne")

    assert len(results) == 1
    assert results[0]["_id"] == "1"


def test_get_object_by_style_matches_variants():
    docs = [
        {"_id": 1, "title": "Work A", "style": "Baroque"},
        {"_id": 2, "title": "Work B", "style": "Classical"},
    ]
    collection = FakeCollection(docs)
    repo = Repository(collection, MusicalPiece)

    results = repo.get_object_by_style("baroque")

    assert results and results[0]["_id"] == "1"
    assert results[0]["title"] == "Work A"
    assert results[0]["style"] == "Baroque"
