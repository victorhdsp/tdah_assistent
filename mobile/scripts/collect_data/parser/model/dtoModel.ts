import { DataRole, TypeData } from "./enumModel";

export interface GenericDataDTO {
    id: string,
    hour: string,
    role: DataRole,
    type: TypeData,
    date: string | null,
    isViewed: boolean | null,
}

export interface TextRowDataDTO extends GenericDataDTO {
    text: string,
}

export type DataToList = TextRowDataDTO

export interface MetadataDTO {
    chatId: string,
    contactName: string,
    packageName: string,
}

export interface ChatDataDTO {
    metadata: MetadataDTO,
    content: DataToList[],
    floating?: DataToList[],
}