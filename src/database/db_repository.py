import re
from typing import Optional, Type

from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel, ValidationError
from pymongo.collection import Collection

from src.utils.util import fix_mojibake


class Repository:
    """
    Generic repository using a Pydantic model to validate/serialize Mongo documents.
    """

    def __init__(self, collection: Collection, model_cls: Type[BaseModel]) -> None:
        self.collection = collection
        self.model_cls = model_cls

    def _serialize(self, doc: dict) -> Optional[dict]:
        payload = dict(doc)
        if "_id" in payload:
            payload["_id"] = str(payload["_id"])
        for key, value in payload.items():
            if isinstance(value, str):
                payload[key] = fix_mojibake(value)
        try:
            # Use aliases so Mongo _id remains present for callers; add a small safety
            # net to reattach _id if the alias is ever omitted.
            piece = self.model_cls.model_validate(payload)
            data = piece.model_dump(by_alias=True)
            if "_id" not in data and "db_id" in data:
                data["_id"] = data["db_id"]
            return data
        except ValidationError:
            return None

    def insert_object_to_db(self, obj: BaseModel):
        # Avoid inserting a null _id; let Mongo assign one.
        payload = obj.model_dump(by_alias=True, exclude_none=True)
        if payload.get("_id") is None:
            payload.pop("_id", None)
        self.collection.insert_one(payload)

    def get_object_by_field(self, field: str, value: str) -> dict | None:
        doc = self.collection.find_one({field: value})
        if doc is None:
            return None
        return self._serialize(doc)

    def delete_all_objects_from_db(self):
        self.collection.delete_many({})

    def get_object_by_title(self, title: str) -> list[dict]:
        pattern = re.escape(title)
        cursor = self.collection.find({"title": {"$regex": pattern, "$options": "i"}})
        return [piece for doc in cursor if (piece := self._serialize(doc))]

    def get_object_by_style(self, style: str) -> list[dict]:
        variants = [style.lower(), style.capitalize(), style.upper()]
        cursor = self.collection.find({"style": {"$in": variants}})
        objects: list[dict] = []
        for doc in cursor:
            if piece := self._serialize(doc):
                objects.append(piece)
        return objects

    def get_object_by_instrument(self, instrument: str) -> list[dict]:
        variants = [instrument.lower(), instrument.capitalize(), instrument.upper()]
        cursor = self.collection.find({"instruments": {"$in": variants}})
        objects: list[dict] = []
        for doc in cursor:
            if piece := self._serialize(doc):
                objects.append(piece)
        return objects

    def get_all_styles(self) -> list[str]:
        """
        Return the distinct set of style values stored in the collection.
        """
        raw_styles = self.collection.distinct("style")
        styles: list[str] = []
        for style in raw_styles:
            if not style:
                continue
            if isinstance(style, str):
                styles.append(fix_mojibake(style))
        return styles

    def get_all_instruments(self) -> list[str]:
        """
        Return the distinct set of instruments stored in the collection.
        """
        raw_instruments = self.collection.distinct("instruments")
        instruments: list[str] = []
        for instrument in raw_instruments:
            if not instrument:
                continue
            if isinstance(instrument, str):
                instruments.append(fix_mojibake(instrument))
        return instruments

    def get_object_by_id(self, piece_id: str) -> dict | None:
        doc = None
        try:
            doc = self.collection.find_one({"_id": ObjectId(piece_id)})
        except (InvalidId, TypeError):
            doc = self.collection.find_one({"_id": piece_id})
        if doc is None:
            return None
        return self._serialize(doc)

    def get_all_objects(self) -> list[dict]:
        cursor = self.collection.find({})
        return [piece for doc in cursor if (piece := self._serialize(doc))]

    def update_notes(self, piece_id: str, notes: list[dict]) -> None:
        try:
            print("Updating notes for piece objectid:", piece_id)
            self.collection.update_one(
                {"_id": ObjectId(piece_id)},
                {"$set": {"notes": notes}},
            )
        except (InvalidId, TypeError):
            print("Updating notes for piece id:", piece_id)
            self.collection.update_one(
                {"_id": piece_id},
                {"$set": {"notes": notes}},
            )
