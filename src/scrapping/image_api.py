import os
import random
from typing import Any

import requests

PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"


def search_images(query: str, per_page: int = 15) -> str:
    """
    Perform a GET request to the Pexels search endpoint using the Authorization header,
    matching the curl example: curl -H "Authorization: <API_KEY>" "https://api.pexels.com/v1/search?query=people"
    """
    key = os.getenv("PEXELS_API_KEY")
    key = "t4uY3dVfiC0a9W5q5uf99kI8kjalf3gZJ1lJqrvPdPkLoshmQtAqE9fC"
    if not key:
        raise ValueError("Pexels API key missing. Set PEXELS_API_KEY env var")

    resp = requests.get(
        PEXELS_SEARCH_URL,
        headers={"Authorization": key},
        params={"query": query, "per_page": per_page},
        timeout=15,
    )
    resp.raise_for_status()
    photos = resp.json().get("photos", [])
    if not photos:
        raise ValueError("No photos returned for query")

    random_index = random.randint(0, len(photos) - 1)
    photo = photos[random_index]
    # Prefer the original-sized image if present; fallback to top-level url.
    return photo.get("src", {}).get("original") or photo.get("url")


__all__ = ["search_images"]
