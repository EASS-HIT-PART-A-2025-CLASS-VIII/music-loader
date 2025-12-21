from src.database.musical_piece_dao import MusicalPieceDAO
from src.schemas.musical_piece import MusicalPiece
from tests.conftest import FakeDatabase


def test_musical_piece_dao_inserts_and_reads():
    fake_db = FakeDatabase()
    # Preload collection with one document
    fake_db.pieces_collection.docs.append(
        {"_id": 1, "title": "Existing", "style": "Jazz"}
    )
    dao = MusicalPieceDAO(fake_db)

    new_piece = MusicalPiece.model_validate(
        {"title": "New Piece", "style": "Classical"}
    )
    dao.insert_object_to_db(new_piece)
    assert fake_db.pieces_collection.inserted[0]["title"] == "New Piece"

    by_title = dao.get_pieces_by_title("existing")
    assert by_title[0]["title"] == "Existing"

    by_style = dao.get_pieces_by_style("jazz")
    assert by_style[0]["style"] == "Jazz"
