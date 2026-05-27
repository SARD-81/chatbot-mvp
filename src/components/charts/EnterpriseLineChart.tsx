import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { BaseChart } from "./BaseChart";
import { useEnterpriseChartPalette, enterpriseTooltipCss } from "./chartTheme";
import { formatNumber } from "./chartFormatters";
import type { ChartPoint, EnterpriseChartProps } from "./types";

type EnterpriseLineChartProps = EnterpriseChartProps & {
  data: ChartPoint[];
  seriesName?: string;
  unit?: string;
};

export function EnterpriseLineChart({
  data,
  title = "روند تغییرات",
  description = "نمایش روند مقادیر در بازه‌های زمانی",
  seriesName = "مقدار",
  unit = "",
  height,
  loading,
  className,
}: EnterpriseLineChartProps) {
  const palette = useEnterpriseChartPalette();

  const option: EChartsOption = useMemo(
    () => ({
      color: [palette.primary],
      tooltip: {
        trigger: "axis",
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
        top: 30,
        right: 14,
        bottom: 28,
        left: 20,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((item) => item.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: palette.border } },
        axisLabel: {
          color: palette.mutedForeground,
          fontSize: 11,
          margin: 14,
        },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitNumber: 4,
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
      dataZoom: [
        {
          type: "inside",
          throttle: 40,
        },
      ],
      series: [
        {
          name: seriesName,
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 7,
          showSymbol: data.length <= 18,
          sampling: "lttb",
          emphasis: {
            focus: "series",
            scale: 1.08,
          },
          lineStyle: {
            width: 4,
            cap: "round",
            join: "round",
          },
          itemStyle: {
            borderWidth: 3,
            borderColor: palette.card,
          },
          areaStyle: {
            opacity: 0.16,
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: palette.primary },
                { offset: 1, color: "rgba(255,255,255,0)" },
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