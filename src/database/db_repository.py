import re
from typing import Optional, Type

from pydantic import BaseModel, ValidationError
from pymongo.collection import Collection


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
        self.collection.insert_one(obj.model_dump(by_alias=True))

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

    def get_all_objects(self) -> list[dict]:
        cursor = self.collection.find({})
        return [piece for doc in cursor if (piece := self._serialize(doc))]
