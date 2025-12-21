from fastapi import APIRouter, BackgroundTasks, HTTPException
from pymongo.errors import PyMongoError

import src.config as config
from src.DI.container import get_piece_dao
from src.scrapping import mutopia
from src.ai_agent_real.ai_agent import ai_pdf_to_notes
from src.ai_agent_real.agent_instance import get_agent


router = APIRouter()
piece_dao = get_piece_dao()


@router.get("/pieces/styles/{style}")
async def get_pieces_by_style(style: str) -> list[dict]:
    try:
        pieces = piece_dao.get_pieces_by_style(style)
        return [piece for piece in pieces]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/styles")
async def get_all_styles() -> dict:
    """
    Return all distinct musical styles available in the collection.
    """
    try:
        styles = piece_dao.get_all_styles()
        return {"styles": styles}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/instruments")
async def get_all_instruments() -> dict:
    """
    Return all distinct instruments available in the collection.
    """
    try:
        instruments = piece_dao.get_all_instruments()
        return {"instruments": instruments}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pieces/instruments/{instrument}")
async def get_pieces_by_instrument(instrument: str) -> list[dict]:
    try:
        pieces = piece_dao.get_pieces_by_instrument(instrument)
        return [piece for piece in pieces]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    

@router.get("/start-scrapping")
async def start_scrapping_endpoint(
    background_tasks: BackgroundTasks, max_pieces: int | None = None
):
    print("Starting scrapping...")
    limit = max_pieces if max_pieces is not None else config.MAX_PIECES
    background_tasks.add_task(
        mutopia.start_scrapping, max_pieces=limit, delay=config.SCRAPPING_DELAY
    )
    return {"status": "started", "max_pieces": limit}


@router.get("/start-scrapping/{max_pieces}")
async def start_scrapping_endpoint_size_provided(
    background_tasks: BackgroundTasks, max_pieces: int
):
    print("Starting scrapping...")
    background_tasks.add_task(
        mutopia.start_scrapping, max_pieces=max_pieces, delay=config.SCRAPPING_DELAY
    )
    return {"status": "started"}


@router.get("/pieces")
async def get_all_pieces() -> list[dict]:
    try:
        pieces = piece_dao.get_all_pieces()
        return [piece for piece in pieces]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pieces/number")
async def get_pieces_number() -> list[dict]:
    try:
        pieces = len(piece_dao.get_all_pieces())
        return [{"number_of_pieces": pieces}]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pieces/title/{title}")
async def get_pieces_by_name(title: str) -> list[dict]:
    try:
        pieces = piece_dao.get_pieces_by_title(title)
        return [piece for piece in pieces]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pieces/get_notes_with_ai/{piece_id}")
async def get_notes_with_ai(piece_id: str) -> dict:
    try:
        piece = piece_dao.get_piece_by_id(piece_id)
        if piece is None:
            raise HTTPException(status_code=404, detail="Piece not found")
        pdf_notes = piece.get("notes")
        print(piece)
        print("Existing notes:", pdf_notes)
        
        if pdf_notes is not None:
            return {"notes": pdf_notes}
        
        pdf_url = piece.get("pdf_url")
        if pdf_url is None:
            raise HTTPException(status_code=404, detail="PDF URL not found for this piece")
    

        notes = await ai_pdf_to_notes(get_agent(), pdf_url)
        piece_dao.update_notes(piece_id, notes)
        
        return {"notes": notes}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))
