import { SHEET_COLUMN_NAMES, SHEET_COLUMNS } from "@/lib/constants";
import { ColumnKey, ReceiptFormState } from "@/lib/types";
import { Check } from "lucide-react";
import Image from "next/image";

export default function UploadSuccess({
  form,
  file,
  fileUrl,
  workRelatedAmount,
}: {
  form: ReceiptFormState;
  fileUrl: string | null;
  file: File | null;
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
      Record Created:
      {file && fileUrl && (
        <div className="relative h-70 mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          {file.type === "application/pdf" ? (
            <iframe src={fileUrl} className="h-full w-full object-contain" />
          ) : (
            <Image
              src={fileUrl}
              alt="Receipt preview"
              fill
              className="object-contain"
            />
          )}
        </div>
      )}
      <ul>
        {(Object.keys(form) as (keyof ReceiptFormState)[]).map((key) => (
          <li key={key}>
            {SHEET_COLUMNS[key]}: {form[key]}
          </li>
        ))}
        <li key="fileUrl"></li>
      </ul>
    </div>
  );
}
