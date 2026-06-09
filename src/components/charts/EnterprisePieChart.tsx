import { useMemo } from "react";
import type {
  EChartsOption,
  TooltipComponentFormatterCallbackParams,
} from "echarts";
import { BaseChart } from "./BaseChart";
import { useEnterpriseChartPalette, enterpriseTooltipCss } from "./chartTheme";
import { formatNumber } from "./chartFormatters";
import type { EnterpriseChartProps, PieChartPoint } from "./types";

type EnterprisePieChartProps = EnterpriseChartProps & {
  data: PieChartPoint[];
  unit?: string;
};

type PieFormatterParam = {
  data?: unknown;
  name?: unknown;
  value?: unknown;
  percent?: unknown;
};

function buildDisplayPieData(data: PieChartPoint[]): PieChartPoint[] {
  if (data.length <= 10) {
    return data;
  }

  const allItemsHaveNumericPercent = data.every((item) =>
    Number.isFinite(item.percent)
  );
  const sortedItems = data
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const valueDifference = Number(b.item.value) - Number(a.item.value);

      return valueDifference || a.index - b.index;
    });
  const topItems = sortedItems.slice(0, 9).map(({ item }) => item);
  const remainingItems = sortedItems.slice(9).map(({ item }) => item);
  const otherValue = remainingItems.reduce(
    (sum, item) => sum + Number(item.value),
    0
  );
  const otherItem: PieChartPoint = {
    name: "سایر موارد",
    value: otherValue,
  };

  if (allItemsHaveNumericPercent) {
    const otherPercent = remainingItems.reduce(
      (sum, item) => sum + Number(item.percent),
      0
    );

    otherItem.percent = Math.round(otherPercent * 100) / 100;
  }

  return [...topItems, otherItem];
}

function getPieTooltipParam(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params[0] : params;
}

function getPiePercent(params: PieFormatterParam) {
  const dataItem = params.data as PieChartPoint | undefined;

  if (typeof dataItem?.percent === "number") {
    return dataItem.percent;
  }

  const percent = Number(params.percent ?? 0);

  return Number.isFinite(percent) ? percent : 0;
}

function getPieName(params: PieFormatterParam) {
  return String(params.name ?? "-");
}

function getPieValue(params: PieFormatterParam) {
  const value = Number(params.value ?? 0);

  return Number.isFinite(value) ? value : 0;
}

export function EnterprisePieChart({
  data,
  title = "ترکیب سهم‌ها",
  description = "نمایش سهم هر بخش از کل داده‌ها",
  unit = "",
  height = 360,
  loading,
  className,
}: EnterprisePieChartProps) {
  const palette = useEnterpriseChartPalette();
  const displayData = useMemo(() => buildDisplayPieData(data), [data]);

  const option: EChartsOption = useMemo(
    () => ({
      color: [
        palette.primary,
        palette.accent,
        palette.success,
        palette.warning,
        palette.danger,
        "#06b6d4",
        "#8b5cf6",
      ],
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
        formatter: (params) => {
          const item = getPieTooltipParam(params) as PieFormatterParam;
          const name = getPieName(item);
          const value = formatNumber(getPieValue(item), 0);
          const percent = formatNumber(getPiePercent(item), 2);

          return `<div style="min-width:170px;direction:rtl;text-align:right">
            <div style="font-weight:700;margin-bottom:6px;line-height:1.8">${name}</div>
            <div style="display:flex;justify-content:space-between;gap:16px">
              <span>تعداد</span><strong>${value}${unit ? ` ${unit}` : ""}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin-top:4px">
              <span>درصد از کل</span><strong>${percent}٪</strong>
            </div>
          </div>`;
        },
      },
      legend: {
        bottom: 0,
        type: "scroll",
        icon: "circle",
        itemWidth: 9,
        itemHeight: 9,
        textStyle: {
          color: palette.mutedForeground,
          fontSize: 11,
        },
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "72%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          minAngle: 5,
          padAngle: 2,
          itemStyle: {
            borderRadius: 14,
            borderColor: palette.card,
            borderWidth: 4,
          },
          label: {
            show: true,
            color: palette.foreground,
            fontSize: 11,
            formatter: (params) => {
              const item = params as PieFormatterParam;
              const name = getPieName(item);
              const percent = formatNumber(getPiePercent(item), 2);

              return `${name}\n${percent}٪`;
            },
          },
          labelLine: {
            length: 12,
            length2: 8,
            lineStyle: {
              color: palette.border,
            },
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
            itemStyle: {
              shadowBlur: 24,
              shadowColor: "rgba(15, 23, 42, 0.22)",
            },
          },
          data: displayData,
        },
      ],
    }),
    [displayData, palette, unit]
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