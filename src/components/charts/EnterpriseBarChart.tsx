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

function normalizeCategoryLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function splitLabelIntoLines(label: string, maxLineLength = 14, maxLines = 3) {
  const normalizedLabel = normalizeCategoryLabel(label);

  if (normalizedLabel.length <= maxLineLength) {
    return normalizedLabel;
  }

  const words = normalizedLabel.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  const usedText = lines.join(" ");
  const hasHiddenText = normalizedLabel.length > usedText.length;

  if (hasHiddenText && lines.length) {
    const lastLineIndex = lines.length - 1;
    const lastLine = lines[lastLineIndex];

    lines[lastLineIndex] =
      lastLine.length >= maxLineLength
        ? `${lastLine.slice(0, maxLineLength - 1)}…`
        : `${lastLine}…`;
  }

  return lines.join("\n");
}

function formatCategoryAxisLabel(value: string) {
  return splitLabelIntoLines(value);
}

// For horizontal (scrollable) layout: wrap into multiple lines
function formatScrollableCategoryAxisLabel(value: string) {
  const normalizedLabel = normalizeCategoryLabel(value);
  return splitLabelIntoLines(normalizedLabel, 12, 3);
}

function getScrollableBarChartData(data: ChartPoint[]): ChartPoint[] {
  return data
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const valueDifference = Number(b.item.value) - Number(a.item.value);
      return valueDifference || a.index - b.index;
    })
    .map(({ item }) => item);
}

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

  const shouldUseScrollableHorizontalLayout = data.length > 10;
  const hasLongLabels = data.some((item) => normalizeCategoryLabel(item.label).length > 14);
  const bottomGridSize = hasLongLabels ? 92 : 30;
  const scrollableData = useMemo(
    () =>
      shouldUseScrollableHorizontalLayout
        ? getScrollableBarChartData(data)
        : data,
    [data, shouldUseScrollableHorizontalLayout],
  );

  const option: EChartsOption = useMemo(() => {
    const tooltip = {
      trigger: "axis" as const,
      axisPointer: {
        type: "shadow" as const,
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
      valueFormatter: (value: unknown) =>
        `${formatNumber(Number(value))}${unit ? ` ${unit}` : ""}`,
    };

    if (shouldUseScrollableHorizontalLayout) {
      return {
        color: [palette.primary],
        tooltip,
        grid: {
          top: 26,
          right: 48,
          bottom: 30,
          left: 220,
          containLabel: false,
        },
        xAxis: {
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
        yAxis: {
          type: "category",
          inverse: true,
          data: scrollableData.map((item) => item.label),
          axisTick: { show: false },
          axisLine: { lineStyle: { color: palette.border } },
          axisLabel: {
            color: palette.mutedForeground,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "AppFont, ui-sans-serif, system-ui, sans-serif",
            overflow: "break",
            width: 210,
            lineHeight: 22,
            formatter: formatScrollableCategoryAxisLabel,
          },
        },
        dataZoom: [
          {
            type: "slider",
            yAxisIndex: 0,
            startValue: 0,
            endValue: 9,
            filterMode: "none",
            minValueSpan: 9,
            maxValueSpan: 9,
            zoomLock: true,
            brushSelect: false,
            showDetail: false,
            width: 18,
            right: 8,
          },
          {
            type: "inside",
            yAxisIndex: 0,
            startValue: 0,
            endValue: 9,
            filterMode: "none",
            minValueSpan: 9,
            maxValueSpan: 9,
            zoomLock: true,
            zoomOnMouseWheel: false,
            moveOnMouseWheel: true,
            moveOnMouseMove: true,
          },
        ],
        series: [
          {
            name: seriesName,
            type: "bar",
            barWidth: "38%",
            barMaxWidth: 24,
            barMinHeight: 4,
            emphasis: {
              focus: "series",
            },
            itemStyle: {
              borderRadius: [6, 14, 14, 6],
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: palette.primary },
                  { offset: 1, color: palette.accent },
                ],
              },
            },
            data: scrollableData.map((item) => item.value),
          },
        ],
      };
    }

    return {
      color: [palette.primary],
      tooltip,
      grid: {
        top: 26,
        right: 14,
        bottom: bottomGridSize,
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
          hideOverlap: false,
          margin: 16,
          lineHeight: 16,
          formatter: formatCategoryAxisLabel,
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
    };
  }, [
    bottomGridSize,
    data,
    palette,
    scrollableData,
    seriesName,
    shouldUseScrollableHorizontalLayout,
    unit,
  ]);

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