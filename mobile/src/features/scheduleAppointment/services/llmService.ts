import { Config } from "@/src/infra/config";
import { GoogleGenAI } from "@google/genai";

export class LLMService {
    private llm: GoogleGenAI;
    private model: string;

    constructor() {
        if (!Config.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set in the configuration.");
        this.llm = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY });
        this.model = "gemini-2.5-flash";
    }

    async process(input: string): Promise<string | null> {
        const response = await this.llm.models.generateContent({
            model: this.model,
            contents: input,
        });
        return response.text || null;
    }
}