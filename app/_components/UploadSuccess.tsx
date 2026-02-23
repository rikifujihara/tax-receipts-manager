import { SHEET_COLUMN_NAMES, SHEET_COLUMNS } from "@/lib/constants";
import { ColumnKey, ReceiptFormState } from "@/lib/types";
import { Check } from "lucide-react";

export default function UploadSuccess({
  form,
  fileUrl,
  workRelatedAmount,
}: {
  form: ReceiptFormState;
  fileUrl: string | null;
  workRelatedAmount: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center gap-2">
        <Check />
        <p className="text-gray-800 font-semibold">
          Success! Click &apos;Choose File&apos; upload another
        </p>
      </div>
      Fields Updated:
      <ul>
        {(Object.keys(form) as keyof ReceiptFormState).map((key) => (
          <li key={key}>
            {SHEET_COLUMNS[key]}: {form[key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
