import os

import requests

GOOGLE_CUSTOM_SEARCH_URL = "https://www.googleapis.com/customsearch/v1"


def google_search_images(query: str) -> str:
    api_key = os.getenv("GOOGLE_IMAGE_API")
    if not api_key:
        raise ValueError("Missing GOOGLE_IMAGE_API")

    cse_id = os.getenv("GOOGLE_IMAGE_CX")
    if not cse_id:
        raise ValueError(
            "Missing Google Custom Search engine id (set GOOGLE_IMAGE_CX or GOOGLE_CSE_ID)."
        )

    resp = requests.get(
        GOOGLE_CUSTOM_SEARCH_URL,
        params={
            "key": api_key,
            "cx": cse_id,
            "q": query,
            "searchType": "image",
            "num": 1,
            "safe": "active",
            "imgType": "photo",
        },
        timeout=15,
    )

    print("Google Search Response:", resp.text)
    resp.raise_for_status()
    items = resp.json().get("items", [])
    if not items:
        raise ValueError("No image results returned for query")
    link = items[0].get("link")
    if not link:
        raise ValueError("Image result missing link")
    return link


__all__ = ["google_search_images"]
