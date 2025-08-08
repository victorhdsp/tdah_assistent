import Constants from "expo-constants"

export class Config {
    static GEMINI_API_KEY: string | null = null;
    static FIREBASE_API_KEY: string | null = null;
    static FIREBASE_AUTH_DOMAIN: string | null = null;
    static FIREBASE_PROJECT_ID: string | null = null;
    static FIREBASE_STORAGE_BUCKET: string | null = null;
    static FIREBASE_MESSAGING_SENDER_ID: string | null = null;
    static FIREBASE_APP_ID: string | null = null;
    static FIREBASE_MEASUREMENT_ID: string | null = null;

    static init() {
        const env = Constants.expoConfig?.extra;

        if (!env) {
            console.warn("Config.init: No environment variables found");
            return;
        }

        this.GEMINI_API_KEY = env.GEMINI_API_KEY || null;
        this.FIREBASE_API_KEY = env.FIREBASE_API_KEY || null;
        this.FIREBASE_AUTH_DOMAIN = env.FIREBASE_AUTH_DOMAIN || null;
        this.FIREBASE_PROJECT_ID = env.FIREBASE_PROJECT_ID || null;
        this.FIREBASE_STORAGE_BUCKET = env.FIREBASE_STORAGE_BUCKET || null;
        this.FIREBASE_MESSAGING_SENDER_ID = env.FIREBASE_MESSAGING_SENDER_ID || null;
        this.FIREBASE_APP_ID = env.FIREBASE_APP_ID || null;
        this.FIREBASE_MEASUREMENT_ID = env.FIREBASE_MEASUREMENT_ID || null;
    }
}