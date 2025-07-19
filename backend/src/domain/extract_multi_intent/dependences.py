from src.domain.extract_multi_intent.services.nlu_service import NLUService
from src.domain.extract_multi_intent.main import ExtractMultiIntentUseCase

nlu_service = NLUService()
extractMultiIntentUseCase = ExtractMultiIntentUseCase(nlu_service)