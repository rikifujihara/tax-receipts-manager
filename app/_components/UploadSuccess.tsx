import { SHEET_COLUMNS } from "@/lib/constants";
import { ReceiptFormState } from "@/lib/types";
import { Check } from "lucide-react";
import Image from "next/image";

// TODO: future feature - return the links for both the receipt, the sheet and the drive folder
export default function UploadSuccess({
  form,
  file,
  fileUrl,
  resetState,
}: {
  form: ReceiptFormState;
  fileUrl: string | null;
  file: File | null;
  workRelatedAmount: string;
  resetState: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center justify-between gap-2 mb-6">
        <span className="flex items-center gap-2">
          <Check className="text-green-600" size={24} />
          <p className="text-slate-900 font-semibold text-lg">Recorded</p>
        </span>
        <button
          onClick={resetState}
          className={`flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 md:w-auto`}
        >
          Start again
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="block text-sm font-semibold text-slate-700 mb-3">
            Record Details
          </h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(form) as (keyof ReceiptFormState)[]).map((key) => (
                <div key={key} className="flex flex-col">
                  <span className="text-xs font-medium text-slate-600 mb-1">
                    {SHEET_COLUMNS[key]}
                  </span>
                  <span className="text-sm text-slate-900">{form[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {file && fileUrl && (
          <div>
            <h3 className="block text-sm font-semibold text-slate-700 mb-2">
              Receipt
            </h3>
            <div
              className={`relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 ${file.name.toLowerCase().endsWith(".heic") ? "" : "h-80"}`}
            >
              {file.type === "application/pdf" ? (
                <iframe
                  src={fileUrl}
                  className="h-full w-full object-contain"
                />
              ) : file.name.toLowerCase().endsWith(".heic") ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      HEIC Image
                    </p>
                    <p className="text-sm font-semibold text-slate-700 break-all">
                      {file.name}
                    </p>
                  </div>
                </div>
              ) : (
                <Image
                  src={fileUrl}
                  alt="Receipt preview"
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
