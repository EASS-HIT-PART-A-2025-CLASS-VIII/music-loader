#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.dock"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "please create a $ENV_FILE file and write all needed secret variables inside (see ${ENV_FILE}.example)"
  exit 1
fi

echo "starting Docker Compose (App + Mongo-db Community) with environment ${ENV_FILE}"
docker compose --env-file "$ENV_FILE" up --build

