import { GoogleGenAI } from "@google/genai";

// TODO: future feature - application allows user to configure their occupation
// e.g. The receipt may have a connection to the purchaser's job of: ${occupation}
export async function extractFields(file: File, occupation: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = resolveMimeType(file);

  const ai = new GoogleGenAI({});
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64,
            },
          },
          {
            text: `Extract the following fields from this receipt as JSON only, no markdown.
            This is one receipt, so you will return this object below, once.
            The fields are going to be used for receipt record keeping for tax purposes.
            Your response shape is as follows:
          {
            "datePurchased": "YYYY-MM-DD or ''",
            "expenseType": "The categorisation of this expense according to the ATO standards (e.g. donation, work related self education)",
            "supplierName": "string or ''",
            "amount": "number or ''",
            "description": "string or ''",
            "nexusToJob": "string or '' - keep this short, simple and direct"
          }`,
          },
        ],
      },
    ],
  });
  const text = response.text ?? "{}";
  const clean = text.replace(/```json\n?|\n?```/g, "").trim();
  return { fields: JSON.parse(clean) };
}

function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  return map[ext ?? ""] ?? "image/jpeg";
}
