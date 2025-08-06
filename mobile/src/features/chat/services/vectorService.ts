import { ChatEventDTO, ChatEventDTOInSimilarity } from "../models/chatEventDTO";
import { LocalEmbeddingService } from "../../scheduleAppointment/services/localEmbeddingService";
import { BackendEmbeddingService } from '../../scheduleAppointment/services/backendEmbeddingService';

export class VectorService {
    constructor(
        private localEmbeddingService: LocalEmbeddingService,
        private backendEmbeddingService: BackendEmbeddingService,
    ) {}

    async generateEmbedding(text: string): Promise<Float32Array> {
        if (!text || text.trim() === "") {
            throw new Error("Text cannot be empty for embedding generation.");
        }
        if (text.split(" ").length <= 8) {
            console.warn("Text is too short for embedding generation, using local service.");
            return await this.localEmbeddingService.generateEmbedding(text);
        }

        console.log("Using backend service for embedding generation.", text);
        return new Float32Array(); //await this.backendEmbeddingService.generateEmbedding(text);
    }

    async findSimilarEmbeddings(
        embedding: Float32Array | undefined,
        dataset: ChatEventDTO[],
        topK: number = 5
    ): Promise<ChatEventDTOInSimilarity[]> {
        if (!embedding || embedding.length === 0) {
            console.warn("No embedding provided or embedding is empty.");
            return [];
        }

        function cosineSimilarity(a: Float32Array, b: Float32Array): number {
            let dot = 0, normA = 0, normB = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            return dot / (Math.sqrt(normA) * Math.sqrt(normB));
        }

        const similarities: ChatEventDTOInSimilarity[] = dataset.map(event => {
            const eventVector = event.vector || new Float32Array();
            return {
                ...event,
                similarityScore: cosineSimilarity(embedding, eventVector)
            };
        });

        similarities.sort((a, b) => b.similarityScore - a.similarityScore);

        return similarities.slice(0, topK);
    }
}