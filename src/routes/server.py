
import asyncio

from fastapi import HTTPException
from fastapi.responses import FileResponse
from pymongo.errors import PyMongoError

from main import app
from src.DI.container import get_db

@app.get("/")
async def read_root() -> dict[str, str]:
    return {"status": "ok"}


@app.head("/", include_in_schema=False)
async def read_root_head():
    return {}


@app.get("/health")
async def health() -> dict[str, str]:
    # Return DB status along with app status for simple monitoring
    db = get_db()
    if db is None:
        return {"status": "ok", "db": "not_initialized"}
    try:
        await asyncio.to_thread(db.client.admin.command, "ping")
        db_status = "ok"
    except PyMongoError:
        db_status = "unhealthy"
    return {"status": "ok", "db": db_status}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("favicon.ico")
