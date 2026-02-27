import Image from "next/image";

export default function FilePreview({
  file,
  handleFileChange,
  fileUrl,
  handleExtractFields,
}: {
  file: File | null;
  handleFileChange: (file: File | null) => void;
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
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </label>

        {file && fileUrl && (
          <div
            className={`relative mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 ${file.name.toLowerCase().endsWith(".heic") ? "" : "h-40 md:h-96"}`}
          >
            {file.type === "application/pdf" ? (
              <iframe src={fileUrl} className="h-full w-full object-contain" />
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
