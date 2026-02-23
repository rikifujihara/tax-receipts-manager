"use client";

import { useEffect, useState } from "react";
import { FORM_STATE_FIELDS, SHEET_COLUMNS } from "@/lib/constants";
import {
  ColumnKey,
  ExtractedFieldsResponse,
  ExtractionStatus,
  ReceiptFormState,
  UploadStatus,
} from "@/lib/types";
import FilePreview from "@/app/_components/file-preview";
import FormStatus from "@/app/_components/form-status";
import Form from "@/app/_components/form";
import UploadSuccess from "@/app/_components/UploadSuccess";

const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Australia/Sydney",
});

const initialFormValues: Partial<Record<ColumnKey, string>> = {
  workRelatedPercentage: "100",
  dateRecordCreated: today,
};

const emptyForm = (): ReceiptFormState =>
  Object.fromEntries(
    Object.keys(FORM_STATE_FIELDS).map((key) => [
      key,
      initialFormValues[key as ColumnKey] ?? "",
    ]),
  ) as ReceiptFormState;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const [extractionStatus, setExtractionStatus] =
    useState<ExtractionStatus>("no-file");

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("no-file");

  const [form, setForm] = useState<ReceiptFormState>(emptyForm);
  const workRelatedAmount = (
    Number(form.amount) * Number(Number(form.workRelatedPercentage) * 0.01)
  ).toFixed(2);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    setExtractionStatus("file-selected");

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          Upload Tax Receipt
        </h1>

        <FilePreview
          file={file}
          fileUrl={fileUrl}
          setFile={setFile}
          handleExtractFields={handleExtractFields}
        />

        <FormStatus
          extractionStatus={extractionStatus}
          uploadStatus={uploadStatus}
        />

        {/* Form section */}
        {extractionStatus === "done" && (
          <Form
            form={form}
            setForm={setForm}
            workRelatedAmount={workRelatedAmount}
            handleUpload={handleUpload}
            uploadStatus={uploadStatus}
          />
        )}

        <UploadSuccess
          form={form}
          file={file}
          fileUrl={fileUrl}
          workRelatedAmount={workRelatedAmount}
        />
      </div>
    </div>
  );

  async function handleUpload() {
    if (!file) return;
    setUploadStatus("loading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workRelatedAmount", workRelatedAmount);

    (Object.keys(form) as (keyof ReceiptFormState)[]).forEach((key) => {
      formData.append(key, form[key]);
    });

    await fetch("api/upload", { method: "POST", body: formData });
    setUploadStatus("success");
    setExtractionStatus("no-file");
  }

  async function handleExtractFields() {
    if (!file) return;
    setExtractionStatus("loading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("occupation", "software developer");

    const response = await fetch("api/file/extract-fields", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as ExtractedFieldsResponse;
    setForm((prev) => ({ ...prev, ...data.fields }));
    setExtractionStatus("done");
  }
}
