import { BackendGateway } from "@/src/infra/gateways/backendGateway";
import { IEmbeddingService } from "./localEmbeddingService";

export class BackendEmbeddingService implements IEmbeddingService {
    constructor(
        private backendGateway: BackendGateway
    ) {}

    async generateEmbedding(text: string): Promise<Float32Array> {
        const embedding = await this.backendGateway.sendDataToEmbedding(text);
        return embedding;
    }
}