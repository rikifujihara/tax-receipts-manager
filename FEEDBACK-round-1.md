# Code Review Feedback

This review covers the current state of the repo as of the `feat/upload-receipt` branch.
The goal is to help you identify what to fix before writing tests, and what patterns to carry forward.

---

## What's Been Done Well

**Single source of truth for column names**
The `SHEET_COLUMNS` constant in `lib/constants.ts` is the best design decision in the codebase. Deriving `FORM_STATE_FIELDS` from it via destructuring, and building `ReceiptFormState` and `ColumnKey` types from it in `types.ts`, means there is genuinely one place to change when a column is added or renamed. This is exactly the kind of thinking that separates maintainable code from fragile code.

**Clean layer separation: routes → services → repository**
Route handlers are thin — they call one service function and return a response. Services hold business logic. The repository holds DB queries. This is the right shape for this kind of app, and it makes individual layers easy to reason about in isolation.

**Custom hook extraction**
Pulling all state and handlers into `useRecordReceipt` leaves `page.tsx` clean and easy to read. The page is essentially a layout file now, which is exactly what it should be.

**Parameterized SQL queries**
`repository/auth.ts` uses `$1, $2, $3` placeholders throughout. No string interpolation into queries. This is the correct approach and prevents SQL injection.

**Object URL cleanup**
The `useEffect` in the hook properly calls `URL.revokeObjectURL` in its cleanup function. This is easy to get wrong and you've got it right.

**`drive.ts` functions accept clients as parameters**
`getOrCreateFolder` and `getOrCreateSheet` both take the `drive` client as an argument rather than creating it internally. This makes them the most testable functions in the codebase — you can pass a mock client directly.

**Test infrastructure is already in place**
`vitest.config.mts`, `test-setup.ts`, happy-dom, and `@testing-library/react` are all configured. The `afterEach` cleanup is correct. Nothing to set up before writing tests.

---

## Bugs

These are things that are actually broken, not just style issues.

### 1. `session_id` variable shadowing in `googleOAuthCallback` — `lib/services/auth.ts:38`

```typescript
let session_id = "";

if (session) {
  session_id = session.id;
} else {
  const session_id = crypto.randomUUID(); // ← declares a NEW const, shadows the outer let
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await insertSession(session_id, user_id, expires_at);
}

response.cookies.set({ value: session_id, ... }); // ← always ""  for new users
```

For a first-time user (no existing session), the `const session_id` inside the `else` block creates a **new variable** that shadows the outer `let`. The session IS correctly inserted into the database with the UUID, but the cookie is set to `""`. The user is redirected to `/` with a blank session cookie and cannot access the app. TypeScript won't catch this because both variables are valid in their respective scopes.

### 2. Spreadsheet column headers written incorrectly — `lib/services/drive.ts:59`

```typescript
requestBody: {
  values: [Object.keys(SHEET_COLUMN_NAMES)], // BUG
},
```

