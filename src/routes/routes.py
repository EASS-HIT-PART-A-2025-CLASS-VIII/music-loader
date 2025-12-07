from fastapi import APIRouter, BackgroundTasks, HTTPException
from pymongo.errors import PyMongoError

import src.config as config
from src.DI.container import get_piece_dao
from src.scrapping import mutopia


router = APIRouter()
piece_dao = get_piece_dao()


@router.get("/pieces/styles/{style}")
async def get_pieces_by_style(style: str) -> list[dict]:
    try:
        pieces = piece_dao.get_pieces_by_style(style)
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
