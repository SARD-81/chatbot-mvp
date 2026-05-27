import type { EChartsOption } from "echarts";

export type ChartPoint = {
  label: string;
  value: number;
};

export type PieChartPoint = {
  name: string;
  value: number;
};

export type EnterpriseChartProps = {
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  className?: string;
};

export type ChartPalette = {
  primary: string;
  primarySoft: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  card: string;
  grid: string;
  tooltipBg: string;
};

export type BaseChartProps = EnterpriseChartProps & {
  option: EChartsOption;
  empty?: boolean;
  emptyText?: string;
  onRefresh?: () => void;
};
