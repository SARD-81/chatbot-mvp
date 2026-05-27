import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { BaseChart } from "./BaseChart";
import { useEnterpriseChartPalette, enterpriseTooltipCss } from "./chartTheme";
import { formatNumber } from "./chartFormatters";
import type { ChartPoint, EnterpriseChartProps } from "./types";

type EnterpriseBarChartProps = EnterpriseChartProps & {
  data: ChartPoint[];
  seriesName?: string;
  unit?: string;
};

export function EnterpriseBarChart({
  data,
  title = "مقایسه مقادیر",
  description = "مقایسه دسته‌ای داده‌ها در یک نگاه مدیریتی",
  seriesName = "مقدار",
  unit = "",
  height,
  loading,
  className,
}: EnterpriseBarChartProps) {
  const palette = useEnterpriseChartPalette();

  const option: EChartsOption = useMemo(
    () => ({
      color: [palette.primary],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          shadowStyle: {
            color: "rgba(100,116,139,0.08)",
          },
        },
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
        valueFormatter: (value) =>
          `${formatNumber(Number(value))}${unit ? ` ${unit}` : ""}`,
      },
      grid: {
        top: 26,
        right: 14,
        bottom: 30,
        left: 20,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: palette.border } },
        axisLabel: {
          color: palette.mutedForeground,
          fontSize: 11,
          interval: 0,
          hideOverlap: true,
          margin: 14,
        },
      },
      yAxis: {
        type: "value",
        scale: true,
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
          name: seriesName,
          type: "bar",
          barWidth: "46%",
          barMaxWidth: 36,
          borderRadius: [14, 14, 6, 6],
          emphasis: {
            focus: "series",
          },
          itemStyle: {
            borderRadius: [14, 14, 6, 6],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: palette.primary },
                { offset: 1, color: palette.accent },
              ],
            },
          },
          data: data.map((item) => item.value),
        },
      ],
    }),
    [data, palette, seriesName, unit]
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