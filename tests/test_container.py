from src.DI import container
from tests.conftest import FakeDatabase


def test_get_container_is_singleton(monkeypatch):
    monkeypatch.setattr(container, "Database", FakeDatabase)
    monkeypatch.setattr(container, "MusicalPieceDAO", lambda db: ("dao", db))
    container.get_container.cache_clear()

    first = container.get_container()
    second = container.get_container()

    assert first is second
    assert isinstance(first.db, FakeDatabase)
    assert first.piece_dao == ("dao", first.db)
    container.get_container.cache_clear()


def test_get_db_and_piece_dao_helpers(monkeypatch):
    monkeypatch.setattr(container, "Database", FakeDatabase)
    monkeypatch.setattr(container, "MusicalPieceDAO", lambda db: ("dao", db))
    container.get_container.cache_clear()

    assert container.get_db() is container.get_container().db
    assert container.get_piece_dao() == ("dao", container.get_container().db)
    container.get_container.cache_clear()
