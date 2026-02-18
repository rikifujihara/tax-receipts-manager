"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="flex flex-col p-3">
      <h1 className="text-3xl font-medium">Upload Tax Receipt</h1>
      <div className="flex flex-col">
        <label htmlFor="receipt-file-selector">Select File</label>
        <input
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          type="file"
        />
        <label htmlFor="receipt-amount">Amount</label>
        <input
          id="receipt-amount"
          className="rounded-md bg-gray-500 p-2"
          type="text"
        ></input>
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    await fetch("api/upload", { method: "POST", body: formData });
  }
}
