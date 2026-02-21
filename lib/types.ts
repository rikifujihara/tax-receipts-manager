import { SHEET_COLUMNS } from "@/lib/constants";

export type ColumnKey = keyof typeof SHEET_COLUMNS;

export type ReceiptRecord = Record<ColumnKey, string | null>;

export type ExtractedFieldsResponse = Omit<ReceiptRecord, "dateRecordCreated">;

export type FormState = Record<ColumnKey, string>;
