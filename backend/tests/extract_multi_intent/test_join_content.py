# tests/test_extract_intent.py

import pytest
from fastapi import HTTPException
from src.domain.extract_intent.models.request_dto import ChatDataDTO, DataRole, MetadataDTO, TextRowDataDTO
from src.domain.extract_intent.main import ExtractMultiIntentUseCase
from src.domain.extract_intent.dependences import nlu_service

@pytest.fixture
def use_case():
    return ExtractMultiIntentUseCase(nlu_service=nlu_service)

def test_join_valid_content(use_case):
    chat_data = ChatDataDTO(
        metadata=MetadataDTO(
            chat_id="12345",
            contact_name="Test User",
            package_name="Test Package",
        ),
        content=[
            TextRowDataDTO(text="Olá", id="1", role=DataRole.USER),
            TextRowDataDTO(text="tudo bem?", id="2", role=DataRole.USER),
        ])
    result = use_case.join(chat_data)
    assert result == "Olátudo bem?"

def test_join_empty_content_raises(use_case):
    chat_data = ChatDataDTO(
        metadata=MetadataDTO(
            chat_id="12345",
            contact_name="Test User",
            package_name="Test Package",
        ),
        content=[]
    )
    with pytest.raises(HTTPException) as e:
        use_case.join(chat_data)
    assert e.value.status_code == 400
