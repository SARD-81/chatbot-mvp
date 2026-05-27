import type { ChartPoint, ScatterChartPoint } from "../components/charts";
import { formatJalaliPeriod } from "../components/charts";
import type { ChatResponse } from "../types/api";
import type { SuggestedChart } from "../types/chat";

export const AVERAGE_SCORE_BY_DATE_PROMPT =
  "نمرات دوره فعلی رو به تفکیک تاریخ برام میانگین بگیر.";

export const TOP_GROWTH_BY_RANK_PROMPT =
  "میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن و ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.";

export const RANK_SCORE_COMPARISON_SCATTER_PROMPT =
  "مقایسه نمره نهایی دوره قبل و فعلی به تفکیک رده رو بهم بده؛ می‌خوام میانگین رشد هر رده و میانگین نمره نظارتشون رو هم کنارش ببینم.";

const DATE_COLUMN = "تاریخ_دوره";
const AVERAGE_SCORE_COLUMN = "میانگین_نمره_دوره_فعلی";

const RANK_COLUMN = "رده";
const AVERAGE_GROWTH_COLUMN = "میانگین_رشد";

const PREVIOUS_SCORE_COLUMN = "میانگین_نمره_قبل";
const CURRENT_SCORE_COLUMN = "میانگین_نمره_فعلی";
const SUPERVISION_SCORE_COLUMN = "میانگین_نظارت";
const MEDIAN_GROWTH_COLUMN = "رشد_میانی";

function normalizePrompt(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[.؛;؟?]+$/g, "");
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
    data,
    seriesName: "میانگین رشد",
    unit: "امتیاز",
    height: 420,
  };
}

function buildRankScoreComparisonScatterChart(
  response: ChatResponse,
): SuggestedChart | undefined {
  const table = response.table;

  if (!table) {
    return undefined;
  }

  const hasRequiredColumns =
    table.columns.includes(RANK_COLUMN) &&
    table.columns.includes(PREVIOUS_SCORE_COLUMN) &&
    table.columns.includes(CURRENT_SCORE_COLUMN) &&
    table.columns.includes(SUPERVISION_SCORE_COLUMN) &&
    table.columns.includes(MEDIAN_GROWTH_COLUMN);

  if (!hasRequiredColumns) {
    return undefined;
  }

  const data = table.rows.reduce<ScatterChartPoint[]>((points, row) => {
    const rank = row[RANK_COLUMN];
    const previousScore = toFiniteNumber(row[PREVIOUS_SCORE_COLUMN]);
    const currentScore = toFiniteNumber(row[CURRENT_SCORE_COLUMN]);
    const supervisionScore = toFiniteNumber(row[SUPERVISION_SCORE_COLUMN]);
    const growth = toFiniteNumber(row[MEDIAN_GROWTH_COLUMN]);

    if (
      rank === null ||
      rank === undefined ||
      rank === "" ||
      previousScore === null ||
      currentScore === null ||
      supervisionScore === null ||
      growth === null
    ) {
      return points;
    }

    points.push({
      rank: normalizeChartLabel(rank),
      previousScore: Number(previousScore.toFixed(2)),
      currentScore: Number(currentScore.toFixed(2)),
      supervisionScore: Number(supervisionScore.toFixed(2)),
      growth: Number(growth.toFixed(2)),
    });

    return points;
  }, []);

  if (!data.length) {
    return undefined;
  }

  return {
    type: "scatter",
    title: "مقایسه نمره قبل و فعلی به تفکیک رده",
    description:
      "محور افقی میانگین نمره قبل و محور عمودی میانگین نمره فعلی است؛ جزئیات هر رده با حرکت روی نقطه نمایش داده می‌شود.",
    data,
    xAxisName: "میانگین نمره قبل",
    yAxisName: "میانگین نمره فعلی",
    unit: "امتیاز",
    height: 540,
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

  if (isSamePrompt(prompt, RANK_SCORE_COMPARISON_SCATTER_PROMPT)) {
    return buildRankScoreComparisonScatterChart(response);
  }

  return undefined;
}