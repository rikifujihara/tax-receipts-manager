"use client";

import { useEffect, useState } from "react";
import { EXPENSE_TYPES } from "@/lib/constants";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [datePurchased, setDatePurchased] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [workRelatedPercentage, setWorkRelatedPercentage] = useState("");
  const [workRelatedAmount, setWorkRelatedAmount] = useState("");
  const [nexusToJob, setNexusToJob] = useState("");
  const [dateRecordCreated, setDateRecordCreated] = useState("");

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

      <div className="flex flex-col">
        <label htmlFor="receipt-file">Receipt file</label>
        <input
          id="receipt-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {/* TODO: loading state for fields being extracted */}
        {file?.name && (
          <>
            <label htmlFor="date-purchased">Date purchased</label>
            <input
              id="date-purchased"
              type="date"
              value={datePurchased}
              onChange={(e) => setDatePurchased(e.target.value)}
            />
            <label htmlFor="supplier-name">Supplier name</label>
            <input
              id="supplier-name"
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              className="rounded-md bg-gray-500 p-2"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label htmlFor="expense-type">Expense type</label>
            <select
              id="expense-type"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
            >
              <option value="">Select...</option>
              {EXPENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <label htmlFor="work-related-percentage">
              Work-related percentage
            </label>
            <input
              id="work-related-percentage"
              type="number"
              value={workRelatedPercentage}
              onChange={(e) => setWorkRelatedPercentage(e.target.value)}
            />
            <label htmlFor="work-related-amount">Work-related amount</label>
            <input
              id="work-related-amount"
              type="number"
              value={workRelatedAmount}
              onChange={(e) => setWorkRelatedAmount(e.target.value)}
            />
            <label htmlFor="nexus-to-job">Nexus to job</label>
            <input
              id="nexus-to-job"
              type="text"
              value={nexusToJob}
              onChange={(e) => setNexusToJob(e.target.value)}
            />
            <label htmlFor="date-record-created">Date record created</label>
            <input
              id="date-record-created"
              type="date"
              value={dateRecordCreated}
              onChange={(e) => setDateRecordCreated(e.target.value)}
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
    formData.append("file", file);
    formData.append("datePurchased", datePurchased);
    formData.append("supplierName", supplierName);
    formData.append("amount", amount);
    formData.append("description", description);
    formData.append("expenseType", expenseType);
    formData.append("workRelatedPercentage", workRelatedPercentage);
    formData.append("workRelatedAmount", workRelatedAmount);
    formData.append("nexusToJob", nexusToJob);
    formData.append("dateRecordCreated", dateRecordCreated);

    await fetch("api/upload", { method: "POST", body: formData });
  }

  async function handleExtractFields() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("occupation", "software developer");

    await fetch("api/file/extract-fields", { method: "POST", body: formData });
  }
}
