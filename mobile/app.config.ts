import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }) => ({
    ...config,
    name: "tdah_assistent",
    slug: "tdah_assistent",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tdahassistent",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.anonymous.tdah-assistent"
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: "com.anonymous.tdah_assistent"
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
    },
    plugins: [
        "expo-router",
        [
            "expo-splash-screen",
            {
                image: "./assets/images/splash-icon.png",
                imageWidth: 200,
                resizeMode: "contain",
                backgroundColor: "#ffffff"
            }
        ]
    ],
    experiments: {
        typedRoutes: true
    },
    extra: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || null,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || null,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || null,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || null,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || null,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || null,
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || null,
    },
});
