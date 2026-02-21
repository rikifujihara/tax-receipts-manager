"use client";

import { useEffect, useState } from "react";
import { SHEET_COLUMNS } from "@/lib/constants";
import Image from "next/image";
import {
  ColumnKey,
  ExtractedFieldsResponse,
  ReceiptFormState,
} from "@/lib/types";

const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Australia/Sydney",
});

const initialFormValues: Partial<Record<ColumnKey, string>> = {
  workRelatedPercentage: "100",
  dateRecordCreated: today,
};

const emptyForm = (): ReceiptFormState =>
  Object.fromEntries(
    Object.keys(SHEET_COLUMNS).map((key) => [
      key,
      initialFormValues[key as ColumnKey] ?? "",
    ]),
  ) as ReceiptFormState;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const [extractionStatus, setExtractionStatus] = useState<
    "loading" | "error" | "done" | "no-file"
  >("no-file");

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

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-col p-3">
      <h1 className="text-3xl font-medium">Upload Tax Receipt</h1>
      {/* ˇˇ section for previewing file before field extraction  */}
      {file &&
        fileUrl &&
        (file.type === "application/pdf" ? (
          <iframe src={fileUrl} className="w-full h-96" />
        ) : (
          <Image src={fileUrl} alt="Receipt preview" />
        ))}
      {file && fileUrl && (
        <button onClick={handleExtractFields}>Extract fields</button>
      )}
      {/* ^^ section for previewing file before field extraction  */}

      <div className="flex flex-col">
        <label htmlFor="receipt-file">Receipt file</label>
        <input
          id="receipt-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {/* TODO: loading state for fields being extracted */}
        {extractionStatus === "loading" && <p>Extracting fields...</p>}
        {(extractionStatus === "done" || true) && (
          <>
            <label htmlFor="date-purchased">Date purchased</label>
            <input
              id="date-purchased"
              type="date"
              value={form.datePurchased}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, datePurchased: e.target.value };
                });
              }}
            />
            <label htmlFor="supplier-name">Supplier name</label>
            <input
              id="supplier-name"
              type="text"
              value={form.supplierName}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, supplierName: e.target.value };
                });
              }}
            />
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              className="rounded-md bg-gray-500 p-2"
              type="number"
              value={form.amount}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, amount: e.target.value };
                });
              }}
            />
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={form.description}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, description: e.target.value };
                });
              }}
            />
            <label htmlFor="expense-type">Expense type</label>
            <input
              id="expense-type"
              value={form.expenseType}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, expenseType: e.target.value };
                });
              }}
            ></input>
            <label htmlFor="work-related-percentage">
              Work-related percentage
            </label>
            <input
              id="work-related-percentage"
              type="number"
              step="1"
              min="0"
              max="100"
              value={form.workRelatedPercentage}
              onChange={(e) => {
                setForm((prev) => {
                  return {
                    ...prev,
                    workRelatedPercentage: String(
                      Math.round(Number(e.target.value)),
                    ),
                  };
                });
              }}
            />
            <label htmlFor="work-related-amount">Work-related amount</label>
            <output
              id="amount work-related-amount"
              htmlFor="amount work-related-percentage"
            >
              {workRelatedAmount}
            </output>
            <label htmlFor="nexus-to-job">Nexus to job</label>
            <input
              id="nexus-to-job"
              type="text"
              value={form.nexusToJob}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, nexusToJob: e.target.value };
                });
              }}
            />
            <label htmlFor="date-record-created">Date record created</label>
            <input
              id="date-record-created"
              type="date"
              value={form.dateRecordCreated}
              onChange={(e) => {
                setForm((prev) => {
                  return { ...prev, dateRecordCreated: e.target.value };
                });
              }}
            />
            <button onClick={handleUpload}>Upload</button>
          </>
        )}
      </div>
    </div>
  );

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("workRelatedAmount", workRelatedAmount);

    (Object.keys(form) as (keyof ReceiptFormState)[]).forEach((key) => {
      formData.append(key, form[key]);
    });

    await fetch("api/upload", { method: "POST", body: formData });
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
    console.log("dataResponse: ", data);
    setForm((prev) => ({ ...prev, ...data.fields }));
    setExtractionStatus("done");
  }
}
