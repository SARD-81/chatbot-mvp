import type { ChartPoint } from "../components/charts";
import { formatJalaliPeriod } from "../components/charts";
import type { ChatResponse } from "../types/api";
import type { SuggestedChart } from "../types/chat";

export const AVERAGE_SCORE_BY_DATE_PROMPT =
  "نمرات دوره فعلی رو به تفکیک تاریخ برام میانگین بگیر.";

export const TOP_GROWTH_BY_RANK_PROMPT =
  "میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن و ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.";

const DATE_COLUMN = "تاریخ_دوره";
const AVERAGE_SCORE_COLUMN = "میانگین_نمره_دوره_فعلی";

const RANK_COLUMN = "رده";
const AVERAGE_GROWTH_COLUMN = "میانگین_رشد";

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

function normalizeChartLabel(value: unknown) {
  return String(value).trim().replace(/\s+/g, " ");
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

function buildTopGrowthByRankChart(
  response: ChatResponse,
): SuggestedChart | undefined {
  const table = response.table;

  if (!table) {
    return undefined;
  }

  const hasRequiredColumns =
    table.columns.includes(RANK_COLUMN) &&
    table.columns.includes(AVERAGE_GROWTH_COLUMN);

  if (!hasRequiredColumns) {
    return undefined;
  }

  const data = table.rows.reduce<ChartPoint[]>((points, row) => {
    const rank = row[RANK_COLUMN];
    const growth = toFiniteNumber(row[AVERAGE_GROWTH_COLUMN]);

    if (
      rank === null ||
      rank === undefined ||
      rank === "" ||
      growth === null
    ) {
      return points;
    }

    points.push({
      label: normalizeChartLabel(rank),
      value: Number(growth.toFixed(2)),
    });

    return points;
  }, []);

  if (!data.length) {
    return undefined;
  }

  return {
    type: "bar",
    title: "۱۰ رده با بیشترین میانگین رشد",
    description: "مقایسه میانگین رشد نمره نهایی دوره فعلی نسبت به دوره قبل",
    data: [...data].reverse(),
    seriesName: "میانگین رشد",
    unit: "امتیاز",
    height: 460,
  };
}

export function buildChartForPromptResponse(
  prompt: string,
  response: ChatResponse,
) {
  if (isSamePrompt(prompt, AVERAGE_SCORE_BY_DATE_PROMPT)) {
    return buildAverageScoreByDateChart(response);
  }

  if (isSamePrompt(prompt, TOP_GROWTH_BY_RANK_PROMPT)) {
    return buildTopGrowthByRankChart(response);
  }

  return undefined;
}