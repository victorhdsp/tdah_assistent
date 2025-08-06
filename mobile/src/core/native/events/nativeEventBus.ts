import { NativeEventEmitter } from "react-native";

export class NativeEventBus {
    private EntryEventEmitter = new NativeEventEmitter();

    on(eventType: string, callback: (event: any) => void): void {
        this.EntryEventEmitter.addListener(eventType, callback);
    }
    
    emit(eventType: string, event: any): void {
        this.EntryEventEmitter.emit(eventType, event);
    }
}
