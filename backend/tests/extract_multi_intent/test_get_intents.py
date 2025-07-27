# tests/test_extract_intent.py

import pytest
from src.domain.analize_by_chat.models.response_dto import N
from src.domain.analize_by_chat.usecases.extract_intent_usecase import ExtractMultiIntentUseCase
from src import nlu_service

@pytest.fixture
def use_case():
    return ExtractMultiIntentUseCase(nlu_service=nlu_service)

def test_get_intents_empty_text_data(use_case):
    text_data = []
    result = use_case.get_intents(text_data)
    assert result == []

def test_get_intents_find_not_conjunction(use_case):
    text_data = [
        "Reunião com o João dia 20 às 14h",
    ]
    
    result = use_case.get_intents(text_data)

    expected = [
        NLUGenericDTO(
            type='agendar_compromisso',
            action='reunião',
            object='joão',
            hour='14h',
            local=None,
            date='dia 20'
        )
    ]

    assert isinstance(result, list)
    assert len(result) == 1
    assert result == expected

def test_get_intents_find_with_conjunction(use_case):
    text_data = [
        "Marcar dentista dia 21 às 10h",
        "reunião com cliente às 15h",
    ]
    
    result = use_case.get_intents(text_data)
    expected = [
        NLUGenericDTO(
            type='agendar_compromisso',
            action='marcar dentista',
            object=None,
            hour='10h',
            local=None,
            date='dia 21'
        ),
        NLUGenericDTO(
            type='agendar_compromisso',
            action='reunião',
            object='cliente',
            hour='15h',
            local=None,
            date=None
        )
    ]
    
    assert isinstance(result, list)
    assert len(result) == 2
    assert result == expected


def test_get_intents_find_date_before_object(use_case):
    text_data = [
        "Dia 22 às 13h terapia",
    ]
    
    result = use_case.get_intents(text_data)
    expected = [
        NLUGenericDTO(
            type='agendar_compromisso',
            action='terapia',
            hour='13h',
            local=None,
            date='dia 22'
        )
    ]
    
    assert isinstance(result, list)
    assert len(result) == 1
    assert result == expected

def test_get_intents_find_not_date_not_hour(use_case):
    text_data = [
        "Falar com a terapeuta depois",
    ]
    
    result = use_case.get_intents(text_data)
    expected = [
        NLUGenericDTO(
            type='criar_tarefa_sem_data',
            action='falar',
            object='terapeuta',
            hour=None,
            local=None,
            date='depois'
        )
    ]
    
    assert isinstance(result, list)
    assert len(result) == 1
    assert result == expected

def test_get_intents_find_fragmentaded_message(use_case):
    text_data = [
        "dia 23 às 9h Fazer orçamento"
    ]
    
    result = use_case.get_intents(text_data)
    expected = [
        NLUGenericDTO(
            type='agendar_compromisso',
            action='fazer',
            object='orçamento',
            hour='9h',
            local=None,
            date='dia 23'
        )
    ]
    
    assert isinstance(result, list)
    assert len(result) == 1
    assert result == expected

def test_get_intents_find_informal_message(use_case):
    text_data = [
        "call c time dia 25 14h"
    ]
    
    result = use_case.get_intents(text_data)
    expected = [
        NLUGenericDTO(
            type='agendar_compromisso',
            action='call',
            object='time',
            hour='14h',
            local=None,
            date='dia 25'
        )
    ]
    
    assert isinstance(result, list)
    assert len(result) == 1
    assert result == expected
    

def test_get_intent_multiples_dates(use_case):
    text_data = [
        "Remarcar reunião para dia 24 ou 25 às 16h"
    ]
    
    result = use_case.get_intents(text_data)
    expected = [
        NLUGenericDTO(
            type='agendar_compromisso',
            action='remarcar',
            object='reunião',
            hour='16h',
            local=None,
            date='25'
        )
    ]
    
    assert isinstance(result, list)
    assert len(result) == 1
    assert result == expected
