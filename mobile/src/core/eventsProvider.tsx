import { useEffect, useState } from "react";

import { AppEventBus } from './events/appEventBus';
import { AppEventHandlers } from './appEventHandlers';

import { ChatMessagesRepository } from "../infra/repositories/chatMessagesRepository";

import { NativeEventBus } from "./native/events/nativeEventBus";
import { NativeAccessibilityService } from "./native/events/accessibility/acessibilityService";

import { BruteChatEventListener } from '../features/chat/bruteChatEventListener';
import { ParserChatEventService } from "../features/chat/services/parserChatEventService";
import { MergeChatEventService } from "../features/chat/services/mergeChatEventService";
import { NativeEventHandlers } from './native/events/nativeEventHandlers';
import { NativeModules } from "react-native";
import { IntentSelectorUseCase } from "../features/chat/intentSelectorUsecase";
import { NluService } from "../features/chat/services/nluService";
import { VectorService } from "../features/chat/services/vectorService";
import { BackendGateway } from "../infra/gateways/backendGateway";
import { CreateNewAppointmentUseCase } from "../features/scheduleAppointment/createNewAppointmentUsecase";
import { LLMService } from "../features/scheduleAppointment/services/llmService";
import { CalendarService } from "../features/scheduleAppointment/services/calendarService";
import { BackendEmbeddingService, LocalEmbeddingService } from '../features/scheduleAppointment/services/EmbeddingService';
import { ActionRepository } from "../infra/repositories/actionRepository";
import { BertTokenizer } from '../features/scheduleAppointment/services/bertTokenizer';
import { Config } from "../infra/config";
import { EventExecutionQueue } from './EventExecutionQueue';

export function EventsProvider() {
    const [isNativeReady, setNativeReady] = useState(false);

    useEffect(() => {
        let attempts = 0;

        const checkNative = setInterval(() => {
            if (NativeModules.EntryModule) {
                clearInterval(checkNative);
                setNativeReady(true);
            } else if (attempts++ > 10) {
                clearInterval(checkNative);
                console.warn("EntryModule não carregou a tempo");
            }
        }, 300);
    }, []);

    useEffect(() => {
        if (!isNativeReady) return;
        
        Config.init();

        const appEventBus = new AppEventBus();
        const nativeEventBus = new NativeEventBus();
        
        const backendGateway = new BackendGateway();
        const eventExecutionQueue = new EventExecutionQueue();

        const chatMessagesRepository = new ChatMessagesRepository();
        const actionRepository = new ActionRepository();

        const parserChatEventService = new ParserChatEventService();
        const mergeChatEventService = new MergeChatEventService();
        const nativeAccessibilityService = new NativeAccessibilityService();
        const nluService = new NluService();
        const bertTokenizer = new BertTokenizer();
        const localEmbeddingService = new LocalEmbeddingService();
        const backendEmbeddingService = new BackendEmbeddingService(backendGateway);
        const vectorService = new VectorService(localEmbeddingService, backendEmbeddingService);
        const llmService = new LLMService();
        const calendarService = new CalendarService();

        const bruteChatEventListener = new BruteChatEventListener(parserChatEventService, chatMessagesRepository, mergeChatEventService, vectorService, appEventBus);
        const intentSelectorUseCase = new IntentSelectorUseCase(appEventBus, nluService);
        const createNewAppointmentUseCase = new CreateNewAppointmentUseCase(llmService, chatMessagesRepository, vectorService, calendarService, actionRepository);

        const chatEventHandlers = new AppEventHandlers(appEventBus, bruteChatEventListener, intentSelectorUseCase, backendGateway, createNewAppointmentUseCase, eventExecutionQueue);
        const nativeEventHandlers = new NativeEventHandlers(nativeEventBus, nativeAccessibilityService, appEventBus);
        
        ((async () => {
            console.log("Initializing event handlers...");
            await nativeEventHandlers.register()
            console.log("Native event handlers registered.");
            await nluService.init();
            console.log("NLU service initialized.");
            await bertTokenizer.init();
            console.log("Bert tokenizer initialized.");
            await calendarService.init();
            console.log("Local embedding service initialized.");
            await chatEventHandlers.register();
            console.log("App event handlers registered.");
        }))()
    }, [isNativeReady])

    return null;
}