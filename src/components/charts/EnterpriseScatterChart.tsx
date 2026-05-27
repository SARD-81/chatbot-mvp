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

type ScatterSeriesItem = [
  previousScore: number,
  currentScore: number,
  supervisionScore: number,
  growth: number,
  rank: string,
];

function getTooltipParam(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params[0] : params;
}

function formatTooltip(params: TooltipComponentFormatterCallbackParams) {
  const item = getTooltipParam(params);
  const data = item.data as ScatterSeriesItem | undefined;

  if (!data) {
    return "";
  }

  const [
    previousScore,
    currentScore,
    supervisionScore,
    growth,
    rank,
  ] = data;

  return `<div style="min-width:220px;direction:rtl;text-align:right">
    <div style="font-weight:800;margin-bottom:8px;line-height:1.8">${rank}</div>

    <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px">
      <span>میانگین نمره قبل</span>
      <strong>${formatNumber(previousScore, 2)}</strong>
    </div>

    <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px">
      <span>میانگین نمره فعلی</span>
      <strong>${formatNumber(currentScore, 2)}</strong>
    </div>

    <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px">
      <span>میانگین نظارت</span>
      <strong>${formatNumber(supervisionScore, 2)}</strong>
    </div>

    <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px">
      <span>رشد میانی</span>
      <strong>${formatNumber(growth, 2)}</strong>
    </div>
  </div>`;
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
      ]),
    [data],
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
          lineStyle: {
            color: palette.grid,
            type: "dashed",
          },
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
          lineStyle: {
            color: palette.grid,
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "رده",
          type: "scatter",
          data: seriesData,
          symbolSize: 13,
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
    [
      palette,
      seriesData,
      xAxisName,
      yAxisName,
    ],
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