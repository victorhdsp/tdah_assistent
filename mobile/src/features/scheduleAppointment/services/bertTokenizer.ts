import { Platform } from 'react-native';
import RNFS from 'react-native-fs';


export class BertTokenizer {
  vocab: Map<string, number>;
  unkToken = '[UNK]';
  clsToken = '[CLS]';
  sepToken = '[SEP]';

  constructor() {
    this.vocab = new Map();
  }

  async init() {
    const modelDirUri = 'dicts';
    const fileName = 'bertVocab.txt';
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

        const vocab = await RNFS.readFile(`${targetPathDir}/${fileName}`, 'utf8');
        console.log("BertTokenizer initialized with vocab size:", vocab.split('\n').length);
        const vocabList = vocab.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        this.vocab = new Map();
        vocabList.forEach((token, idx) => this.vocab.set(token, idx));
        
    } catch (error) {
        console.error('Error initializing BertTokenizer:', error);
        return;
    }
  }

  tokenize(text: string): number[] {
    const tokens = [this.clsToken];
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      tokens.push(...this.wordpieceTokenize(word));
    }
    tokens.push(this.sepToken);

    return tokens.map(token => this.vocab.get(token) ?? this.vocab.get(this.unkToken)!);
  }

  wordpieceTokenize(word: string): string[] {
    const tokens: string[] = [];
    let start = 0;
    while (start < word.length) {
      let end = word.length;
      let curSubstr = null;
      while (start < end) {
        let substr = word.substring(start, end);
        if (start > 0) substr = '##' + substr; // prefixo para subpalavras
        if (this.vocab.has(substr)) {
          curSubstr = substr;
          break;
        }
        end -= 1;
      }
      if (curSubstr === null) {
        tokens.push(this.unkToken);
        break;
      }
      tokens.push(curSubstr);
      start = end;
    }
    return tokens;
  }
}
