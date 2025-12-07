# Music Sheets API
FastAPI service backed by MongoDB that scrapes music sheets (Mutopia) and serves metadata over HTTP.

## Prerequisites
- Python 3.11+
- Docker & docker-compose (for containerized runs)
- MongoDB 7+ (local or Atlas connection string)

### Required environment
Set at least:
```
MONGO_URI="mongodb://localhost:27017"   # or mongodb://mongo:27017 inside docker-compose
MONGO_CURRENT_DB="music_sheets_db"
```

## Running with Docker Compose
Launch Docker and run:

```bash
docker compose up --build
```
This starts MongoDB and the app. API: http://localhost:8000. MongoDB (from host): mongodb://localhost:27017. Inside the compose network use mongodb://mongo:27017.

## Running locally (app + Mongo in Docker)
1) Start MongoDB in Docker:
```bash
docker run -d --name mongo \
  -p 27017:27017 \
  mongo:7.0
```
2) Set env vars so the app talks to local Mongo:
```bash
export MONGO_URI="mongodb://localhost:27017"
export MONGO_CURRENT_DB="music_sheets_db"
```
3) (OPTIONAL) Create venv and install deps (for manual control):
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
4) Run the API:
If you skipped 3 (let uv manage dependencies at each run):
```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Else (after activating venv in step 3):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```


## Running everything locally (Mongo installed on host)
1) Install MongoDB:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```
2) Set env vars as above (`MONGO_URI`, `MONGO_CURRENT_DB`).
3) Create venv, install deps, run uvicorn as above.

## Triggering scraping
Call once Mongo is up:
```
GET http://localhost:8000/start-scrapping        # uses MAX_PIECES default
GET http://localhost:8000/start-scrapping?max_pieces=10
```
By default only 20 pieces are scraped (see `config.MAX_PIECES`).


## Key Endpoints
- `GET /health` – app and DB status
- `GET /pieces/styles/{style}` – list pieces by style
- `GET /pieces/title/{title}` – list pieces matching title substring
- `GET /start-scrapping` – start scraping Mutopia metadata (optional `max_pieces` query)


## Additional Information
- **Architecture**: Designed to scale with new formats (MIDI, XML, etc.) by adding a `SpecificFormatDAO -> CorrespondingRepository -> CorrespondingDbTable -> GeneralDatabase` chain. Repositories/tables are created automatically when introducing a new format class.
- **DI & Lifespan**: Shared resources are managed via a manual DI container and FastAPI lifespan to avoid recreating expensive objects.
- **Deployment options**:
  - Docker Compose: runs app + Mongo together.
  - Local run: start `mongodb-community` locally or use Atlas; configure `MONGO_URI`/`MONGO_CURRENT_DB` (or Atlas URI).
  - Hosted (e.g., Render): supply a Mongo service/Atlas connection string (include credentials).
- **Mongo URIs**: inside docker-compose use `mongodb://mongo:27017`; from host use `mongodb://localhost:27017`.
- **Scraping**: Trigger `GET /start-scrapping` (optionally `?max_pieces=`). Defaults to 20 pieces (`config.MAX_PIECES`) so you can test quickly.