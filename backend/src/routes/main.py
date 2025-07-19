from fastapi import APIRouter
from rich import print_json
from src.domain.extract_multi_intent.models.request_dto import RequestBodyExtractMultiIntentDTO
from src.domain.extract_multi_intent.dependences import extractMultiIntentUseCase
import requests


route = APIRouter()

@route.get("/health")
def health_check():
    return {"status": "ok"}

@route.post("/extract-multi-intent")
def extract_multi_intent(body: RequestBodyExtractMultiIntentDTO):
    result = extractMultiIntentUseCase.execute(chat_data=body.chat_data)
    
    requests.post(
        f"http://192.168.1.160:1234/after-extract'",
        json=result.json()
    )
    return result