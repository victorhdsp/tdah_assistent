from typing import Optional
from pydantic import BaseModel

from src.domain.analize_by_chat.models.request_dto import MetadataDTO

class EventEntity():
    metadata: MetadataDTO
    content: str
    event_id: str

    def __init__(self, metadata: MetadataDTO, content: str):
        self.event_id = hash((metadata.__str__(), content.__str__())).__str__()
        self.metadata = metadata
        self.content = content

    def __eq__(self, other):
        if not isinstance(other, EventEntity):
            return NotImplemented
        return (self.event_id, self.metadata, self.content) == (other.event_id, other.metadata, other.content)