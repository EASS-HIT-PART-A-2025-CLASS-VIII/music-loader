from src.database.database import Database
from src.database.db_shared_repository import Repository
from src.schemas.musical_piece import MusicalPiece


class ComposerDAO:
    """
    DAO for Composer documents, backed by the shared Database instance.
    """

    def __init__(self, db: Database):
        self.db = db
        self.repository = Repository(
            collection=db.pieces_collection, model_cls=MusicalPiece
        )

    def insert_composer_to_db(self, composer: MusicalPiece):
        self.repository.insert_object_to_db(composer)

    def get_composers_by_name(self, name: str) -> list[dict]:
        return self.repository.get_object_by_composer(name)

    def get_pieces_by_style(self, style: str) -> list[dict]:
        return self.repository.get_object_by_style(style)

    def get_pieces_by_composer(self, composer: str) -> list[dict]:
        return self.repository.get_object_by_composer(composer)

    def get_pieces_by_instrument(self, instrument: str) -> list[dict]:
        return self.repository.get_object_by_instrument(instrument)

    def get_piece_by_id(self, piece_id: str) -> dict | None:
        return self.repository.get_object_by_id(piece_id)

    def get_piece_by_music_id_number(self, music_id_number: str) -> dict | None:
        return self.repository.get_object_by_field("music_id_number", music_id_number)

    def get_piece_by_pdf_url(self, pdf_url: str) -> dict | None:
        return self.repository.get_object_by_field("pdf_url", pdf_url)

    def update_notes(self, piece_id: str, notes: list[dict]) -> None:
        self.repository.update_notes(piece_id, notes)

    def get_all_styles(self) -> list[str]:
        return self.repository.get_all_styles()

    def get_all_instruments(self) -> list[str]:
        return self.repository.get_all_instruments()

    def get_all_composers(self) -> list[str]:
        return self.repository.get_all_composers()

    def search_pieces(self, query: str) -> list[dict]:
        return self.repository.search_pieces(query)
