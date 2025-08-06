import { AccessibilityEventData } from "../models/AccessibilityEventData";

export function findInEventNode<T>(
    node: AccessibilityEventData,
    callback: (event: AccessibilityEventData) => void
): void {
    if (node.children) {
        for (const child of node.children) {
            findInEventNode<T>(child, callback);
        }
    }

    callback(node);
}

export function findStringInEventNode(
    event: AccessibilityEventData,
    key: keyof AccessibilityEventData,
    value: string
): string | null {
    let result: string | null = null;

    findInEventNode(
        event,
        (node) => {
            if (node[key] !== value) return;
            result = node.text || node.contentDescription
        },
    )

    return result;
}