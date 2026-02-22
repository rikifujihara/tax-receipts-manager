import { SetState } from "@/lib/types";
import Image from "next/image";

export default function FilePreview({
  file,
  setFile,
  fileUrl,
  handleExtractFields,
}: {
  file: File | null;
  setFile: SetState<File | null>;
  fileUrl: string | null;
  handleExtractFields: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col gap-4">
        <label htmlFor="receipt-file" className="block">
          <span className="text-sm font-semibold text-slate-700 mb-2 block">
            Receipt file
          </span>
          <input
            id="receipt-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </label>

        {file && fileUrl && (
          <div className="relative h-96 mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
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

        {file && fileUrl && (
          <button
            onClick={handleExtractFields}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 self-start"
          >
            Extract fields
          </button>
        )}
      </div>
    </div>
  );
}
