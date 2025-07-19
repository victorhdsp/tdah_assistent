
import type { AccessibilityEventData } from "../EventType";
import type { GenericDataDTO, TextRowDataDTO } from "./model/dtoModel";
import { DataRole, TypeData, TypeGenericViewIdData, TypeTextRowViewIdData } from "./model/enumModel";
import { findInEventNode, createHash, randomUUID } from './utils';

export class GenericData implements GenericDataDTO {
    constructor(
        public id: string,
        public hour: string,
        public role: DataRole,
        public type: TypeData,
        public date: string | null = null,
        public isViewed: boolean | null = null,
    ) {}

    static findStringFromEvent<T>(
        event: AccessibilityEventData,
        key: keyof AccessibilityEventData,
        value: T
    ): string | undefined {
        let result;
        findInEventNode(
            event,
            (node) => {
                if (node[key] !== value) return;
                result = node.text || node.contentDescription
            },
        )
        return result;
    }

    getTimestamp(): number {
        const [month, day, year] = (this.date || '01/01/1970').split('/').map(Number);
        const [hour, minute] = this.hour.split(':').map(Number);
        return new Date(year, month -1, day, hour, minute).getTime();
    }

    setDate(date: string | null) {
        this.date = date;
    }

    toDTO(): GenericDataDTO {
        return {
            id: this.id,
            hour: this.hour,
            role: this.role,
            type: this.type,
            date: this.date,
            isViewed: this.isViewed,
        };
    }
}

export class TextRowData extends GenericData implements TextRowDataDTO {
    constructor(
        hour: string,
        public text: string,
        date: string | null = null,
        isViewed: boolean | null = null,
        role: DataRole = DataRole.CONTACT,
        id: string = randomUUID(),
    ) {
        role = isViewed ? DataRole.USER : DataRole.CONTACT;
        id = createHash(`${hour}-${role}-${text}`);

        super(id, hour, role, TypeData.TEXT_ROW, date, isViewed);
    }

    static fromEvent(event: AccessibilityEventData, date: string | null): TextRowData {
        const hour: string = this.findStringFromEvent(event, 'viewIdResourceName', TypeGenericViewIdData.HOUR) || '';
        const text: string = this.findStringFromEvent(event, 'viewIdResourceName', TypeTextRowViewIdData.TEXT) || '';
        const isViewed: boolean = Boolean(this.findStringFromEvent(event, 'viewIdResourceName', TypeGenericViewIdData.VIEWED));
        
        return new TextRowData(
            hour,
            text,
            date,
            isViewed
        );
    }

    override toDTO(): TextRowDataDTO {
        return {
            ...super.toDTO(),
            text: this.text,
        };
    }

    static fromDTO(dto: TextRowDataDTO): TextRowData {
        return new TextRowData(
            dto.hour,
            dto.text,
            dto.date,
            dto.isViewed,
            dto.role,
            dto.id
        );
    }
}
