import { useMemo } from "react";
import type { EChartsOption, TooltipComponentFormatterCallbackParams } from "echarts";
import { BaseChart } from "./BaseChart";
import { useEnterpriseChartPalette, enterpriseTooltipCss } from "./chartTheme";
import { formatNumber } from "./chartFormatters";
import type { EnterpriseChartProps, PieChartPoint } from "./types";

type EnterprisePieChartProps = EnterpriseChartProps & {
  data: PieChartPoint[];
  unit?: string;
};

function getPieTooltipParam(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params[0] : params;
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
          const item = getPieTooltipParam(params);
          const value = formatNumber(Number(item.value ?? 0));
          return `<div style="min-width:140px">
            <div style="font-weight:700;margin-bottom:6px">${item.name ?? "-"}</div>
            <div style="display:flex;justify-content:space-between;gap:16px">
              <span>مقدار</span><strong>${value}${unit ? ` ${unit}` : ""}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin-top:4px">
              <span>سهم</span><strong>${formatNumber(Number(item.percent ?? 0), 1)}٪</strong>
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
            formatter: "{b}\n{d}٪",
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
          data,
        },
      ],
    }),
    [data, palette, unit]
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