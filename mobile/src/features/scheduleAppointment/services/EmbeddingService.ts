import { NativeModules } from 'react-native';
import { BackendGateway } from '@/src/infra/gateways/backendGateway';

const { EntryModule } = NativeModules;

export interface IEmbeddingService {
    generateEmbedding(text: string): Promise<Float32Array | null>;
}

export class BackendEmbeddingService implements IEmbeddingService {
    constructor(
        private backendGateway: BackendGateway
    ) {}

    async generateEmbedding(text: string): Promise<Float32Array | null> {
        const embedding = await this.backendGateway.sendDataToEmbedding(text);
        return embedding;
    }
}

export class LocalEmbeddingService implements IEmbeddingService {
    async generateEmbedding(content: string): Promise<Float32Array|null> {
        try {
            const result = await EntryModule.LocalEmbedding(
                content
            );

            if (!result) throw new Error("No embedding returned");
            return new Float32Array(result);

        } catch (error) {
            console.error("Error sending data to embedding service:", error);
            return null;
        }
    }
}