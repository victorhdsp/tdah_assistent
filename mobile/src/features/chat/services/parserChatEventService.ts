import { AccessibilityEventData } from "@/src/scripts/collect_data/EventType";
import { ChatEventDTO, TypeViewIdResourceName, TypeGenericViewIdData, TypeTextRowViewIdData } from "../models/chatEventDTO";
import { ChatEventEntity } from "../models/chatEventEntity";
import { findInEventNode, findStringInEventNode } from "@/src/core/native/events/accessibility/utils/findInEventNode";
import { ChatPreEventDTO } from "../models/chatPreEventDTO";
import { parseDynamicDate } from "@/src/core/utils/parseDynamicDate";

export class ParserChatEventService {
    convertFromAccessibilityEvent(accessibilityEvent: AccessibilityEventData): ChatEventDTO[] {
        const chat_app_id = accessibilityEvent.packageName || "unknown_app";
        let chat_contact = "unknown_contact";
        let date: string | undefined;
        
        const chatPreEvents: ChatPreEventDTO[] = [];
        
        findInEventNode(accessibilityEvent, (node) => {
            if (node.viewIdResourceName === TypeViewIdResourceName.METADATA) {
                if (!node.text) throw new Error("Metadata node text is empty");
                chat_contact = node.text;
            }
            if (node.viewIdResourceName === TypeViewIdResourceName.TEXT_ROW) {
                const hour: string = findStringInEventNode(node, 'viewIdResourceName', TypeGenericViewIdData.HOUR) || '';
                const text: string = findStringInEventNode(node, 'viewIdResourceName', TypeTextRowViewIdData.TEXT) || '';
                const isViewed: boolean = Boolean(findStringInEventNode(node, 'viewIdResourceName', TypeGenericViewIdData.VIEWED));

                chatPreEvents.push({
                    type: "chat_pre_event",
                    sender: isViewed ? "other" : "user",
                    content: text,
                    hour,
                    date: date || new Date().toISOString().split('T')[0],
                })
            }
            if (node.viewIdResourceName === TypeViewIdResourceName.DATE_DIVIDER)
                date = parseDynamicDate(node.text || '')?.toISOString().split('T')[0];
        });

        const entityList: ChatEventDTO[] = [];
        let lastNodeId: string | undefined = undefined;
        
        for (const event of chatPreEvents) {
            const entity = ChatEventEntity.fromPreDTO(
                event,
                chat_contact,
                chat_app_id,
                "accessibility",
                date,
                lastNodeId
            );
            if (entity) {
                lastNodeId = entity.unique_id;
                entityList.push(entity.toDTO());
            }
        }

        return entityList;
    }
}