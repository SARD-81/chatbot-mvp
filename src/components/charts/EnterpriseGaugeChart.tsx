import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { BaseChart } from "./BaseChart";
import { useEnterpriseChartPalette } from "./chartTheme";
import { formatNumber } from "./chartFormatters";
import type { EnterpriseChartProps } from "./types";

type EnterpriseGaugeChartProps = EnterpriseChartProps & {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
};

export function EnterpriseGaugeChart({
  value,
  min = 0,
  max = 100,
  unit = "٪",
  label = "شاخص عملکرد",
  title = "وضعیت شاخص",
  description = "نمایش فشرده وضعیت فعلی نسبت به هدف",
  height = 360,
  loading,
  className,
}: EnterpriseGaugeChartProps) {
  const palette = useEnterpriseChartPalette();

  const normalizedValue = Number.isFinite(value) ? value : 0;

  const option: EChartsOption = useMemo(
    () => ({
      series: [
        {
          type: "gauge",
          min,
          max,
          startAngle: 210,
          endAngle: -30,
          radius: "94%",
          center: ["50%", "58%"],
          progress: {
            show: true,
            width: 18,
            roundCap: true,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: palette.accent },
                  { offset: 0.55, color: palette.primary },
                  { offset: 1, color: palette.success },
                ],
              },
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 18,
              color: [[1, "rgba(148, 163, 184, 0.18)"]],
            },
          },
          pointer: {
            show: true,
            length: "58%",
            width: 5,
            itemStyle: {
              color: palette.foreground,
            },
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 18,
            itemStyle: {
              borderWidth: 6,
              borderColor: palette.primary,
              color: palette.card,
            },
          },
          axisTick: {
            distance: -26,
            splitNumber: 4,
            lineStyle: {
              width: 1,
              color: "rgba(100,116,139,0.35)",
            },
          },
          splitLine: {
            distance: -31,
            length: 10,
            lineStyle: {
              width: 2,
              color: "rgba(100,116,139,0.35)",
            },
          },
          axisLabel: {
            distance: -8,
            color: palette.mutedForeground,
            fontSize: 10,
            formatter: (v: number) => formatNumber(v, 0),
          },
          detail: {
            offsetCenter: [0, "48%"],
            valueAnimation: true,
            formatter: (v: number) =>
              `{value|${formatNumber(v, 1)}}{unit| ${unit}}\n{name|${label}}`,
            rich: {
              value: {
                fontSize: 34,
                fontWeight: 800,
                color: palette.foreground,
                lineHeight: 44,
              },
              unit: {
                fontSize: 14,
                fontWeight: 700,
                color: palette.mutedForeground,
              },
              name: {
                fontSize: 12,
                color: palette.mutedForeground,
                lineHeight: 24,
              },
            },
          },
          data: [{ value: normalizedValue }],
        },
      ],
    }),
    [palette, min, max, normalizedValue, unit, label]
  );

  return (
    <BaseChart
      title={title}
      description={description}
      option={option}
      height={height}
      loading={loading}
      empty={false}
      className={className}
    />
  );
}