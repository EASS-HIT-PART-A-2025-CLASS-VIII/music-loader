from pydantic import BaseModel, Field, field_validator


class ComposerPieceInfo(BaseModel):
    info: str = Field(
        ...,
        description="Information about the composer/piece.",
    )
    image_url: str = Field(
        ...,
        description="URL of an image related to the composer/piece.",
    )

    @field_validator("info", "image_url")
    @classmethod
    def validate_non_empty(cls, value):
        if not value or not isinstance(value, str):
            raise ValueError("must be a non-empty string")
        return value
