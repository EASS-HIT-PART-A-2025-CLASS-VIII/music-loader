# Project Notes & Architecture

- FastAPI service backed by MongoDB that scrapes music sheets (Mutopia) and serves them via HTTP.
- The code is structured to scale: new formats (MIDI, XML, etc.) can be added by creating a `SpecificFormatDAO -> CorrespondingRepository -> CorrespondingDbTable -> GeneralDatabase` chain. Repositories and tables are created automatically when introducing a new format class (type + table), making compatibility additions mostly automated.
- Singleton usage & FastAPI lifespan: shared objects are provided via a DI container and FastAPI lifespan to optimize resource creation.

# Deployment Options

1. Docker Compose: builds and runs both MongoDB and the app together.
2. Local run: start `mongodb-community` locally and provide `MONGO_URI`/`MONGO_CURRENT_DB` (or Atlas URI) in `.env`.
3. Hosted (e.g., Render): deploy the app; configure Mongo either via another service/container or Atlas (connection string must include credentials).

# Additional Notes

- FastAPI docs are available for all endpoints.
- When running in Docker Compose, use `mongodb://mongo:27017` inside the network; from host use `mongodb://localhost:27017`.
- For scraping, start `GET /start-scrapping` (optionally `?max_pieces=`) once Mongo is ready; defaults to 20 pieces for quick testing (`config.MAX_PIECES`).
