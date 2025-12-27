# Music Sheets API
FastAPI service backed by MongoDB that scrapes music sheets (Mutopia) and serves metadata over HTTP.
IMPORTANT: This service is available at : https://music-loader.onrender.com/ (base URL)

## Prerequisites
- Python 3.11+
- Docker & docker-compose (for containerized runs)
- MongoDB 7+ (local or Atlas connection string)

### Required environment
Create one of the env files:
- `.env.docker` for Docker Compose (copy from `.env.docker.example`)
- `.env.local` for host runs (copy from `.env.local.example`)

Minimum variables:
```
MONGO_URI="mongodb://localhost:27017"   # use mongodb://mongo:27017 in .env.docker
MONGO_CURRENT_DB="music_sheets_db"
```

## Running with Docker Compose
Launch Docker and run:

```bash
cp .env.docker.example .env.docker
./start-docker.sh
```
This starts MongoDB and the app. API: http://localhost:8000. 
MongoDB (from host): mongodb://localhost:27017. 
Inside the compose network use mongodb://mongo:27017.

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
Or load them from `.env.local`:
```bash
cp .env.local.example .env.local
set -a; source .env.local; set +a
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
4) python3 main.py

## Triggering scraping
Call once Mongo is up:
```
GET http://localhost:8000/start-scrapping        # uses MAX_PIECES default
GET http://localhost:8000/start-scrapping?max_pieces=<number of musical pieces wanted>
GET http://localhost:8000/{max_pieces}  #write you own number of pieces in the request
```
By default only 20 pieces are scraped (see `config.MAX_PIECES`).


## Key Endpoints
- `GET /health` – app and DB status
- `GET /start-scrapping` – start scraping Mutopia metadata (optional `max_pieces` query)
- `GET /pieces/` – list all pieces
- `GET /pieces/number ` - get the number of pieces in the database
- `GET /pieces/styles/{style}` – list pieces by style that match the "style" key
- `GET /pieces/title/{title}` – list pieces matching title substring

- 

  Many others endpoints will be created very soon

More informations about the Endpoints:
BaseUrl/docs

## Additional Information

- **Architecture**: Designed to allow scaling with new formats (MIDI, XML, etc.) by adding:  
`SpecificFormatDAO -> CorrespondingRepository -> CorrespondingDbTable -> GeneralDatabase` chain. 
Repositories/tables are created automatically when introducing a new format class.

- **DI & Lifespan**: Shared resources are managed via a manual DI container and FastAPI lifespan to avoid recreating expensive objects.
