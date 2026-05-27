import type { ChartPoint, PieChartPoint } from "../components/charts";

export const periodScoreLineData: ChartPoint[] = [
  { label: "۱۴۰۲/۰۴/۰۱", value: 84.22 },
  { label: "۱۴۰۲/۰۷/۰۱", value: 82.79 },
  { label: "۱۴۰۲/۱۰/۰۱", value: 86.45 },
  { label: "۱۴۰۳/۰۱/۰۱", value: 88.12 },
  { label: "۱۴۰۳/۰۴/۰۱", value: 87.3 },
  { label: "۱۴۰۳/۰۷/۰۱", value: 90.1 },
];

export const quarterlyBarData: ChartPoint[] = periodScoreLineData.map((item) => ({
  label: item.label.slice(0, 7),
  value: item.value,
}));

const excellent = periodScoreLineData.filter((item) => item.value >= 88).length;
const good = periodScoreLineData.filter(
  (item) => item.value >= 84 && item.value < 88
).length;
const normal = periodScoreLineData.filter((item) => item.value < 84).length;

export const scoreDistributionPieData: PieChartPoint[] = [
  { name: "عالی", value: excellent },
  { name: "خوب", value: good },
  { name: "نیازمند توجه", value: normal },
];

export const currentScoreGaugeValue =
  periodScoreLineData[periodScoreLineData.length - 1]?.value ?? 0;