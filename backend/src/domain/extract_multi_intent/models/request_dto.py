from enum import Enum
from pydantic import BaseModel
from typing import List, Literal, Optional

class DataRole(Enum):
    USER = 'user'
    CONTACT = 'contact'

class TextRowDataDTO(BaseModel):
    id: str
    role: DataRole
    text: str

class MetadataDTO(BaseModel):
    chat_id: str
    contact_name: str
    package_name: str

class ChatDataDTO(BaseModel):
    metadata: MetadataDTO
    content: List[TextRowDataDTO]

class RequestBodyExtractMultiIntentDTO(BaseModel):
    chat_data: ChatDataDTO