`SHEET_COLUMN_NAMES` is an array (it's `Object.values(SHEET_COLUMNS)`). Calling `Object.keys()` on an array returns the index strings: `["0", "1", "2", ...]`. When a new spreadsheet is created, its header row will contain numbers, not column names. The fix is `values: [SHEET_COLUMN_NAMES]`.

### 3. Silent failures on `handleUpload` and `handleExtractFields` — `app/_hooks/useRecordReceipt.ts`

Neither async function has a `try/catch`. If the server returns a 500, or the network fails, or `response.json()` throws, the status is still set to `"success"` and the user sees a success screen with potentially garbage data. At minimum, the error case needs to be handled and `extractionStatus`/`uploadStatus` set to `"error"`.

### 4. `currentFinancialYear` — potential NaN in month detection — `lib/helpers.ts:2-8`

```typescript
const month = Number(
  new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Sydney",
    month: "numeric",
    year: "numeric", // ← problematic
  }),
);
```

When both `month: "numeric"` and `year: "numeric"` are passed together, `toLocaleDateString` formats both fields. In the `en-AU` locale this typically outputs something like `"2/2026"`, and `Number("2/2026")` is `NaN`. The check `month >= 7` then evaluates to `false` for every month, so the function always returns the current calendar year — meaning receipts uploaded in July–December go into the wrong financial year folder. Verify this by logging the `month` value; it should be a plain integer like `2`, not a formatted string.

### 5. `workRelatedAmount` not displayed in `UploadSuccess` — `app/_components/UploadSuccess.tsx`

The component declares `workRelatedAmount: string` in its prop type, the parent passes it, but the value is never destructured and never rendered. The success summary iterates `form` keys, but `workRelatedAmount` is a derived value that isn't in `form`. This is an important ATO field that the user should see confirmed after saving.

---

## Priority 1 — Fix Before Writing Tests

These are the changes that will make the codebase significantly more testable. Unit tests against the current structure will either require complex mocking setups or won't be able to test meaningful behaviour.

### 1. Extract API call functions out of `useRecordReceipt`

The `fetch("api/upload", ...)` and `fetch("api/file/extract-fields", ...)` calls are embedded directly in the hook. To test `useRecordReceipt` with RTL, you'd have to mock `global.fetch`, which is messy and couples your tests to implementation details.

Extract the API calls into separate functions, e.g. in a `lib/api-client.ts` file:

```typescript
export async function extractFieldsRequest(file: File, occupation: string) { ... }
export async function uploadReceiptRequest(file: File, form: ReceiptFormState, workRelatedAmount: string) { ... }
```

The hook then calls these functions. In tests, you mock these functions directly (e.g. `vi.mock('@/lib/api-client')`). This is a much cleaner seam.

### 2. `middleware.ts` must be named `middleware.ts` — `proxy.ts`

Next.js only executes middleware from a file named `middleware.ts` (or `middleware.js`) at the project root or `src/`. The file is currently named `proxy.ts`. If this is the case in your running environment, the authentication middleware is **not executing at all** — every route is unprotected. Rename the file to `middleware.ts`.

### 3. Make `currentFinancialYear` accept an optional date parameter — `lib/helpers.ts`

```typescript
// Current — untestable with specific dates
export const currentFinancialYear = () => { ... }

// Better — injectable date for testing
export const currentFinancialYear = (now = new Date()) => { ... }
```

With the current implementation, testing "should return FY2026 for a date in August 2025" requires mocking `Date` globally. Accepting a `date` argument makes the function a pure function that's trivial to test.

### 4. `saveRecord` manually re-extracts form fields, breaking the single source of truth — `lib/services/file-upload.ts:15-23`

After all the work done with `SHEET_COLUMNS` and `FORM_STATE_FIELDS`, the `saveRecord` function manually re-extracts every field by name from FormData:

```typescript
const datePurchased = formData.get("datePurchased") as string;
const supplierName = formData.get("supplierName") as string;
// ... 8 more lines
```

And then builds the spreadsheet row as a positional array:

```typescript
values: [[datePurchased, supplierName, amount, description, ...]]
```

This means adding a new field requires changes in at least four places: `SHEET_COLUMNS`, `form.tsx`, `file-upload.ts` (two places — the extraction block and the values array), and `useRecordReceipt.ts`. The order of the values array also has to match the column order in the sheet, and nothing enforces that.

The better approach is to iterate `FORM_STATE_FIELDS` keys to extract values, and use `SHEET_COLUMN_NAMES` to build the row in the correct order. This keeps `file-upload.ts` in sync with the constants automatically.

---

## Priority 2 — Code Quality

These don't need to be done before writing tests, but are worth addressing before showing the codebase to interviewers.

### 1. `form.tsx` has near-identical `onChange` handlers for every field

Every input in `form.tsx` has the same pattern:

```typescript
onChange={(e) => {
  setForm((prev) => {
    return { ...prev, fieldName: e.target.value };
  });
}}
```

Repeated 7 times with only the field name changing. Extract a shared `handleChange` function:

```typescript
function handleChange(field: keyof ReceiptFormState) {
  return (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
}
```

Then each input becomes `onChange={handleChange("datePurchased")}`. The Tailwind className string is also identical on most inputs — a `FormField` wrapper component could encapsulate both the label and input, reducing `form.tsx` from ~220 lines to ~60.

### 2. Dead props on `FormStatus` and `UploadSuccess`

`FormStatus` has `uploadStatus: UploadStatus` in its prop type but neither destructures nor uses it. `UploadSuccess` has `workRelatedAmount: string` in its prop type but doesn't use it (also see the bug above). These should either be used or removed from the type.

### 3. `occupation` is a hardcoded string literal — `app/_hooks/useRecordReceipt.ts:82`

```typescript
formData.append("occupation", "software developer");
```

This string is buried inside a function call with no indication it's configurable. It should at minimum be a named constant in `lib/constants.ts`.

### 4. Inconsistent naming conventions in the repository layer

`lib/repository/auth.ts` uses `snake_case` for parameter names (`google_user_id`, `refresh_token`, `user_id`). The rest of the TypeScript codebase uses `camelCase`. Using snake_case to mirror DB column names is a reasonable convention, but it should be an intentional choice — pick one and be consistent, or leave a comment explaining why the repository uses snake_case.

### 5. `today` is calculated once at module load — `app/_hooks/useRecordReceipt.ts:11-13`

```typescript
const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Australia/Sydney",
});
```

This is computed when the module first loads. If the user keeps the tab open past midnight and resets the form, `dateRecordCreated` will show yesterday's date. Move this calculation inside `emptyForm()` or inside `resetState()` so it's always fresh.

### 6. Redundant `Number()` wrap — `app/_hooks/useRecordReceipt.ts:41`

```typescript
const workRelatedAmount = (
  Number(form.amount) * Number(Number(form.workRelatedPercentage) * 0.01)
).toFixed(2);
```

`Number(form.workRelatedPercentage) * 0.01` already produces a `number`. Wrapping that in another `Number()` call does nothing.

---

## Priority 3 — Low Priority Polish

### 1. Default Next.js metadata still in `layout.tsx`

`title: "Create Next App"` and `description: "Generated by create next app"` are scaffolding leftovers. Update these before sharing the portfolio.

### 2. Two separate `{file && fileUrl}` conditional blocks in `file-preview.tsx`

Lines 30–43 and 45–52 both gate on `{file && fileUrl}`. They can be merged into one block to reduce duplication.

### 3. `FormStatus` renders an empty outer div when nothing matches

When `extractionStatus` is `"success"`, the component renders `<div className="..."></div>` with nothing inside. The parent hides the component before this state anyway, but the component itself should return `null` for states it doesn't handle.

---

## Testability Summary

Before writing RTL tests, the refactors that will make the biggest difference are:

| What to do | Why |
|---|---|
| Extract API calls from `useRecordReceipt` into `lib/api-client.ts` | Clean mock seam for unit testing the hook |
| Accept date param in `currentFinancialYear` | Makes it a pure function — trivially unit testable |
| Fix `proxy.ts` → `middleware.ts` | Auth works in your actual app |
| Fix `session_id` variable shadowing | New user login works |
| Fix `drive.ts` header bug | Spreadsheet headers are correct |

The `drive.ts` helper functions (`getOrCreateFolder`, `getOrCreateSheet`) are already well-structured for testing because they accept the Drive client as a parameter. The `repository/auth.ts` functions are thin enough that mocking `pool` (via `vi.mock('@/lib/db')`) is straightforward.

For RTL unit tests, the most valuable tests to write are:
- `useRecordReceipt` — test that extraction success populates the form, that upload success transitions status
- `form.tsx` — test that `workRelatedAmount` display updates when amount/percentage change
- `currentFinancialYear` — test the boundary at July with injected dates

For Playwright E2E, the core flow is: login → select file → extract fields → review/edit form → save to Drive → see success screen.
