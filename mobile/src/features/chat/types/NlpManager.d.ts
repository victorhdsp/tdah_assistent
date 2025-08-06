type NlpManagerLocale = "pt"

interface NlpProcessResult{
    actions: any[],
    classifications: {
        label: string,
        value: number
    }[],
    domain?: any,
    entities: any[],
    intent: string,
    language: string,
    languageGuessed: boolean,
    locale: NlpManagerLocale,
    localeIso2: NlpManagerLocale,
    score: number,
    sentiment: {
        comparative: number,
        language: NlpManagerLocale,
        numHits: number,
        numWords: number,
        score: number,
        type: "senticon",
        vote: "neutral"
    },
    utterance: string
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
        export(): any;
    }
}
