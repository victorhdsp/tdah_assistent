from typing import List, Literal
from pydantic import BaseModel

class NLUEntityDTO(BaseModel):
    entity: str
    start: int
    end: int
    confidence_entity: float
    value: str
    extractor: Literal['DIETClassifier', 'CRFEntityExtractor']

class NLUIntentDTO(BaseModel):
    name: str
    confidence: float

class NLUResponseDTO(BaseModel):
    text: str
    intent: NLUIntentDTO
    entities: List[NLUEntityDTO]
    