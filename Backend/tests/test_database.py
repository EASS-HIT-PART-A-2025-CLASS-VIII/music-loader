import pytest

from src.database import database


def test_database_singleton_and_properties(monkeypatch):
    monkeypatch.setenv("MONGO_URI", "mongodb://example")
    monkeypatch.setenv("MONGO_CURRENT_DB", "custom_db")

    created = {}

    class FakeMongoDatabase(dict):
        def __getitem__(self, name):
            created["collection"] = name
            return f"collection-{name}"

    class FakeMongoClient:
        def __init__(self, uri, serverSelectionTimeoutMS=None, connectTimeoutMS=None):
            created["uri"] = uri
            created["timeouts"] = (serverSelectionTimeoutMS, connectTimeoutMS)

        def __getitem__(self, name):
            created["db_name"] = name
            return FakeMongoDatabase()

    # reset singleton caches for a clean test run
    monkeypatch.setattr(database.Database, "_instance", None)
    database.get_database.cache_clear()
    monkeypatch.setattr(database, "MongoClient", FakeMongoClient)

    db = database.get_database()
    assert db.mongo_uri == "mongodb://example"
    assert created["db_name"] == "custom_db"
    assert db.pieces_collection == "collection-pieces_metadata"

    with pytest.raises(RuntimeError):
        database.Database()

    database.get_database.cache_clear()
