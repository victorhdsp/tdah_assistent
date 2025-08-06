interface NlpProcessResult {
    locale: string;
    utterance: string;
    intent: string;
    score: number;
    entities: {
        entity: string;
        option: string;
        sourceText: string;
        accuracy: number;
    }[];
    sentiment?: {
        score: number;
        comparative: number;
        vote: string;
    };
}

declare module 'node-nlp-rn' {
   export class NlpManager {
        constructor(options?: { languages?: string[]; forceNER?: boolean });
        addLanguage(language: string): void;
        addDocument(language: string, document: string, intent: string): void;
        train(): Promise<void>;
        process(language: string, text: string): Promise<NlpProcessResult>;
        save(fileName?: string): Promise<void>;
        load(fileName?: string): Promise<void>;
        import(data: any): void;
        export(minified: boolean): any;
    }
}