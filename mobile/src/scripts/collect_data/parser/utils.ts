import type { AccessibilityEventData } from "../EventType";

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

export function dateFormat(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    };
    return date.toLocaleDateString('en-EN', options);
}

export function createHash(input: string): string {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 33) ^ input.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
}

export function randomUUID(): string {
    return createHash(Date.now().toString() + Math.random().toString());
}