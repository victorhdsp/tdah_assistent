from src.domain.extract_intent.models.nlu_dto import NLUIntentDTO

class NLUServiceMock:
    def execute(self, text: str) -> NLUIntentDTO:
        """ Executes the NLU service to extract intents from the provided text.
        
        Args:
            text (str): The input text to be processed.
        
        Returns:
            NLUIntentDTO: The extracted intents and entities from the text.
        """
        
        return NLUIntentDTO(
            text="extracted text",
            name="extracted_intent",
            entities=[],
            confidence=0.95,
        )