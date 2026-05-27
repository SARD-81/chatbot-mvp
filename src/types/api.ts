export type ChatTableRow = Record<string, string | number | boolean | null>;

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

export interface ChatResponse {
  conversation_id: string;
  intent_type?: string;
  answer: string;
  sql?: string;
  table?: ChatTable;
  metadata?: ChatMetadata;
}

export interface UploadResponse {
  file_id: string;
  tables_created: string[];
  message: string;
}