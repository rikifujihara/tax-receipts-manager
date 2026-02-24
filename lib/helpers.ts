export const currentFinancialYear = () => {
  const month = Number(
    new Date().toLocaleDateString("en-AU", {
      timeZone: "Australia/Sydney",
      month: "numeric",
    }),
  );
  const year = Number(
    new Date().toLocaleDateString("en-AU", {
      timeZone: "Australia/Sydney",
      year: "numeric",
    }),
  );
  return `FY${month >= 7 ? String(year + 1) : year}`;
};
