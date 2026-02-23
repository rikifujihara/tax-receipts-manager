import { SHEET_COLUMNS } from "@/lib/constants";
import { SetStateAction } from "react";

export type ColumnKey = keyof typeof SHEET_COLUMNS;

export type ReceiptRecord = Record<ColumnKey, string>;

export type ExtractedFieldsResponse = {
  fields: Omit<ReceiptRecord, "dateRecordCreated">;
};

export type ReceiptFormState = Omit<
  ReceiptRecord,
  "receiptFileUrl" | "workRelatedAmount"
>;

export type SetState<T> = React.Dispatch<SetStateAction<T>>;

export type ExtractionStatus =
  | "loading"
  | "error"
  | "done"
  | "no-file"
  | "file-selected";

export type UploadStatus =
  | "loading"
  | "success"
  | "file-selected"
  | "error"
  | "no-file";
