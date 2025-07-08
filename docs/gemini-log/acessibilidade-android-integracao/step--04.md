# Etapa 4: Criação do Hook React Native (useAccessibilityEvents.ts)

*   **Arquivos afetados:**
    *   `native/useAccessibilityEvents.ts` (criado)
*   **O que foi alterado:** Um novo hook React Native, `useAccessibilityEvents`, foi criado. Este hook utiliza `NativeEventEmitter` para escutar os eventos de acessibilidade emitidos pelo módulo nativo (`EntryModule`). Ele também expõe funções para verificar o status do serviço de acessibilidade (`isAccessibilityServiceEnabled`) e para abrir as configurações de acessibilidade do Android (`openAccessibilitySettings`).
*   **Motivo/contexto da alteração:** Fornecer uma interface React amigável para consumir os eventos de acessibilidade do Android e interagir com o serviço de acessibilidade, encapsulando a lógica de comunicação nativa.
*   **Impacto esperado no projeto:** O frontend agora pode facilmente se inscrever em eventos de acessibilidade e gerenciar o estado do serviço de acessibilidade, permitindo a construção de funcionalidades baseadas em acessibilidade de forma reativa e declarativa.
