declare module 'node-nlp-rn' {
   export class NlpManager {
        constructor(options?: { languages?: string[]; forceNER?: boolean });
        addLanguage(language: string): void;
        addDocument(language: string, document: string, intent: string): void;
        train(): Promise<void>;
        process(language: string, text: string): Promise<any>;
        save(fileName?: string): Promise<void>;
        load(fileName?: string): Promise<void>;
        import(data: any): void;
        export(minified: boolean): any;
    }
}