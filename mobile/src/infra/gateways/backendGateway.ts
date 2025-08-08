import { NativeModules } from "react-native";
import { Config } from "../config";

const { EntryModule } = NativeModules;

export class BackendGateway {
    private firebaseProjectId: string;
    private firebaseApiKey: string;
    private apiKey: string;

    constructor() {
        this.firebaseProjectId = Config.FIREBASE_PROJECT_ID || "";
        this.firebaseApiKey = Config.FIREBASE_API_KEY || ""; 
        this.apiKey = Config.GEMINI_API_KEY || "";

        if (!this.firebaseProjectId || !this.firebaseApiKey || !this.apiKey) {
            throw new Error("Environment variables for Firebase or Gemini API are not set");
        }
    }

    async sendDataToNLUTrain(content: string) {
        try {
            const result = await EntryModule.SendDataToNLUTrain(
                this.firebaseProjectId,
                this.firebaseApiKey,
                content
            );

            if (result) {
                console.log("Data sent to NLU train successfully");
                return true;
            }

        } catch (error) {
            console.error("Error sending data to NLU train:", error);
            return false;
        }
    }

    async sendDataToEmbedding(content: string): Promise<Float32Array | null> {
        try {
            const result = await EntryModule.GeminiEmbedding(
                this.apiKey,
                content
            );

            if (!result) throw new Error("No embedding returned");
            return new Float32Array(result);

        } catch (error) {
            console.error("Error sending data to embedding service:", error);
            return null;
        }
    }

    async sendInputToLLM(input: string): Promise<string | null> {
        try {
            const result = await EntryModule.GeminiLLM(
                this.apiKey,
                input
            );

            if (!result) throw new Error("No response from LLM");
            console.log("LLM response:", result);
            return result;

        } catch (error) {
            console.error("Error sending input to LLM:", error);
            return null;
        }
    }
}