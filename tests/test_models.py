import pytest

from src.schemas.musical_piece import MusicalPiece


def test_title_validator():
    piece = MusicalPiece.model_validate({"title": "Valid"})
    assert piece.title == "Valid"

    with pytest.raises(ValueError):
        MusicalPiece.model_validate({"title": "   "})


def test_pdf_url_validator():
    assert MusicalPiece.model_validate({"title": "With PDF", "pdf_url": None})
    with pytest.raises(ValueError):
        MusicalPiece.model_validate({"title": "With PDF", "pdf_url": "   "})
