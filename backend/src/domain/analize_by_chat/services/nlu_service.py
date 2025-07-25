from fastapi import HTTPException
from src.domain.analize_by_chat.extract_intent.models.nlu_dto import NLUResponseDTO
import requests

class NLUService:
    def execute(self, text: str) -> NLUResponseDTO:
        """ Executes the NLU service to extract intents from the provided text.
        
        Args:
            text (str): The input text to be processed.
        
        Returns:
            NLUIntentDTO: The extracted intents and entities from the text.
        """
        result = requests.post(f"http://0.0.0.0:5005/model/parse", json={"text": text})
        if result.status_code != 200:
            raise HTTPException(status_code=result.status_code, detail=result.text)
        
        data = result.json()
        if not data:
            raise HTTPException(status_code=400, detail="No intent found in the response.")

        nlu_response = NLUResponseDTO(**data)
        
        return nlu_response