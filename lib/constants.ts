export const SHEET_NAME_PREFIX = "receipt-records-under-$300-";

export const SHEET_COLUMNS = {
  datePurchased: "Date purchased",
  supplierName: "Supplier name",
  amount: "Amount",
  description: "Description",
  expenseType: "Expense type",
  workRelatedPercentage: "Work-related percentage",
  workRelatedAmount: "Work-related amount",
  nexusToJob: "Nexus to job",
  dateRecordCreated: "Date record created",
  receiptFileUrl: "Receipt file URL",
} as const;

export const SHEET_COLUMN_NAMES = Object.values(SHEET_COLUMNS);

export const TOP_LEVEL_FOLDER_NAME = "easy-receipts";
