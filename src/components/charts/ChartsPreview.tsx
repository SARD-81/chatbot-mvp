import {
  periodScoreLineData,
  quarterlyBarData,
  scoreDistributionPieData,
  currentScoreGaugeValue,
} from "../../data/chartSampleData";
import { EnterpriseLineChart } from "./EnterpriseLineChart";
import { EnterpriseBarChart } from "./EnterpriseBarChart";
import { EnterprisePieChart } from "./EnterprisePieChart";
import { EnterpriseGaugeChart } from "./EnterpriseGaugeChart";

export function ChartsPreview() {
  return (
    <div dir="rtl" className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <EnterpriseLineChart
        title="روند میانگین نمره دوره"
        description="تحلیل روند نمره در دوره‌های زمانی ثبت‌شده"
        data={periodScoreLineData}
        seriesName="میانگین نمره"
        unit="امتیاز"
        height={380}
      />

      <EnterpriseBarChart
        title="مقایسه دوره‌ای"
        description="مقایسه سریع مقدار هر دوره برای گزارش مدیریتی"
        data={quarterlyBarData}
        seriesName="امتیاز"
        unit="امتیاز"
        height={380}
      />

      <EnterprisePieChart
        title="توزیع وضعیت عملکرد"
        description="نمای کلی از سهم وضعیت‌های عملکردی در مجموعه داده"
        data={scoreDistributionPieData}
        unit="مورد"
        height={380}
      />

      <EnterpriseGaugeChart
        title="شاخص فعلی عملکرد"
        description="آخرین مقدار ثبت‌شده نسبت به هدف ۱۰۰ امتیازی"
        value={currentScoreGaugeValue}
        label="میانگین فعلی"
        unit="امتیاز"
        height={380}
      />
    </div>
  );
}