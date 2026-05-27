export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits,
  }).format(value);
}

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function formatPercent(value: number) {
  return `${formatNumber(value, 1)}٪`;
}

export function formatJalaliPeriod(value: number | string) {
  const raw = String(value).replace(/\D/g, "");

  if (raw.length !== 8) return toPersianDigits(String(value));

  return toPersianDigits(`${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)}`);
}