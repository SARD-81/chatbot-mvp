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
 * e.g. '"تاریخ_دوره"' => 'تاریخ_دوره'
 */
function stripQuotes(str: string): string {
  return str.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, '').trim();
}

/**
 * Builds a SuggestedChart from the chart_config returned by the API.
 * Returns undefined if chart_config is missing, chart_type is 'table',
 * or the required columns are not present in the response table.
 */
export function buildChartFromConfig(response: ChatResponse): SuggestedChart | undefined {
  const { chart_config, table } = response;

  if (!chart_config) return undefined;

  const { chart_type } = chart_config;

  // 'table' means the backend wants a plain table — no chart needed
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

  // ── PIE ────────────────────────────────────────────────────────────────────
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
      title: `توزیع ${xAxis}`,
      description: '',
      data,
      unit: '',
      height: 420,
    };
  }

  // ── LINE / BAR ──────────────────────────────────────────────────────────────
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
      title: `${yAxis} بر اساس ${xAxis}`,
      description: '',
      data,
      seriesName: yAxis,
      unit: '',
      height: 360,
    };
  }

  // ── SCATTER ─────────────────────────────────────────────────────────────────
  if (chart_type === 'scatter') {
    const sizeCol = chart_config.size_or_color
      ? stripQuotes(chart_config.size_or_color)
      : null;

    const labelCol = table.columns.find(
      (c) => c !== xAxis && c !== yAxis && c !== sizeCol,
    );

    const data = table.rows.reduce<ScatterChartPoint[]>((acc, row) => {
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

    if (!data.length) return undefined;

    return {
      type: 'scatter',
      title: `${yAxis} در برابر ${xAxis}`,
      description: '',
      data,
      xAxisName: xAxis,
      yAxisName: yAxis,
      unit: '',
      height: 420,
    };
  }

  return undefined;
}
