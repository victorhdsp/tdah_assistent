from fastapi import APIRouter
from src.domain.analize_by_chat.models.request_dto import RequestBodyExtractIntentDTO
from src.lifespan import app_dependencies

route = APIRouter()

@route.get("/health")
def health_check():
    return {"status": "ok"}

@route.post("/analise-by-chat")
async def extract_intent(body: RequestBodyExtractIntentDTO):
    await app_dependencies.chat_analysis_queue.producer(chat_data=body.chat_data)
    return {"status": "ok"}