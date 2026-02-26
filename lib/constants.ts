export const SHEET_NAME_PREFIX = "receipt-records-";

export const SHEET_COLUMNS = {
  datePurchased: "Date purchased",
  supplierName: "Supplier name",
  amount: "Amount",
  description: "Description",
  expenseType: "Expense type",
  workRelatedPercentage: "Work-related percentage",
  nexusToJob: "Nexus to job",
  dateRecordCreated: "Date record created",
  workRelatedAmount: "Work-related amount",
  receiptFileUrl: "Receipt file URL",
} as const;

// Destructured variables are just being used to derive FORM_STATE_FIELDS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { receiptFileUrl, workRelatedAmount, ...FORM_STATE_FIELDS } =
  SHEET_COLUMNS;

export { FORM_STATE_FIELDS };

export const SHEET_COLUMN_NAMES = Object.values(SHEET_COLUMNS);

export const TOP_LEVEL_FOLDER_NAME = "easy-receipts";
