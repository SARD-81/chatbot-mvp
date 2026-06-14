import type { ChatResponse } from '../types/api';
import type { SuggestedChart } from '../types/chat';
import type { ChartPoint, PieChartPoint, ScatterChartPoint } from '../components/charts/types';

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Strips surrounding quotes from axis names sent by the API.
 * e.g. '"\u062a\u0627\u0631\u06cc\u062e_\u062f\u0648\u0631\u0647"' => '\u062a\u0627\u0631\u06cc\u062e_\u062f\u0648\u0631\u0647'
 */
function stripQuotes(str: string): string {
  return str.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, '').trim();
}

/**
 * Builds a SuggestedChart from the chart_config nested inside response.metadata.
 * Returns undefined if chart_config is missing, chart_type is 'table',
 * or the required columns are not present in the response table.
 */
export function buildChartFromConfig(response: ChatResponse): SuggestedChart | undefined {
  // chart_config lives inside metadata, not at the root of the response
  const chart_config = response.metadata?.chart_config;
  const { table } = response;

  if (!chart_config) return undefined;

  const { chart_type } = chart_config;

  // 'table' means the backend wants a plain table \u2014 no chart needed
  if (chart_type === 'table') return undefined;

  // KPI: single number, no table required
  if (chart_type === 'kpi') {
    if (!table || !chart_config.y_axis) return undefined;
    const yAxis = stripQuotes(chart_config.y_axis);
    const rawValue = table.rows[0]?.[yAxis];
    const value = toFiniteNumber(rawValue);
    if (value === null) return undefined;

    return {
      type: 'gauge',
      title: yAxis,
      description: '',
      value,
      min: 0,
      max: 100,
      unit: '',
    };
  }

  if (!table) return undefined;

  const xAxis = chart_config.x_axis ? stripQuotes(chart_config.x_axis) : null;
  const yAxis = chart_config.y_axis ? stripQuotes(chart_config.y_axis) : null;

  if (!xAxis || !yAxis) return undefined;

  // \u2500\u2500 PIE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  if (chart_type === 'pie') {
    const data = table.rows.reduce<PieChartPoint[]>((acc, row) => {
      const name = row[xAxis];
      const value = toFiniteNumber(row[yAxis]);
      if (name == null || name === '' || value === null) return acc;
      acc.push({
        name: String(name).trim(),
        value: Number(value.toFixed(2)),
      });
      return acc;
    }, []);

    if (!data.length) return undefined;

    return {
      type: 'pie',
      title: `\u062a\u0648\u0632\u06cc\u0639 ${xAxis}`,
      description: '',
      data,
      unit: '',
      height: 420,
    };
  }

  // \u2500\u2500 LINE / BAR \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  if (chart_type === 'line' || chart_type === 'bar') {
    const data = table.rows.reduce<ChartPoint[]>((acc, row) => {
      const label = row[xAxis];
      const value = toFiniteNumber(row[yAxis]);
      if (label == null || label === '' || value === null) return acc;
      acc.push({
        label: String(label).trim(),
        value: Number(value.toFixed(2)),
      });
      return acc;
    }, []);

    if (!data.length) return undefined;

    return {
      type: chart_type,
      title: `${yAxis} \u0628\u0631 \u0627\u0633\u0627\u0633 ${xAxis}`,
      description: '',
      data,
      seriesName: yAxis,
      unit: '',
      height: 360,
    };
  }

  // \u2500\u2500 SCATTER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  if (chart_type === 'scatter') {
    const sizeCol = chart_config.size_or_color
      ? stripQuotes(chart_config.size_or_color)
      : null;

    const labelCol = table.columns.find(
      (c) => c !== xAxis && c !== yAxis && c !== sizeCol,
    );

    const scatterData = table.rows.reduce<ScatterChartPoint[]>((acc, row) => {
      const x = toFiniteNumber(row[xAxis]);
      const y = toFiniteNumber(row[yAxis]);
      if (x === null || y === null) return acc;

      const size = sizeCol ? (toFiniteNumber(row[sizeCol]) ?? 0) : 0;
      const label = labelCol ? String(row[labelCol] ?? '').trim() : '';

      acc.push({
        rank: label,
        previousScore: x,
        currentScore: y,
        supervisionScore: size,
        growth: 0,
      });

      return acc;
    }, []);

    if (scatterData.length) {
      return {
        type: 'scatter',
        title: `${yAxis} در برابر ${xAxis}`,
        description: '',
        data: scatterData,
        xAxisName: xAxis,
        yAxisName: yAxis,
        unit: '',
        height: 420,
      };
    }

    const categoryValueData = table.rows.reduce<ChartPoint[]>((acc, row) => {
      const label = row[xAxis];
      const value = toFiniteNumber(row[yAxis]);

      if (label === null || label === undefined || label === '' || value === null) {
        return acc;
      }

      acc.push({
        label: String(label).trim(),
        value: Number(value.toFixed(2)),
      });

      return acc;
    }, []);

    if (categoryValueData.length) {
      return {
        type: 'bar',
        title: `${yAxis} بر اساس ${xAxis}`,
        description: '',
        data: categoryValueData,
        seriesName: yAxis,
        unit: '',
        height: 420,
      };
    }

    return undefined;
  }

  return undefined;
}
