import type { ChartPoint } from "../components/charts";
import { formatJalaliPeriod } from "../components/charts";
import type { ChatResponse } from "../types/api";
import type { SuggestedChart } from "../types/chat";

export const AVERAGE_SCORE_BY_DATE_PROMPT =
  "نمرات دوره فعلی رو به تفکیک تاریخ برام میانگین بگیر.";

const DATE_COLUMN = "تاریخ_دوره";
const AVERAGE_SCORE_COLUMN = "میانگین_نمره_دوره_فعلی";

function normalizePrompt(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[.؟?]+$/g, "");
}

function isSamePrompt(first: string, second: string) {
  return normalizePrompt(first) === normalizePrompt(second);
}

function toFiniteNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function buildAverageScoreByDateChart(
  response: ChatResponse,
): SuggestedChart | undefined {
  const table = response.table;

  if (!table) {
    return undefined;
  }

  const hasRequiredColumns =
    table.columns.includes(DATE_COLUMN) &&
    table.columns.includes(AVERAGE_SCORE_COLUMN);

  if (!hasRequiredColumns) {
    return undefined;
  }

  const data = table.rows.reduce<ChartPoint[]>((points, row) => {
    const rawDate = row[DATE_COLUMN];
    const score = toFiniteNumber(row[AVERAGE_SCORE_COLUMN]);

    if (
      rawDate === null ||
      rawDate === undefined ||
      rawDate === "" ||
      score === null
    ) {
      return points;
    }

    points.push({
      label: formatJalaliPeriod(String(rawDate)),
      value: Number(score.toFixed(2)),
    });

    return points;
  }, []);

  if (!data.length) {
    return undefined;
  }

  return {
    type: "line",
    title: "روند میانگین نمره دوره فعلی",
    description: "نمایش میانگین نمرات دوره فعلی به تفکیک تاریخ دوره",
    data,
    seriesName: "میانگین نمره دوره فعلی",
    unit: "امتیاز",
    height: 360,
  };
}

export function buildChartForPromptResponse(
  prompt: string,
  response: ChatResponse,
) {
  if (isSamePrompt(prompt, AVERAGE_SCORE_BY_DATE_PROMPT)) {
    return buildAverageScoreByDateChart(response);
  }

  return undefined;
}