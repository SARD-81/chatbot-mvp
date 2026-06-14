import { useMemo } from "react";
import type {
  EChartsOption,
  TooltipComponentFormatterCallbackParams,
} from "echarts";
import { BaseChart } from "./BaseChart";
import { useEnterpriseChartPalette, enterpriseTooltipCss } from "./chartTheme";
import { formatNumber } from "./chartFormatters";
import type { EnterpriseChartProps, ScatterChartPoint } from "./types";

type EnterpriseScatterChartProps = EnterpriseChartProps & {
  data: ScatterChartPoint[];
  xAxisName?: string;
  yAxisName?: string;
  unit?: string;
};

/**
 * Series item layout:
 * index 0 → previousScore  (x axis)
 * index 1 → currentScore   (y axis)
 * index 2 → supervisionScore
 * index 3 → growth         (bubble size)
 * index 4 → rank           (label)
 * index 5 → rawRow         (original object — all fields for tooltip)
 */
type ScatterSeriesItem = [
  previousScore: number,
  currentScore: number,
  supervisionScore: number,
  growth: number,
  rank: string,
  rawRow: Record<string, unknown>,
];

function getTooltipParam(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params[0] : params;
}

/** Render a number nicely — keep strings as-is */
function renderValue(val: unknown): string {
  if (typeof val === "number" && Number.isFinite(val)) {
    return formatNumber(val, 2);
  }
  return String(val ?? "");
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLabel(label: string): string {
  return label.replace(/_/g, " ").trim();
}

function hasUsableRawRow(
  rawRow: Record<string, unknown> | undefined,
): rawRow is Record<string, unknown> {
  return Boolean(rawRow && Object.keys(rawRow).length > 0);
}

function formatTooltip(params: TooltipComponentFormatterCallbackParams) {
  const item = getTooltipParam(params);
  const data = item.data as ScatterSeriesItem | undefined;

  if (!data) return "";

  const rank = data[4];
  const rawRow = data[5] as Record<string, unknown> | undefined;

  const rows: Array<{ label: string; value: string }> = hasUsableRawRow(rawRow)
    ? Object.entries(rawRow)
        .filter(([, value]) => value !== null && value !== undefined && value !== "")
        .map(([key, value]) => ({
          label: renderLabel(key),
          value: renderValue(value),
        }))
    : [
        { label: "میانگین نمره قبل", value: formatNumber(data[0], 2) },
        { label: "میانگین نمره فعلی", value: formatNumber(data[1], 2) },
        { label: "میانگین نظارت", value: formatNumber(data[2], 2) },
        { label: "میانگین رشد", value: formatNumber(data[3], 2) },
      ];

  const rowsHtml = rows
    .map(
      ({ label, value }) =>
        `<div style="display:flex;align-items:center;justify-content:space-between;gap:22px;margin-top:7px;line-height:1.7">
          <span style="color:#64748b;font-weight:700;white-space:nowrap">${escapeHtml(label)}</span>
          <strong style="color:#0f172a;font-weight:900;text-align:left;direction:ltr">${escapeHtml(value)}</strong>
        </div>`,
    )
    .join("");

  return `<div style="min-width:280px;max-width:380px;direction:rtl;text-align:right;padding:2px">
    <div style="font-weight:900;color:#0f172a;margin-bottom:10px;line-height:1.8;border-bottom:1px solid rgba(148,163,184,0.24);padding-bottom:8px">
      ${escapeHtml(rank)}
    </div>
    ${rowsHtml}
  </div>`;
}

const MIN_SCATTER_SYMBOL_SIZE = 7;
const MAX_SCATTER_SYMBOL_SIZE = 54;

function getGrowthFromSeriesValue(value: unknown) {
  if (!Array.isArray(value)) return null;
  const growth = Number(value[3]);
  return Number.isFinite(growth) ? growth : null;
}

function createScatterSymbolSizeFormatter(
  minGrowth: number,
  maxGrowth: number,
) {
  return (value: unknown) => {
    const growth = getGrowthFromSeriesValue(value);

    if (growth === null) return MIN_SCATTER_SYMBOL_SIZE;

    if (maxGrowth === minGrowth) {
      return (MIN_SCATTER_SYMBOL_SIZE + MAX_SCATTER_SYMBOL_SIZE) / 2;
    }

    const normalizedGrowth = Math.max(
      0,
      Math.min(1, (growth - minGrowth) / (maxGrowth - minGrowth)),
    );

    const visuallyBoostedGrowth = Math.sqrt(normalizedGrowth);

    return Math.round(
      MIN_SCATTER_SYMBOL_SIZE +
        visuallyBoostedGrowth *
          (MAX_SCATTER_SYMBOL_SIZE - MIN_SCATTER_SYMBOL_SIZE),
    );
  };
}

export function EnterpriseScatterChart({
  data,
  title = "مقایسه نمره قبل و فعلی",
  description = "هر نقطه نشان‌دهنده یک رده است",
  xAxisName = "میانگین نمره قبل",
  yAxisName = "میانگین نمره فعلی",
  height = 520,
  loading,
  className,
}: EnterpriseScatterChartProps) {
  const palette = useEnterpriseChartPalette();

  const seriesData = useMemo<ScatterSeriesItem[]>(
    () =>
      data.map((item) => [
        item.previousScore,
        item.currentScore,
        item.supervisionScore,
        item.growth,
        item.rank,
        item.rawRow ?? {
          [xAxisName]: item.previousScore,
          [yAxisName]: item.currentScore,
          "میانگین نظارت": item.supervisionScore,
          "میانگین رشد": item.growth,
        },
      ]),
    [data, xAxisName, yAxisName],
  );

  const growthRange = useMemo(() => {
    const growthValues = seriesData
      .map((item) => item[3])
      .filter((growth) => Number.isFinite(growth));

    if (!growthValues.length) return { minGrowth: 0, maxGrowth: 0 };

    return {
      minGrowth: Math.min(...growthValues),
      maxGrowth: Math.max(...growthValues),
    };
  }, [seriesData]);

  const scatterSymbolSize = useMemo(
    () =>
      createScatterSymbolSizeFormatter(
        growthRange.minGrowth,
        growthRange.maxGrowth,
      ),
    [growthRange],
  );

  const option: EChartsOption = useMemo(
    () => ({
      color: [palette.primary],
      tooltip: {
        trigger: "item",
        confine: true,
        appendToBody: true,
        backgroundColor: palette.tooltipBg,
        borderColor: palette.border,
        borderWidth: 1,
        extraCssText: enterpriseTooltipCss(),
        textStyle: {
          color: palette.foreground,
          fontSize: 12,
        },
        formatter: formatTooltip,
      },
      grid: {
        top: 28,
        right: 28,
        bottom: 56,
        left: 44,
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: xAxisName,
        nameLocation: "middle",
        nameGap: 36,
        scale: true,
        axisLine: { lineStyle: { color: palette.border } },
        axisTick: { show: false },
        axisLabel: {
          color: palette.mutedForeground,
          fontSize: 11,
          formatter: (value: number) => formatNumber(value, 0),
        },
        splitLine: {
          lineStyle: { color: palette.grid, type: "dashed" },
        },
      },
      yAxis: {
        type: "value",
        name: yAxisName,
        nameLocation: "middle",
        nameGap: 46,
        scale: true,
        axisLine: { lineStyle: { color: palette.border } },
        axisTick: { show: false },
        axisLabel: {
          color: palette.mutedForeground,
          fontSize: 11,
          formatter: (value: number) => formatNumber(value, 0),
        },
        splitLine: {
          lineStyle: { color: palette.grid, type: "dashed" },
        },
      },
      series: [
        {
          name: "رده",
          type: "scatter",
          data: seriesData as unknown as number[][],
          symbolSize: scatterSymbolSize,
          emphasis: {
            focus: "self",
            scale: 1.45,
            itemStyle: {
              shadowBlur: 18,
              shadowColor: "rgba(15, 23, 42, 0.24)",
            },
          },
          itemStyle: {
            color: palette.primary,
            opacity: 0.78,
            borderColor: palette.card,
            borderWidth: 2,
          },
        },
      ],
    }),
    [palette, scatterSymbolSize, seriesData, xAxisName, yAxisName],
  );

  return (
    <BaseChart
      title={title}
      description={description}
      option={option}
      height={height}
      loading={loading}
      empty={!loading && data.length === 0}
      className={className}
    />
  );
}
