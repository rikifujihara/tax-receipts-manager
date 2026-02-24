import { ExtractionStatus, UploadStatus } from "@/lib/types";
import { ArrowUp, Loader2 } from "lucide-react";

export default function FormStatus({
  extractionStatus,
}: {
  extractionStatus: ExtractionStatus;
  uploadStatus: UploadStatus;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {extractionStatus === "no-file" && (
        <div className="flex items-center gap-2">
          <ArrowUp />
          <p className="text-gray-800 font-semibold">
            Click &apos;Choose File&apos; to get started
          </p>
        </div>
      )}

      {extractionStatus === "file-selected" && (
        <div className="flex items-center gap-2">
          <ArrowUp />
          <p className="text-gray-800 font-semibold">
            Click &apos;Extract fields&apos; to analyse
          </p>
        </div>
      )}

      {extractionStatus === "loading" && (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={20} />
          <p className="text-blue-600 font-medium">Extracting fields...</p>
        </div>
      )}
    </div>
  );
}
