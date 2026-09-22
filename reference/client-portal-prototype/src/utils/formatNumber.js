export function formatDecimal(value, format = "indian", options = {}) {
  const amount = Number(value);
  const locale = format === "international" ? "en-US" : "en-IN";
  const fractionDigits = options.fractionDigits ?? 2;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);
}
