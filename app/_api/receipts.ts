import { ExtractedFieldsResponse, ReceiptFormState } from "@/lib/types";

export function uploadReceipt({
  file,
  form,
  workRelatedAmount,
}: {
  file: File;
  form: ReceiptFormState;
  workRelatedAmount: string;
}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workRelatedAmount", workRelatedAmount);

  (Object.keys(form) as (keyof ReceiptFormState)[]).forEach((key) => {
    formData.append(key, form[key]);
  });

  return fetch("api/upload", { method: "POST", body: formData });
}

export async function extractFields({ file }: { file: File }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("occupation", "software developer");

  const response = await fetch("api/file/extract-fields", {
    method: "POST",
    body: formData,
  });

  return (await response.json()) as ExtractedFieldsResponse;
}
