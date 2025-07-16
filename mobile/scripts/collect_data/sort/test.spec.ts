import { SortChatData } from ".";
import { TextRowData } from "../parser/entity";
import { ChatDataDTO, MetadataDTO } from '../parser/model/dtoModel';
import { dateFormat } from "../parser/utils";

const sortChatData = new SortChatData();

const metadata: MetadataDTO = {
    contactName: 'Yordle',
    chatId: '5ab82631a56c0ae57d14bb2f569ddc47',
    packageName: 'com.whatsapp'
}

function createMockChatData(start_date: string, start_index: number, size: number): ChatDataDTO {
    return {
        metadata: metadata,
        content: Array.from({ length: size }, (_, i) => {

            const date = new Date(start_date);
            date.setDate(date.getDate() + i);
            return (new TextRowData(
                '11:00',
                `Message ${i + start_index + 1}`,
                dateFormat(date),
                true,
            )).toDTO()
        })
    }
}

describe('ParserAcessibilityWhatsappScrapping', () => {
    test('marge two lists in front', async () => {
        const listOne: ChatDataDTO = createMockChatData('2025-07-12', 0, 8);
        const listTwo: ChatDataDTO = createMockChatData('2025-07-21', 8, 7);

        const expected: ChatDataDTO = {
            metadata: metadata,
            content: [
                ...listOne.content,
                ...listTwo.content
            ]
        }

        const result = await sortChatData.execute(listOne, listTwo);

        expect(result).toBeDefined();
        expect(result.metadata).toEqual(expected.metadata);
        expect(result.content).toBeDefined();
        expect(result.content.length).toBe(15);
        expect(result.content).toEqual(expected.content);
    });

    test('marge two lists in front', async () => {
        const listOne: ChatDataDTO = createMockChatData('2025-07-21', 0, 8);
        const listTwo: ChatDataDTO = createMockChatData('2025-07-12', 8, 7);

        const expected: ChatDataDTO = {
            metadata: metadata,
            content: [
                ...listTwo.content,
                ...listOne.content
            ]
        }

        const result = await sortChatData.execute(listOne, listTwo);

        expect(result).toBeDefined();
        expect(result.metadata).toEqual(expected.metadata);
        expect(result.content).toBeDefined();
        expect(result.content.length).toBe(15);
        expect(result.content).toEqual(expected.content);
    });

    test('marge two lists with same date', async () => {
        const listOne: ChatDataDTO = createMockChatData('2025-07-12', 0, 8);
        const listTwo: ChatDataDTO = createMockChatData('2025-07-15 ', 4, 7);

        const expected: ChatDataDTO = {
            metadata: metadata,
            content: [
                ...listOne.content.slice(0, 4),
                ...listTwo.content
            ]
        }

        const result = await sortChatData.execute(listOne, listTwo);

        expect(result).toBeDefined();
        expect(result.metadata).toEqual(expected.metadata);
        expect(result.content).toBeDefined();
        expect(result.content.length).toBe(11);
        expect(result.content).toEqual(expected.content);
    });

    test('marge two lists with same date', async () => {
        const listOne: ChatDataDTO = createMockChatData('2025-07-12', 0, 8);
        const listTwo: ChatDataDTO = createMockChatData('2025-07-15 ', 4, 7);

        listTwo.content[0].date = null;
        listTwo.content[1].date = null;
        listTwo.content[2].date = null;

        const expected: ChatDataDTO = {
            metadata: metadata,
            content: [
                ...listOne.content,
                ...listTwo.content.slice(4) // Skip the first three items with null dates
            ]
        }

        const result = await sortChatData.execute(listOne, listTwo);

        expect(result).toBeDefined();
        expect(result.metadata).toEqual(expected.metadata);
        expect(result.content).toBeDefined();
        expect(result.content.length).toBe(11);
        expect(result.content).toEqual(expected.content);
    });
});