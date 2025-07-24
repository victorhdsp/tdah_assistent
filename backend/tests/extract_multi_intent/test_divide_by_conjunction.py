# tests/test_extract_intent.py

import pytest
from src.domain.extract_intent.main import ExtractMultiIntentUseCase
from src.domain.extract_intent.dependences import nlu_service

@pytest.fixture
def use_case():
    return ExtractMultiIntentUseCase(nlu_service=nlu_service)

def test_divide_by_conjunction_basic(use_case):
    input_text = "Saquei, é ai vai precisar adicionar no domínio mesmo, os DNS no geral estão lá, são esses que estão verde, o que indica o prefixo \"comercial\" é o primeiro que falta validação e o ultimo deu erro tem que ver o motivo (apesar dele ser opcional então, de boa) mas vou montar um orçamento para adicionar esse CNAME do comercial, aproveito para ajustar esse que ta com erro. Te aguardo então. tem problema se enviar amanha de manha o orçamento? Posso enviar mais tarde quando chegar, mas agora não consigo não."
    result = use_case.divide_by_conjunction(input_text)
    expected = ["Saquei", "é ai vai precisar adicionar no domínio mesmo", "os DNS no geral estão lá",  "são esses que estão verde", "o que indica o prefixo \" comercial \" é o primeiro que falta validação", "o ultimo deu erro tem que ver o motivo", "apesar dele ser opcional então", "de boa", "vou montar um orçamento para adicionar esse CNAME do comercial", "aproveito para ajustar esse que ta com erro", "Te aguardo então", "tem problema se enviar amanha de manha o orçamento", "Posso enviar mais tarde quando chegar", "agora não consigo não"]
    
    assert result == expected
