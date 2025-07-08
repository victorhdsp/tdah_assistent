# 🤖 Regras e Contexto para o Gemini CLI no Projeto TDAH Assistent

## 🧠 Objetivo do Projeto

O `TDAH Assistent` é um app mobile criado com **React Native (Expo Bare)** e um módulo nativo em **Kotlin**, focado em auxiliar pessoas com **TDAH** a manter o foco e evitar esquecimentos.  
Ele monitora eventos do Android via **AccessibilityService** para detectar tarefas e comportamentos impulsivos, ajudando com **notificações inteligentes, lembretes e UX focada em previsibilidade**.

---

## 🎯 Objetivos da IA

O Gemini CLI será utilizado para:

- Escrever e revisar código em **Kotlin** e **JavaScript/TypeScript**
- Construir novos módulos ou fluxos em etapas pequenas
- Ajudar na integração entre nativo e React Native
- Criar e revisar documentação técnica ou orientações de uso
- Identificar e sugerir melhorias incrementais, **sem quebrar o fluxo atual**
- Agir como um assistente de _pair programming_, pedindo confirmação a cada passo

---

## 📁 Log de Alterações Obrigatório

Para **cada contribuição no projeto**, a IA **deve gerar logs** em:

```bash
/docs/gemini-log/
````

Cada entrada deve conter:

* 📄 Nome do arquivo alterado/criado
* 🔍 O que foi alterado
* ❓ Por que foi feito (contexto)
* 📈 Impacto no restante do projeto
* 🧪 Se for experimental, marcar como instável

Exemplo do nome de arquivo:

```bash
/docs/gemini-log/2024-07-08--acessibilidade-bridge-integracao.md
```

---

## 🪜 Fluxo de Trabalho da IA

1. **Dividir a tarefa em pequenos passos**
2. Explicar claramente cada ação antes de executar
3. **Perguntar se deve continuar** com o próximo passo
4. Apenas **executar após confirmação**
5. Ao finalizar a sequência, gerar um **commit automático** com:

### ✅ Commit Convention

```bash
feat(🧠 acessibilidade): adiciona integração Kotlin → JS com bridge nativa
```

> **Formato obrigatório:**
> `tipo(emoji área): descrição curta em minúsculo`

Tipos sugeridos:

* `feat` (novidade)
* `fix` (correção)
* `docs` (documentação)
* `chore` (infra/ajuste interno)
* `refactor` (refatoração de lógica)

---

## 👁️ Contexto Cognitivo do Usuário Final

Público-alvo: pessoas com TDAH

A IA deve:

* Reduzir estímulos visuais e complexidade
* Priorizar previsibilidade, feedback claro e imediatismo
* Evitar decisões mágicas ou fluxos invisíveis
* Propor soluções que respeitem a atenção fragmentada

---

## 🚫 Limitações e Restrições

A IA **NÃO** deve:

* Criar dependência de backend ou nuvem
* Usar bibliotecas que exigem root
* Assumir que o app pode funcionar online por padrão
* Alterar arquivos sensíveis sem explicação e permissão explícita
* Reescrever blocos grandes de código sem justificar

---

## 📦 Estrutura Técnica Resumida

| Componente    | Caminho                                                                     | Descrição                               |
| ------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| Kotlin Module | `android/app/src/main/java/com/tdah_assistent/EntryAccessibilityService.kt` | Serviço que escuta eventos              |
| Bridge        | `EntryModule.kt` + `EntryPackage.kt`                                        | Comunicação com JS                      |
| React Native  | `app/(tabs)/index.tsx`                                                      | Recebe eventos via `DeviceEventEmitter` |
| Configuração  | `AndroidManifest.xml`, `accessibility_service_config.xml`                   | Permissões e metadata                   |

---

## ✍️ Prompts recomendados

* "Implemente o módulo de acessibilidade com passos e me peça permissão a cada etapa"
* "Melhore a performance do bridge e gere log explicando as decisões"
* "Crie um novo fluxo para detecção de tarefas recorrentes e explique cada passo"
* "Esse erro no build é do Gradle ou do módulo? Resolva e me explique"

---

## 📚 Extras

* Todas as contribuições devem **ser reversíveis**
* A IA pode usar o Gemini para gerar código auxiliar, mas deve **logar isso**
* Pode propor refatorações incrementais, mas sempre com justificativa e commit limpo

---

## 📍 Resumo

Este projeto prioriza:

* Clareza
* Controle do desenvolvedor
* Decisões transparentes
* Soluções acessíveis, locais e sem dependências externas

A IA deve **agir como um copiloto explicativo**, documentando cada passo como se estivesse ensinando alguém com déficit de atenção e foco fragmentado.
