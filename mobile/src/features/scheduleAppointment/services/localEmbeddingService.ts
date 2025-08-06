import RNFS from 'react-native-fs';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { BertTokenizer } from './bertTokenizer';
import { Platform } from 'react-native';

export interface IEmbeddingService {
    generateEmbedding(text: string): Promise<Float32Array>;
}

export class LocalEmbeddingService implements IEmbeddingService {
    private session: InferenceSession | null = null;

    constructor(
        private bertTokenizer: BertTokenizer
    ) { }

    async init() {
        const modelDirUri = 'models';
        const fileName = 'tinybert-optimized.onnx';
        const targetPathDir = `${RNFS.DocumentDirectoryPath}/${modelDirUri}`;

        try {
            if (Platform.OS === 'android') {
                const sourceFileExist = await RNFS.existsAssets(`${modelDirUri}/${fileName}`);
                if (!sourceFileExist) throw new Error('Model file does not exist in assets');
                const targetDirExist = await RNFS.exists(targetPathDir);
                if (!targetDirExist) await RNFS.mkdir(targetPathDir);
                await RNFS.copyFileAssets(`${modelDirUri}/${fileName}`, `${targetPathDir}/${fileName}`);
            }

            const fileInfo = await RNFS.stat(`${targetPathDir}/${fileName}`);
            if (!fileInfo.isFile()) throw new Error('Model file does not exist at the specified path');

            this.session = await InferenceSession.create(`${targetPathDir}/${fileName}`);

        } catch (error) {
            console.error('Error initializing BertTokenizer:', error);
            return;
        }
    }

    async generateEmbedding(text: string): Promise<Float32Array> {
        if (!this.session) {
            throw new Error("Model not initialized");
        }

        const tokens = this.bertTokenizer.tokenize(text); // array<number>

        const inputIds = BigInt64Array.from(tokens.map(v => BigInt(v)));
        const attentionMask = BigInt64Array.from(new Array(tokens.length).fill(1n));
        const tokenTypeIds = BigInt64Array.from(new Array(tokens.length).fill(0n));

        const inputs = {
            input_ids: new Tensor('int64', inputIds, [1, tokens.length]),
            attention_mask: new Tensor('int64', attentionMask, [1, tokens.length]),
            token_type_ids: new Tensor('int64', tokenTypeIds, [1, tokens.length])
        };

        const output = await this.session.run(inputs);

        const [firstKey] = Object.keys(output);
        return new Float32Array(output[firstKey].data as Float32Array);
    }
}