import { TextRowData } from "../parser/entity";
import { ChatDataDTO } from "../parser/model/dtoModel";

export class SortChatData {
    private findInsertIndex(oldChat: ChatDataDTO, newChat: ChatDataDTO): number {
        const oldIndex = { start: 0, end: oldChat.content.length - 1 };
        const newIndex = { start: 0, end: newChat.content.length - 1 };

        if (oldChat.content.length === 0) {
            return 0;
        }
        if (newChat.content.length === 0) {
            return oldChat.content.length;
        }
        while (oldChat.content[oldIndex.start].date == null && oldIndex.start <= oldChat.content.length) oldIndex.start++;
        while (newChat.content[newIndex.start].date == null && newIndex.start <= newChat.content.length) newIndex.start++;
        while (oldChat.content[oldIndex.end].date == null && oldIndex.end >= 0) oldIndex.end--;
        while (newChat.content[newIndex.end].date == null && newIndex.end >= 0) newIndex.end--;

        if (oldIndex.start > oldIndex.end) {
            return oldChat.content.length;
        }
        if (newIndex.start > newIndex.end) {
            return 0;
        }

        let currentIndex = [{ index: oldIndex.start, value: oldChat.content[oldIndex.start].date }];

        function compareOldAndNew(oldIndex: number, newIndex: number): number {
            const oldDate = oldChat.content[oldIndex].date;
            const newDate = newChat.content[newIndex].date;

            if (oldDate === null && newDate === null) {
                return 0;
            }
            if (oldDate === null) {
                return 1; 
            }
            if (newDate === null) {
                return -1; 
            }
            if (
                TextRowData.fromDTO(oldChat.content[oldIndex]).getTimestamp() <
                TextRowData.fromDTO(newChat.content[newIndex]).getTimestamp()
            ) {
                return -1;
            } 
            if (
                TextRowData.fromDTO(oldChat.content[oldIndex]).getTimestamp() >
                TextRowData.fromDTO(newChat.content[newIndex]).getTimestamp()
            ) {
                return 1;
            }

            return 0;
        }

        if (compareOldAndNew(oldIndex.start, newIndex.end) > 0) {
            return oldIndex.start;
        } else if (compareOldAndNew(oldIndex.end, newIndex.start) < 0) {
            return oldChat.content.length;
        }
        
        let currentIndexValue = oldIndex.start;
        for (let i = 0; i < oldChat.content.length; i++) {
            if (oldChat.content[currentIndexValue].date === null) {
                currentIndexValue++;
                continue;
            }

            
            const compare = compareOldAndNew(currentIndexValue, newIndex.start);
            
            if (compare > 0) {
                currentIndexValue = Math.round((oldIndex.start - currentIndexValue) / 2);
            } else if (compare < 0) {
                currentIndexValue = Math.round((oldIndex.end + currentIndexValue) / 2);
            } else {
                return currentIndexValue;
            }
            if (currentIndex.map(item => item.index).includes(currentIndexValue))
                return currentIndexValue;
          
            currentIndex.push({ index: currentIndexValue, value: oldChat.content[currentIndexValue].date });
        }
        return currentIndex[currentIndex.length - 1].index;
    }

    private margeData(oldChat: ChatDataDTO, newChat: ChatDataDTO, insertIndex: number) {
        let countAdded = 0;
        let indexToStartAdd = 0

        for (let i = 0; i < newChat.content.length; i++) {
            if (newChat.content[i].id === null) throw new Error("New chat data must have an ID to merge.");
            
            if (newChat.content[i].date === null) {
                indexToStartAdd++;
                continue;
            }

            if (
                insertIndex + countAdded < oldChat.content.length &&
                newChat.content[i].id === oldChat.content[insertIndex + countAdded].id &&
                newChat.content[i].date === oldChat.content[insertIndex + countAdded].date
            ) {
                insertIndex++;
                indexToStartAdd++;
                continue;
            }
            
            if (newChat.content[i].date === null) {
                continue;
            }

            while (indexToStartAdd <= i) {
                if (insertIndex + countAdded >= oldChat.content.length) {
                    oldChat.content.push(newChat.content[indexToStartAdd]);
                } else {
                    oldChat.content.splice(insertIndex + countAdded, 0, newChat.content[indexToStartAdd]);
                }
                indexToStartAdd++;
                countAdded++;
            }
        }
    }

    execute(oldChat: ChatDataDTO, newChat: ChatDataDTO): ChatDataDTO {
        console.log("Sorting chat data...");

        if (!oldChat || !newChat) {
            throw new Error("Both oldChat and newChat must be provided.");
        }

        if (oldChat.metadata.chatId !== newChat.metadata.chatId) {
            throw new Error("Chat IDs do not match.");
        }


        let currentInsertIndex = this.findInsertIndex(oldChat, newChat);
        this.margeData(oldChat, newChat, currentInsertIndex);
        
        return oldChat;
    }
}