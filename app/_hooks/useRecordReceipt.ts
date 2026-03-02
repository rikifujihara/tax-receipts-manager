import { uploadReceipt } from "@/app/_api/receipts";
import { FORM_STATE_FIELDS } from "@/lib/constants";
import { compressIfNeeded } from "@/lib/helpers";
import {
  ColumnKey,
  ExtractedFieldsResponse,
  ExtractionStatus,
  ReceiptFormState,
  UploadStatus,
} from "@/lib/types";
import { useState, useEffect } from "react";

export default function useRecordReceipt() {
  // Could move calculation outside of the component, but
  // calculating today's date within the component incase re-render occurs at 12am
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
      // The fileUrl is a browser resource that needs cleanup.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFileUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setFileUrl(url);

    setExtractionStatus("file-selected");

    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleFileChange(file: File | null) {
    if (!file) return setFile(null);
    setFile(await compressIfNeeded(file));
  }

  async function handleUpload() {
    try {
      if (!file) return;
      setUploadStatus("loading");
      await uploadReceipt({ file, form, workRelatedAmount });
      setUploadStatus("success");
      setExtractionStatus("no-file");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setUploadStatus("error");
    }
  }

  async function handleExtractFields() {
    try {
      if (!file) return;
      setExtractionStatus("loading");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("occupation", "software developer");

      // TODO: extract
      const response = await fetch("api/file/extract-fields", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ExtractedFieldsResponse;
      setForm((prev) => ({ ...prev, ...data.fields }));
      setExtractionStatus("success");
    } catch {
      setExtractionStatus("error");
    }
  }

  function resetState() {
    setFile(null);
    setFileUrl(null);
    setExtractionStatus("no-file");
    setUploadStatus("no-file");
    setForm(emptyForm());
  }

  return {
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
  };
}
