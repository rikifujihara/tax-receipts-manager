import { ReceiptFormState, SetState, UploadStatus } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Form({
  form,
  setForm,
  workRelatedAmount,
  uploadStatus,
  handleUpload,
}: {
  form: ReceiptFormState;
  setForm: SetState<ReceiptFormState>;
  workRelatedAmount: string;
  uploadStatus: UploadStatus;
  handleUpload: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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
    </div>
  );
}
