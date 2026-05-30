import type {
    ChartPoint,
    PieChartPoint,
    ScatterChartPoint,
  } from "../components/charts";
import { formatJalaliPeriod } from "../components/charts";
import type { ChatResponse } from "../types/api";
import type { SuggestedChart } from "../types/chat";

export const AVERAGE_SCORE_BY_DATE_PROMPT =
  "نمرات دوره فعلی رو به تفکیک تاریخ برام میانگین بگیر.";

export const TOP_GROWTH_BY_RANK_PROMPT =
  "میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن و ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.";

  export const RANK_SCORE_COMPARISON_SCATTER_PROMPT =
  "میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن. میانگین رشد هر رده و میانگین نمره نظارتشون رو هم حساب کن و در نهایت فقط ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.";

  export const PERFORMANCE_STATUS_DISTRIBUTION_PROMPT =
  "بر اساس وضعیت عملکرد، توزیع رده‌های ما چطوریه؟ تعداد و درصدِ سهم هر وضعیت از کل رو بهم نشون بده.";

const DATE_COLUMN = "تاریخ_دوره";
const AVERAGE_SCORE_COLUMN = "میانگین_نمره_دوره_فعلی";

const RANK_COLUMN = "رده";
const AVERAGE_GROWTH_COLUMN = "میانگین_رشد";

const PREVIOUS_SCORE_COLUMN = "میانگین_نمره_قبل";
const CURRENT_SCORE_COLUMN = "میانگین_نمره_فعلی";
const SUPERVISION_SCORE_COLUMN = "میانگین_نظارت";
const MEDIAN_GROWTH_COLUMN = "رشد_میانی";

const PERFORMANCE_STATUS_COLUMN = "وضعیت_عملکرد";
const COUNT_COLUMN = "تعداد";
const PERCENT_OF_TOTAL_COLUMN = "درصد_از_کل";

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

function getPerformanceStatusColor(status: string) {
    const normalizedStatus = normalizeChartLabel(status);
  
    if (
      normalizedStatus.includes("سبز") ||
      normalizedStatus.includes("مطلوب")
    ) {
      return "#16a34a";
    }
  
    if (
      normalizedStatus.includes("زرد") ||
      normalizedStatus.includes("نیاز به بهبود")
    ) {
      return "#f59e0b";
    }
  
    if (
      normalizedStatus.includes("قرمز") ||
      normalizedStatus.includes("بحرانی")
    ) {
      return "#dc2626";
    }
  
    if (normalizedStatus.includes("نامشخص")) {
      return "#94a3b8";
    }
  
    return "#64748b";
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

  const topGrowthData = [...data]
    .sort((firstItem, secondItem) => secondItem.growth - firstItem.growth)
    .slice(0, 10);

  return {
    type: "scatter",
    title: "مقایسه نمره قبل و فعلی برای ۱۰ رده با بیشترین رشد",
    description:
      "محور افقی میانگین نمره قبل و محور عمودی میانگین نمره فعلی است؛ اندازه هر نقطه بر اساس رشد میانی همان رده تعیین می‌شود.",
    data: topGrowthData,
    xAxisName: "میانگین نمره قبل",
    yAxisName: "میانگین نمره فعلی",
    unit: "امتیاز",
    height: 540,
  };
}

function buildPerformanceStatusDistributionPieChart(
    response: ChatResponse,
  ): SuggestedChart | undefined {
    const table = response.table;
  
    if (!table) {
      return undefined;
    }
  
    const hasRequiredColumns =
      table.columns.includes(PERFORMANCE_STATUS_COLUMN) &&
      table.columns.includes(COUNT_COLUMN) &&
      table.columns.includes(PERCENT_OF_TOTAL_COLUMN);
  
    if (!hasRequiredColumns) {
      return undefined;
    }
  
    const data = table.rows.reduce<PieChartPoint[]>((items, row) => {
      const rawStatus = row[PERFORMANCE_STATUS_COLUMN];
      const count = toFiniteNumber(row[COUNT_COLUMN]);
      const percent = toFiniteNumber(row[PERCENT_OF_TOTAL_COLUMN]);
  
      if (
        rawStatus === null ||
        rawStatus === undefined ||
        rawStatus === "" ||
        count === null ||
        percent === null
      ) {
        return items;
      }
  
      const status = normalizeChartLabel(rawStatus);
  
      items.push({
        name: status,
        value: Number(count.toFixed(0)),
        percent: Number(percent.toFixed(2)),
        itemStyle: {
          color: getPerformanceStatusColor(status),
        },
      });
  
      return items;
    }, []);
  
    if (!data.length) {
      return undefined;
    }
  
    return {
      type: "pie",
      title: "توزیع وضعیت عملکرد",
      description: "نمایش تعداد و درصد سهم هر وضعیت عملکرد از کل",
      data,
      unit: "مورد",
      height: 420,
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

  if (isSamePrompt(prompt, PERFORMANCE_STATUS_DISTRIBUTION_PROMPT)) {
    return buildPerformanceStatusDistributionPieChart(response);
  }

  return undefined;
}