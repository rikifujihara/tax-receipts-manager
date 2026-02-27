"use client";

import FilePreview from "@/app/_components/file-preview";
import FormStatus from "@/app/_components/form-status";
import Form from "@/app/_components/form";
import UploadSuccess from "@/app/_components/UploadSuccess";
import useRecordReceipt from "@/app/_hooks/useRecordReceipt";

export default function Home() {
  const {
    file,
    handleFileChange,
    fileUrl,
    extractionStatus,
    uploadStatus,
    form,
    setForm,
    workRelatedAmount,
    handleUpload,
    handleExtractFields,
    resetState,
  } = useRecordReceipt();

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 md:mb-8">
          Upload Tax Receipt
        </h1>
{uploadStatus !== "success" && (
          <FilePreview
            file={file}
            fileUrl={fileUrl}
            handleFileChange={handleFileChange}
            handleExtractFields={handleExtractFields}
          />
        )}

        {extractionStatus !== "success" && uploadStatus !== "success" && (
          <FormStatus
            extractionStatus={extractionStatus}
            uploadStatus={uploadStatus}
          />
        )}

        {/* Form section */}
        {extractionStatus === "success" && uploadStatus !== "success" && (
          <Form
            form={form}
            setForm={setForm}
            workRelatedAmount={workRelatedAmount}
            handleUpload={handleUpload}
            uploadStatus={uploadStatus}
          />
        )}
        {uploadStatus === "success" && (
          <UploadSuccess
            form={form}
            file={file}
            fileUrl={fileUrl}
            workRelatedAmount={workRelatedAmount}
            resetState={resetState}
          />
        )}
      </div>
    </div>
  );
}
