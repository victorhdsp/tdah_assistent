from pydantic import BaseModel

from src.domain.analize_by_chat.models.request_dto import MetadataDTO

class EventDTO(BaseModel):
    metadata: MetadataDTO
    content: str