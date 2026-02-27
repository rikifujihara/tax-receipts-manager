# ATO Tax Record Tool

**Stack:** Next.js · TypeScript · Google Gemini · Google Sheets/Drive · PostgreSQL · Tailwind CSS

## Pain point
As an employee with deductible expenses, the ATO requires records of transactions with details like date, supplier, work-related percentage, and nexus to job. Doing this manually meant entering data into Google Sheets and uploading files to Drive by hand.

## Solution
Upload a receipt image, and the app uses Gemini to extract the required fields, stores the file in Google Drive, and appends a linked record to Google Sheets.

## Demo

https://github.com/user-attachments/assets/9d691aa5-7a51-4305-9fcb-5cc22b2d3004


## Challenges/Learnings

**Knowledge leak — field names**

Field names needed to stay consistent across the frontend form, API validation, and Google Sheets columns. A mismatch anywhere would cause silent errors or broken records.

I created a single `SHEET_COLUMNS` constant that all types and field references derive from, so there's one place to change and TypeScript catches anything that falls out of sync.

```typescript
export const SHEET_COLUMNS = {
  datePurchased: "Date purchased",
  supplierName: "Supplier name",
  amount: "Amount",
  // ...
} as const;
```

**Service/route separation**

Early on, business logic was mixed into route handlers. I refactored to isolate services (AI extraction, Drive upload, Sheets write) from routes, and wrapped routes in an error-handling HOF to avoid repetitive try/catch.

**Debugging mobile-only failures with Safari Web Inspector**

The extract-fields feature worked fine on desktop and on the local dev server tunnelled via ngrok on iPhone, but failed silently on the production (Vercel) deployment when uploading photos from an iPhone. Vercel logs showed no errors, suggesting the failure was happening before the request even reached the server.

To get visibility into what was happening in iPhone Safari, I used Safari's Web Inspector.

This exposed the network request failing with a 413 (payload too large). The root cause: iOS photos and screenshots exceed Vercel's **4.5MB serverless function request body limit**. The same tunneled requests succeeded locally because there's no equivalent limit on the local dev server.

I decided the quickest fix would be to use an image compression library to compress files before sending them to the backend.