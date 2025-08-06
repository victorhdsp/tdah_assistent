export interface AccessibilityEventData {
  eventType?: string;
  eventText: string | null;
  packageName: string | null;
  className: string | null;
  itemCount: number;
  currentItemIndex: number;
  fromIndex: number;
  toIndex: number;
  scrollX: number;
  scrollY: number;
  isChecked: boolean;
  isEnabled: boolean;
  isPassword: boolean;
  viewIdResourceName: string | null;
  children: AccessibilityEventData[];
  text: string | null;
  contentDescription: string | null;
  // Adicione mais propriedades conforme necessário
}