import { SHEET_COLUMNS } from "@/lib/constants";

export type ColumnKey = keyof typeof SHEET_COLUMNS;

export type ReceiptRecord = Record<ColumnKey, string>;

export type ExtractedFieldsResponse = {
  fields: Omit<ReceiptRecord, "dateRecordCreated">;
};

export type ReceiptFormState = Omit<
  ReceiptRecord,
  "receiptFileUrl" | "workRelatedAmount"
>;
