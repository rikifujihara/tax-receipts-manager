import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const occupation = formData.get("occupation") as string;
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const ai = new GoogleGenAI({});
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
          {
            text: `Extract the following fields from this receipt as JSON only, no markdown.
            This is one receipt, so you will return this object below, once.
            The fields are going to be used for receipt record keeping for tax purposes.
            The receipt may have a connection to the purchaser's job of: ${occupation}
            Your response shape is as follows:
          {
            "datePurchased": "YYYY-MM-DD or null",
            "supplierName": "string or null",
            "amount": "number or null",
            "description": "string or null",
            "connection to work": "string or null - keep this short, simple and direct"
          }`,
          },
        ],
      },
    ],
  });
  const text = response.text ?? "{}";
  const clean = text.replace(/```json\n?|\n?```/g, "").trim();
  return NextResponse.json({ fields: JSON.parse(clean) });
}
