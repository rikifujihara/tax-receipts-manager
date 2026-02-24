import { FORM_STATE_FIELDS, SHEET_COLUMNS } from "@/lib/constants";
import { SetStateAction } from "react";

export type ColumnKey = keyof typeof SHEET_COLUMNS;

export type ReceiptRecord = Record<ColumnKey, string>;

export type ExtractedFieldsResponse = {
  fields: Omit<ReceiptRecord, "dateRecordCreated">;
};

export type ReceiptFormState = Record<keyof typeof FORM_STATE_FIELDS, string>;

export type SetState<T> = React.Dispatch<SetStateAction<T>>;

export type ExtractionStatus =
  | "loading"
  | "error"
  | "success"
  | "no-file"
  | "file-selected";

export type UploadStatus =
  | "loading"
  | "success"
  | "file-selected"
  | "error"
  | "no-file";
