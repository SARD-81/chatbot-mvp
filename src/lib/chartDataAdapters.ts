import type { ChartPoint } from "@/components/charts";
import { formatJalaliPeriod } from "@/components/charts";

type TableCell = string | number | boolean | null | undefined;

type ChatTableRow = Record<string, TableCell>;

export type ChatTable = {
  columns?: string[];
  rows?: ChatTableRow[];
};

function normalizeColumnName(value: string) {
  return value.trim().replace(/\s+/g, "_");
}

function findColumn(columns: string[], candidates: string[]) {
  const normalizedColumns = columns.map((column) => ({
    original: column,
    normalized: normalizeColumnName(column),
  }));

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeColumnName(candidate);

    const match = normalizedColumns.find(
      (column) => column.normalized === normalizedCandidate
    );

    if (match) return match.original;
  }

  return undefined;
}

function toNumber(value: TableCell) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const normalized = value
      .replace(/,/g, "")
      .replace(/٬/g, "")
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatChartLabel(value: TableCell) {
  const raw = String(value ?? "");

  const formatted = formatJalaliPeriod(raw);

  // خروجی مثل ۱۴۰۲/۰۴/۰۱ را به ۱۴۰۲/۰۴ تبدیل می‌کند
  if (formatted.length >= 7) {
    return formatted.slice(0, 7);
  }

  return formatted;
}

export function chatTableToLineChartPoints(table?: ChatTable): ChartPoint[] {
  if (!table?.rows?.length) return [];

  const firstRow = table.rows[0] ?? {};
  const columns =
    table.columns && table.columns.length > 0
      ? table.columns
      : Object.keys(firstRow);

  if (columns.length < 2) return [];

  const dateColumn =
    findColumn(columns, [
      "تاریخ_دوره",
      "تاریخ دوره",
      "period_date",
      "date",
      "period",
    ]) ?? columns[0];

  const valueColumn =
    findColumn(columns, [
      "میانگین_نمره_دوره_فعلی",
      "میانگین نمره دوره فعلی",
      "average_score",
      "avg_score",
      "score",
      "value",
    ]) ?? columns[1];

  return table.rows
    .map((row) => ({
      label: formatChartLabel(row[dateColumn]),
      value: Number(toNumber(row[valueColumn]).toFixed(2)),
    }))
    .filter((item) => item.label && Number.isFinite(item.value));
}