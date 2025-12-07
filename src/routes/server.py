
import asyncio
import os

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
    # Lightweight health for Render; DB ping only if explicitly enabled
    if os.getenv("HEALTHCHECK_DB", "false").lower() == "true":
        db = get_db()
        if db is None:
            return {"status": "ok", "db": "not_initialized"}
        try:
            await asyncio.to_thread(db.client.admin.command, "ping")
            db_status = "ok"
            pieces_info: dict[str, str | int] = {}
            try:
                count = await asyncio.to_thread(db.pieces_collection.count_documents, {})
                if count == 0:
                    pieces_info = {
                        "status": "empty",
                        "message": "No pieces found; run /start-scrapping first.",
                    }
                else:
                    pieces_info = {"status": "present", "count": count}
            except Exception:
                pieces_info = {"status": "unknown"}
        except PyMongoError:
            db_status = "unhealthy"
            pieces_info = {"status": "unknown"}
        return {"status": "ok", "db": db_status, "pieces": pieces_info}
    return {"status": "ok", "db": "skipped", "pieces": "skipped"}


@app.head("/health", include_in_schema=False)
async def health_head():
    return {}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("favicon.ico")
