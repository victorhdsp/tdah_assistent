import fs from "node:fs";
import path from "node:path";
import { NlpManager } from "node-nlp-rn";
import md5 from "md5"

const manager = new NlpManager({ languages: ["pt"] });

const assetDirUri = path.resolve("src/assets");
const targetDirUri = path.resolve("src/public");

/* FORMAT YML
    version: "3.1"

    nlu:
        - intent: abc1
        examples: |
            - "text 1"
            - "text 2"

        - intent: abc2
          examples: |
            - "text 1"
            - "text 2"
*/

function generateID(content: string[]): string {
    return md5(content.join("\n")).toString();
}

async function trainNlu() {
    const files = fs.readdirSync(assetDirUri);
    const targetName = `nlu-${generateID(files)}.nlp`;

    if (fs.existsSync(path.join(targetDirUri, targetName))) {
        console.log(`NLU data already exists: ${targetName}`);
        return;
    }

    if (fs.existsSync(targetDirUri)) {
        fs.rmdirSync(targetDirUri, { recursive: true });
    }
    fs.mkdirSync(targetDirUri, { recursive: true });

    for (const file of files) {
        const filePath = path.join(assetDirUri, file);
        const ymlContent = fs.readFileSync(filePath, "utf-8");
        const intents = ymlContent.split("- intent: ").slice(1).map(intent => intent.trim());

        for (const intent of intents) {
            const [name, bruteExamples] = intent.split("\n  examples: |");
            if (!name || !bruteExamples) continue;

            const examples = bruteExamples.split("\n")
            for (const example of examples) {
                const trimmedExample = example.replace(" - ", "").trim();
                if (trimmedExample) {
                    manager.addDocument("pt", trimmedExample, name);
                }
            }
        }
    }

    await manager.train();
    const data = await manager.export(true);
    const targetFilePath = path.join(targetDirUri, targetName);
    fs.writeFileSync(targetFilePath, data);
    console.log(`NLU data trained and saved to: ${targetFilePath}`);
}

trainNlu()