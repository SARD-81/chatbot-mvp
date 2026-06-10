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
        ? `${lastLine.slice(0, maxLineLength - 1)}\u2026`
        : `${lastLine}\u2026`;
  }

  return lines.join("\n");
}

function formatCategoryAxisLabel(value: string) {
  return splitLabelIntoLines(value);
}

/**
 * For the scrollable (>10 items) horizontal layout:
 * Show the full label wrapped into multiple lines instead of truncating.
 * Words are wrapped at maxLineLength=18 chars per line, up to maxLines=4.
 */
function formatScrollableCategoryAxisLabel(value: string) {
  const normalizedLabel = normalizeCategoryLabel(value);
  const MAX_LINE = 18;
  const MAX_LINES = 4;

  if (normalizedLabel.length <= MAX_LINE) {
    return normalizedLabel;
  }

  const words = normalizedLabel.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= MAX_LINE) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    // If a single word exceeds MAX_LINE, hard-break it
    if (word.length > MAX_LINE) {
      let remaining = word;
      while (remaining.length > MAX_LINE && lines.length < MAX_LINES - 1) {
        lines.push(remaining.slice(0, MAX_LINE));
        remaining = remaining.slice(MAX_LINE);
      }
      currentLine = remaining;
    } else {
      currentLine = word;
    }

    if (lines.length >= MAX_LINES - 1) {
      break;
    }
  }

  if (currentLine && lines.length < MAX_LINES) {
    lines.push(currentLine);
  }

  return lines.join("\n");
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
  title = "\u0645\u0642\u0627\u06CC\u0633\u0647 \u0645\u0642\u0627\u062F\u06CC\u0631",
  description = "\u0645\u0642\u0627\u06CC\u0633\u0647 \u062F\u0633\u062A\u0647\u200C\u0627\u06CC \u062F\u0627\u062F\u0647\u200C\u0647\u0627 \u062F\u0631 \u06CC\u06A9 \u0646\u06AF\u0627\u0647 \u0645\u062F\u06CC\u0631\u06CC\u062A\u06CC",
  seriesName = "\u0645\u0642\u062F\u0627\u0631",
  unit = "",
  height,
  loading,
  className,
}: EnterpriseBarChartProps) {
  const palette = useEnterpriseChartPalette();

  const shouldUseScrollableHorizontalLayout = data.length > 10;
  const hasLongLabels = data.some((item) => normalizeCategoryLabel(item.label).length > 14);
  const bottomGridSize = hasLongLabels ? 92 : 30;

  // Calculate dynamic left margin for scrollable layout based on longest label
  const maxLabelLength = useMemo(() => {
    if (!shouldUseScrollableHorizontalLayout) return 0;
    return Math.max(...data.map((item) => normalizeCategoryLabel(item.label).length));
  }, [data, shouldUseScrollableHorizontalLayout]);

  // Each character ~7px wide, cap at 240px, min 140px
  const dynamicLeftMargin = shouldUseScrollableHorizontalLayout
    ? Math.min(Math.max(Math.ceil(maxLabelLength / 18) * 18 * 7, 140), 240)
    : 120;

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
          left: dynamicLeftMargin,
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
            color: palette.foreground,
            fontSize: 13,
            fontWeight: "bold",
            width: dynamicLeftMargin - 8,
            overflow: "break",
            lineHeight: 18,
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
            barWidth: "46%",
            barMaxWidth: 28,
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
    dynamicLeftMargin,
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
