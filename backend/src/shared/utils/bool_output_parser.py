from langchain.output_parsers import BaseOutputParser

class BooleanOutputParser(BaseOutputParser[bool]):
    def parse(self, text: str) -> bool:
        t = text.strip().lower()
        if t in {"true", "verdadeiro", "sim", "yes"}:
            return True
        if t in {"false", "falso", "não", "nao", "no"}:
            return False
        raise ValueError(f"Não consegui converter '{text}' em bool")

    @property
    def _type(self) -> str:
        return "boolean"
