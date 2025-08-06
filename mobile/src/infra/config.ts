import Constants from "expo-constants"

export class Config {
    static BACKEND_URL: string | null = null;
    static GEMINI_API_KEY: string | null = null;
    
    static init() {
        const env = Constants.expoConfig?.extra;

        if (!env) {
            console.warn("Config.init: No environment variables found");
            return;
        }

        this.BACKEND_URL = env.BACKEND_URL || null;
        this.GEMINI_API_KEY = env.GEMINI_API_KEY || null;
    }
}