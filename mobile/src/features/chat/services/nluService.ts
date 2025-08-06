import { NlpManager } from 'node-nlp-rn';
import RNFS from "react-native-fs"
import { Platform } from 'react-native';

export class NluService {
    private manager: NlpManager;

    constructor() {
        this.manager = new NlpManager({ languages: ['pt'] });
    }

    async init() {
        const modelDirUri = 'models';
        const fileName = 'nluModel.nlp';
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

            const modelJsonString = await RNFS.readFile(`${targetPathDir}/${fileName}`, 'utf8');
            this.manager.import(modelJsonString);
            console.log('NLU model loaded successfully');
            
        } catch (error) {
            console.error('Error initializing NLU service:', error);
            return;
        }
    }

    async process(text: string) {
        return this.manager.process('pt', text);
    }
}