import path from "path";
import { ParserAcessibilityWhatsappScrapping } from ".";
import { TextRowDataDTO } from "./model/dtoModel";
import { DataRole, TypeData } from "./model/enumModel";

const mockDataFolder = '/home/victor/projetos/pessoal/tdah_assistent/__test__/dump'
const DUMPFILE = './1752536088823.json';

const dumpFilePath = path.join(mockDataFolder, DUMPFILE);

const parserAcessibilityWhatsappScrapping = new ParserAcessibilityWhatsappScrapping()


describe('ParserAcessibilityWhatsappScrapping', () => {
    it('should parse accessibility data from WhatsApp scrapping', async () => {
        const content_expected: TextRowDataDTO[] = [
            { "date": null, "hour": "14:27", "id": "15b6513f70a831721424d337d853e69f", "isViewed": true, "role": DataRole.USER, "text": "Leve ao forno 180 graus por 25min", "type": TypeData.TEXT_ROW },
            { "date": "07/12/2025", "hour": "00:44", "id": "8958a6167631c8b2e7e2443b485ebbe2", "isViewed": false, "role": DataRole.CONTACT, "text": "https://vm.tiktok.com/ZMSpCDR55/", "type": TypeData.TEXT_ROW },
            { "date": "07/12/2025", "hour": "16:38", "id": "27fffeb440900468e0be330cadd8dd72", "isViewed": true, "role": DataRole.USER, "text": "https://4dd2779fd4aa.ngrok-free.app", "type": TypeData.TEXT_ROW },
            { "date": "07/14/2025", "hour": "10:46", "id": "d981a8f3a95c3ace3aba82175c1eff36", "isViewed": true, "role": DataRole.USER, "text": "+14155238886", "type": TypeData.TEXT_ROW },
            { "date": "07/14/2025", "hour": "10:46", "id": "134659fa6d251a4e3a81fa6be152fb69", "isViewed": true, "role": DataRole.USER, "text": "join handle-label", "type": TypeData.TEXT_ROW },
            { "date": "07/14/2025", "hour": "10:48", "id": "a3964190b4fd42694f1d07b83ca985ba", "isViewed": true, "role": DataRole.USER, "text": "http://192.168.1.160:3000", "type": TypeData.TEXT_ROW },
            { "date": "07/14/2025", "hour": "20:27", "id": "1a796116e37d85b35986b901c5a32cb9", "isViewed": true, "role": DataRole.USER, "text": "jucareformasdev@gmail.com\nJucaReformasDev!123", "type": TypeData.TEXT_ROW },
            { "date": "07/15/2025", "hour": "13:18", "id": "b91142acb1a274131fc0295d03c4d6ec", "isViewed": true, "role": DataRole.USER, "text": "http://192.168.1.160:3000", "type": TypeData.TEXT_ROW }
        ]

        const data = await import(dumpFilePath);
        const { content, metadata } = parserAcessibilityWhatsappScrapping.execute(data);
        expect(content).toBeDefined();
        expect(content.length).toBe(8)
        expect(content).toEqual(content_expected);

        expect(metadata).toBeDefined();
        expect(metadata.contactName).toBe('Yordle');
        expect(metadata.chatId).toBe('5ab82631a56c0ae57d14bb2f569ddc47');
        expect(metadata.packageName).toBe('com.whatsapp');
    });
});