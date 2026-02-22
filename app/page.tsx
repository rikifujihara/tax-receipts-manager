"use client";

import { useEffect, useState } from "react";
import { SHEET_COLUMNS } from "@/lib/constants";
import Image from "next/image";
import {
  ColumnKey,
  ExtractedFieldsResponse,
  ReceiptFormState,
} from "@/lib/types";
import { ArrowUp, Check, Loader2 } from "lucide-react";
import FilePreview from "@/app/_components/file-preview";

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
    "loading" | "error" | "done" | "no-file" | "file-selected"
  >("no-file");

  const [uploadStatus, setUploadStatus] = useState<
    "loading" | "success" | "file-selected" | "error" | "no-file"
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

        {/* Form section */}
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
                Click &apos;Extract&apos; to analyse
              </p>
            </div>
          )}

          {extractionStatus === "loading" && (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <p className="text-blue-600 font-medium">Extracting fields...</p>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="flex items-center gap-2">
              <Check />
              <p className="text-gray-800 font-semibold">
                Success! Click &apos;Choose File&apos; upload another
              </p>
            </div>
          )}
          {/* TODO: extract fields */}
          {extractionStatus === "done" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="date-purchased"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Date purchased
                  </label>
                  <input
                    id="date-purchased"
                    type="date"
                    value={form.datePurchased}
                    onChange={(e) => {
                      setForm((prev) => {
                        return { ...prev, datePurchased: e.target.value };
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 appearance-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="supplier-name"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Supplier name
                  </label>
                  <input
                    id="supplier-name"
                    type="text"
                    value={form.supplierName}
                    onChange={(e) => {
                      setForm((prev) => {
                        return { ...prev, supplierName: e.target.value };
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={form.amount}
                    onChange={(e) => {
                      setForm((prev) => {
                        return { ...prev, amount: e.target.value };
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="expense-type"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Expense type
                  </label>
                  <input
                    id="expense-type"
                    value={form.expenseType}
                    onChange={(e) => {
                      setForm((prev) => {
                        return { ...prev, expenseType: e.target.value };
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={form.description}
                  onChange={(e) => {
                    setForm((prev) => {
                      return { ...prev, description: e.target.value };
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="work-related-percentage"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="work-related-amount"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Work-related amount
                  </label>
                  <output
                    id="work-related-amount"
                    htmlFor="amount work-related-percentage"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-semibold block"
                  >
                    {workRelatedAmount}
                  </output>
                </div>
              </div>

              <div>
                <label
                  htmlFor="nexus-to-job"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nexus to job
                </label>
                <input
                  id="nexus-to-job"
                  type="text"
                  value={form.nexusToJob}
                  onChange={(e) => {
                    setForm((prev) => {
                      return { ...prev, nexusToJob: e.target.value };
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="date-record-created"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Date record created
                </label>
                <input
                  id="date-record-created"
                  type="date"
                  value={form.dateRecordCreated}
                  onChange={(e) => {
                    setForm((prev) => {
                      return { ...prev, dateRecordCreated: e.target.value };
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 appearance-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === "loading"}
                  className={`flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 md:w-auto ${uploadStatus === "loading" && "bg-gray-400 hover:bg-gray-400"}`}
                >
                  {uploadStatus === "loading" && (
                    <Loader2 className="animate-spin text-white" size={20} />
                  )}
                  Save to Drive
                </button>
              </div>
            </div>
          )}
          {/* TODO: add upload success summary */}
        </div>
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
    console.log("dataResponse: ", data);
    setForm((prev) => ({ ...prev, ...data.fields }));
    setExtractionStatus("done");
  }
}
