import crypto from "crypto";
import type { AccessibilityEventData } from "../EventType";
import { TextRowData } from "./entity";
import type { ChatDataDTO, DataToList, MetadataDTO } from "./model/dtoModel";
import { TypeData } from "./model/enumModel";
import { dateFormat, findInEventNode } from "./utils";

export class ParserAcessibilityWhatsappScrapping {
    private date: string[] = [];
    private metadata: MetadataDTO | null = null;

    private updateDateWithEvent(node: AccessibilityEventData) {
        const now = new Date(dateFormat(new Date()));
        let resultDate = now;

        switch ((node.text || '').toLowerCase()) {
            case 'hoje': break;
            case 'ontem': resultDate.setDate(now.getDate() - 1); break;
            case 'segunda-feira': resultDate.setDate(now.getDate() - now.getDay() - 6); break;
            case 'terça-feira': resultDate.setDate(now.getDate() - now.getDay() - 5); break;
            case 'quarta-feira': resultDate.setDate(now.getDate() - now.getDay() - 4); break;
            case 'quinta-feira': resultDate.setDate(now.getDate() - now.getDay() - 3); break;
            case 'sexta-feira': resultDate.setDate(now.getDate() - now.getDay() - 2); break;
            case 'sábado': resultDate.setDate(now.getDate() - now.getDay() - 1); break;
            case 'domingo': resultDate.setDate(now.getDate() - now.getDay()); break;
            default: break;
        }

        this.date.push(dateFormat(resultDate))
    }

    private updateMetadataWithEvent(node: AccessibilityEventData) {
        const contactName = node.text;
        const packageName = node.viewIdResourceName?.split(':')[0];
        const chatId = crypto.createHash('md5')
                    .update(`${contactName}-${packageName}`).digest('hex');

        if (!contactName || !packageName || !chatId) {
            throw new Error('Invalid metadata from event node');
        }

        this.metadata = {
            contactName: contactName,
            packageName: packageName,
            chatId: chatId,
        }
    }

    private selectActionFromEvent(node: AccessibilityEventData) {
        switch (node.viewIdResourceName) {
            case TypeData.TEXT_ROW:
                return TextRowData.fromEvent(node, this.date[this.date.length - 1] || null);
            case TypeData.DATE_DIVIDER:
                this.updateDateWithEvent(node);
                return null;
            case TypeData.CONTACT_NAME:
                this.updateMetadataWithEvent(node);
                return null;
            default:
                return null;
        }
    }
    
    private findInTypeNode(rootEventNode: AccessibilityEventData) {
        const nodeTypes: TypeData[] = [ TypeData.TEXT_ROW, TypeData.DATE_DIVIDER, TypeData.CONTACT_NAME ];
        const nodeList: DataToList[] = []

        findInEventNode<TypeData>(
            rootEventNode,
            (node) => {
                for (const nodeType of nodeTypes) {
                    if (node.viewIdResourceName === nodeType) {
                        const data = this.selectActionFromEvent(node);
                        if (data) nodeList.push(data.toDTO());
                    }
                }
            },
        )
        return nodeList;
    }

    execute(rootEventNode: AccessibilityEventData): ChatDataDTO {
        const nodeList = this.findInTypeNode(rootEventNode);
        
        if (nodeList.length === 0) {
            throw new Error('No valid data found in the event node');
        }

        if (!this.metadata) {
            throw new Error('Metadata is not defined');
        }

        if (rootEventNode.packageName !== this.metadata.packageName) {
            throw new Error('Package name is not defined in the root event node');
        }
        
        return {
            metadata: this.metadata,
            content: nodeList,
        };
    }
}