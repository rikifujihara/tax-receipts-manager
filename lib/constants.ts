export const SHEET_NAME_PREFIX = "receipt-records-under-$300-";

export const SHEET_COLUMNS = [
  "Date purchased",
  "Supplier name",
  "Amount",
  "Description",
  "Expense type",
  "Work-related percentage",
  "Work-related amount",
  "Nexus to job",
  "Date record created",
  "Receipt file URL",
] as const;

export const EXPENSE_TYPES = [
  "Other deductions",
  "Gifts or donations",
  "Cost of managing tax affairs",
];

export const TOP_LEVEL_FOLDER_NAME = "easy-receipts";
