import { NativeModules } from "react-native";

const { EntryModule } = NativeModules; 

export class NativeAccessibilityService {
    public isServiceEnabled: boolean = false;

    openSettings(): void {
        EntryModule.openAccessibilitySettings();
    }

    async checkServiceStatus(currentTry: number = 1): Promise<boolean> {
        try {
            const enabled = await EntryModule.isAccessibilityServiceEnabled();
            this.isServiceEnabled = enabled;
            if (!enabled) throw new Error("Serviço de acessibilidade não está habilitado.");
            return enabled;
        } catch (error) {
            if (currentTry <= 3) {
                console.warn(`Accessibility Service: Tentativa ${currentTry} falhou. Retentando...`);
                await new Promise(resolve => setTimeout(resolve, 300 * currentTry)); // Aguardar 300ms, 600ms, 900ms...
                return this.checkServiceStatus(currentTry + 1);
            }
            console.error("Erro ao verificar status do serviço de acessibilidade:", error);
            return false;
        }
    }
}
