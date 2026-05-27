import type { ChartPoint } from "@/components/charts";
import type { SuggestedPrompt } from "@/types/chat";

export function buildSuggestedPromptsWithFirstLineChart(
  chartData: ChartPoint[]
): SuggestedPrompt[] {
  return [
    {
      id: "suggested-line-chart",
      title: "روند تغییرات داده‌ها",
      prompt: "روند تغییرات این داده‌ها را تحلیل کن",
      chart: {
        type: "line",
        title: "روند تغییرات دوره‌ای",
        description: "نمایش نرم و پیوسته تغییرات مقادیر در دوره‌های مختلف",
        data: chartData,
        seriesName: "مقدار",
        unit: "امتیاز",
        height: 320,
      },
    },
    {
      id: "suggested-trend-analysis",
      title: "تحلیل روند",
      prompt: "روند تغییرات این داده‌ها را توضیح بده",
    },
    {
      id: "suggested-min-max",
      title: "بیشترین و کمترین مقدار",
      prompt: "بیشترین و کمترین مقدار را پیدا کن و توضیح بده",
    },
    {
      id: "suggested-management-summary",
      title: "خلاصه مدیریتی",
      prompt: "از این داده‌ها یک خلاصه مدیریتی کوتاه و کاربردی بده",
    },
  ];
}