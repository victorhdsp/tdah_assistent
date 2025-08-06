import { Config } from "../config";

export class BackendGateway {
    private BASE_URL: string;

    constructor() {
        if (!Config.BACKEND_URL) throw new Error("BACKEND_URL is not set in Config");
        this.BASE_URL = Config.BACKEND_URL;
    }

    async sendDataToNLU(content: string) {
        fetch(`${this.BASE_URL}/api/v2/train-nlu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        return true;
    }

    async sendDataToEmbedding(content: string): Promise<Float32Array> {
        const response = await fetch(`${this.BASE_URL}/api/v2/embedding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            throw new Error(`Failed to send data to embedding: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.embedding || !Array.isArray(data.embedding)) {
            throw new Error('Invalid response from embedding service');
        }
        return new Float32Array(data.embedding);
    }
}