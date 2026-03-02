import { ReceiptFormState } from "@/lib/types";

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
