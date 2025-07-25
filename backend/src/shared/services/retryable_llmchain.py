from langchain.chains import LLMChain
from langchain.schema import LLMResult
from typing import Any

class RetryableLLMChain(LLMChain):
    def __init__(self, *args, max_retries: int = 3, **kwargs):
        super().__init__(*args, **kwargs)
        self.max_retries = max_retries

    def run(self, *args: Any, **kwargs: Any) -> LLMResult:
        last_err = None
        for _ in range(self.max_retries):
            try:
                return super().run(*args, **kwargs)
            except ValueError as e:
                last_err = e
                continue
        if last_err:
            raise ValueError(f"Failed after {self.max_retries} retries: {last_err}")
        else:
            raise RuntimeError("Unknown error occurred, no retries were attempted.")
