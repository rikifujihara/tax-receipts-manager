# ATO Tax Record Tool

**Stack:** Next.js · TypeScript · Google Gemini · Google Sheets/Drive · PostgreSQL · Tailwind CSS

## Pain point
As an employee with deductible expenses, the ATO requires records of transactions with details like date, supplier, work-related percentage, and nexus to job. Doing this manually meant entering data into Google Sheets and uploading files to Drive by hand.

## Solution
Upload a receipt image, and the app uses Gemini to extract the required fields, stores the file in Google Drive, and appends a linked record to Google Sheets.

## Demo
<video autoplay loop muted playsinline>
  <source src="demo.mp4" type="video/mp4">
</video>


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
