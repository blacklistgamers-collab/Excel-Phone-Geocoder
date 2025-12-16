export interface ExcelRow {
  [key: string]: any;
}

export type CallStatus = 'ANSWERED' | 'NO_ANSWER' | null;

export interface ProcessedRow extends ExcelRow {
  Pays?: string;
  OriginalIndex?: number;
  callStatus?: CallStatus;
}

export enum AppTab {
  PROCESSOR = 'PROCESSOR',
  SCRIPT = 'SCRIPT',
}

export interface ProcessingStats {
  total: number;
  identified: number;
  unknown: number;
}