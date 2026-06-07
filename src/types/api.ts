export type ChatTableRow = Record<string, unknown>;

export interface ChatTable {
  columns: string[];
  rows: ChatTableRow[];
  row_count: number;
}

export interface ChatMetadata {
  compressed?: boolean;
  answer_mode?: string;
  download_url?: string;
  is_truncated?: boolean;
}

export type ChartConfigType = 'table' | 'bar' | 'line' | 'pie' | 'scatter' | 'kpi';

export interface ChartConfig {
  chart_type: ChartConfigType;
  x_axis: string | null;
  y_axis: string | null;
  size_or_color?: string | null;
}

export interface ChatResponse {
  conversation_id: string;
  intent_type?: string;
  answer: string;
  sql?: string;
  table?: ChatTable;
  metadata?: ChatMetadata;
  chart_config?: ChartConfig;
}

export interface UploadResponse {
  file_id: string;
  tables_created: string[];
  message: string;
}
