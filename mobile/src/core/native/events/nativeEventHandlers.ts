import { appEventName } from "../../appEventHandlers";
import { AppEventBus } from "../../events/appEventBus";
import { NativeAccessibilityService } from "./accessibility/acessibilityService";
import { AccessibilityEventData } from "./accessibility/models/AccessibilityEventData";
import { NativeEventBus } from "./nativeEventBus";

export const nativeEventName = {
    AccessibilityEvent: 'AccessibilityEvent',
}

export class NativeEventHandlers {
    constructor(
        private nativeEventBus: NativeEventBus,
        private nativeAccessibilityService: NativeAccessibilityService,
        private appEventBus: AppEventBus
    ) {}
    
    async register() {
        await this.handleAccessibilityEvent();
    }

    async handleAccessibilityEvent(): Promise<void> {
        console.log("Registrando listener de acessibilidade");
        const enable = await this.nativeAccessibilityService.checkServiceStatus();

        if (!enable) {
            console.warn("Serviço de acessibilidade não está habilitado.");
            this.nativeAccessibilityService.openSettings();
            return;
        }

        const callback = (event: AccessibilityEventData) => {
            this.appEventBus.emit(appEventName.NewBruteChatAccessibilityEvent, event);
        };

        this.nativeEventBus.on(nativeEventName.AccessibilityEvent, callback);
    }
}