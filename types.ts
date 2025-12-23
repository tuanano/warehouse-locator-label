export interface LabelConfig {
  width: number; // mm
  height: number; // mm
  fontSize: number;
  barcodeHeight: number;
  showText: boolean;
  columns: number; // Number of columns per row in print
  gap: number; // mm
  barWidth: number; // Width of single bar
}

export interface LabelItem {
  id: string;
  code: string;
  description?: string;
}

export enum GeneratorType {
  MANUAL = 'MANUAL',
  SERIES = 'SERIES'
}