import {
  EnterpriseBarChart,
  EnterpriseGaugeChart,
  EnterpriseLineChart,
  EnterprisePieChart,
} from "@/components/charts";
import type { SuggestedChart } from "@/types/chat";

type SuggestedPromptChartProps = {
  chart: SuggestedChart;
};

export function SuggestedPromptChart({ chart }: SuggestedPromptChartProps) {
  switch (chart.type) {
    case "bar":
      return (
        <EnterpriseBarChart
          title={chart.title}
          description={chart.description}
          data={chart.data}
          unit={chart.unit}
          seriesName={chart.seriesName}
          height={chart.height ?? 300}
        />
      );

    case "line":
      return (
        <EnterpriseLineChart
          title={chart.title}
          description={chart.description}
          data={chart.data}
          unit={chart.unit}
          seriesName={chart.seriesName}
          height={chart.height ?? 300}
        />
      );

    case "pie":
      return (
        <EnterprisePieChart
          title={chart.title}
          description={chart.description}
          data={chart.data}
          unit={chart.unit}
          height={chart.height ?? 300}
        />
      );

    case "gauge":
      return (
        <EnterpriseGaugeChart
          title={chart.title}
          description={chart.description}
          value={chart.value}
          min={chart.min}
          max={chart.max}
          unit={chart.unit}
          label={chart.label}
          height={chart.height ?? 300}
        />
      );

    default:
      return null;
  }
}