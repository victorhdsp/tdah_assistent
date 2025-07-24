from pydantic import BaseModel
from typing import List, Literal,TypeAlias

DataRole: TypeAlias = Literal['user', 'contact']

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

class RequestBodyExtractIntentDTO(BaseModel):
    chat_data: ChatDataDTO

