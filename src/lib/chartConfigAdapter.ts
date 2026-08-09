import type { ChatResponse, ChatTable } from '../types/api';
import type { SuggestedChart } from '../types/chat';
import type { ChartPoint, PieChartPoint, ScatterChartPoint } from '../components/charts/types';

function normalizeLocalizedNumber(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  let numericText = normalizeLocalizedNumber(value);

  if (!numericText) {
    return null;
  }

  const looksLikeThousands = /^[-+]?\d{1,3}(,\d{3})+(?:\.\d+)?$/.test(numericText);
  const looksLikeDecimalComma = /^[-+]?\d+,\d{1,2}$/.test(numericText);

  if (looksLikeThousands) {
    numericText = numericText.replace(/,/g, '');
  } else if (looksLikeDecimalComma && !numericText.includes('.')) {
    numericText = numericText.replace(',', '.');
  } else {
    numericText = numericText.replace(/,/g, '');
  }

  const numericValue = Number(numericText);
  return Number.isFinite(numericValue) ? numericValue : null;
}

/**
 * Strips surrounding quotes from axis names sent by the API.
 * e.g. '"تاریخ_دوره"' => 'تاریخ_دوره'
 */
function stripQuotes(str: string): string {
  return str.replace(/^["'“”`]+|["'“”`]+$/g, '').trim();
}

function resolveColumnName(table: ChatTable, axisName: string | null | undefined) {
  if (!axisName) {
    return null;
  }

  const requestedColumn = stripQuotes(axisName);

  // The backend contract requires exact SELECT aliases. Prefer that exact match.
  if (table.columns.includes(requestedColumn)) {
    return requestedColumn;
  }

  // Be tolerant of accidental whitespace/quoting around otherwise exact aliases.
  return (
    table.columns.find((column) => stripQuotes(column) === requestedColumn) ??
    null
  );
}

function findScatterLabelColumn(
  table: ChatTable,
  xAxis: string,
  yAxis: string,
  sizeCol: string | null,
) {
  const candidates = table.columns.filter(
    (column) => column !== xAxis && column !== yAxis && column !== sizeCol,
  );

  return (
    candidates.find((column) =>
      table.rows.some((row) => {
        const value = row[column];
        return (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          toFiniteNumber(value) === null
        );
      }),
    ) ?? candidates[0]
  );
}

/**
 * Builds a SuggestedChart from metadata.chart_config.
 * API-provided chart_config always has priority over frontend inference.
 */
export function buildChartFromConfig(response: ChatResponse): SuggestedChart | undefined {
  const chartConfig = response.metadata?.chart_config;
  const { table } = response;

  if (!chartConfig) return undefined;

  const { chart_type: chartType } = chartConfig;

  if (chartType === 'table') return undefined;

  // Backend contract allows KPI axes to be null. Use the first numeric table value.
  if (chartType === 'kpi') {
    if (!table?.rows.length) return undefined;

    const preferredColumn = resolveColumnName(table, chartConfig.y_axis);
    const valueColumn =
      preferredColumn ??
      table.columns.find((column) =>
        table.rows.some((row) => toFiniteNumber(row[column]) !== null),
      );

    if (!valueColumn) return undefined;

    const value = toFiniteNumber(table.rows[0]?.[valueColumn]);
    if (value === null) return undefined;

    return {
      type: 'gauge',
      title: valueColumn,
      description: '',
      value,
      min: 0,
      max: Math.max(1, value > 100 ? Math.ceil(value * 1.2) : 100),
      unit: '',
    };
  }

  if (!table) return undefined;

  const xAxis = resolveColumnName(table, chartConfig.x_axis);
  const yAxis = resolveColumnName(table, chartConfig.y_axis);

  if (!xAxis || !yAxis) return undefined;

  if (chartType === 'pie') {
    const data = table.rows.reduce<PieChartPoint[]>((items, row) => {
      const name = row[xAxis];
      const value = toFiniteNumber(row[yAxis]);

      if (name === null || name === undefined || name === '' || value === null) {
        return items;
      }

      items.push({
        name: String(name).trim(),
        value: Number(value.toFixed(2)),
      });

      return items;
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

  if (chartType === 'line' || chartType === 'bar') {
    const data = table.rows.reduce<ChartPoint[]>((items, row) => {
      const label = row[xAxis];
      const value = toFiniteNumber(row[yAxis]);

      if (label === null || label === undefined || label === '' || value === null) {
        return items;
      }

      items.push({
        label: String(label).trim(),
        value: Number(value.toFixed(2)),
      });

      return items;
    }, []);

    if (!data.length) return undefined;

    return {
      type: chartType,
      title: `${yAxis} بر اساس ${xAxis}`,
      description: '',
      data,
      seriesName: yAxis,
      unit: '',
      height: 360,
    };
  }

  if (chartType === 'scatter') {
    const sizeCol = resolveColumnName(table, chartConfig.size_or_color);
    const labelCol = findScatterLabelColumn(table, xAxis, yAxis, sizeCol);

    const data = table.rows.reduce<ScatterChartPoint[]>((items, row, index) => {
      const xValue = toFiniteNumber(row[xAxis]);
      const yValue = toFiniteNumber(row[yAxis]);

      if (xValue === null || yValue === null) {
        return items;
      }

      const sizeValue = sizeCol ? toFiniteNumber(row[sizeCol]) : null;
      const rawLabel = labelCol ? row[labelCol] : null;
      const label =
        rawLabel !== null && rawLabel !== undefined && rawLabel !== ''
          ? String(rawLabel).trim()
          : `نقطه ${index + 1}`;

      items.push({
        rank: label,
        previousScore: xValue,
        currentScore: yValue,
        supervisionScore: sizeValue ?? 0,
        // Generic scatter plots do not require a third metric for bubble sizing.
        // A stable non-zero value keeps all points clearly visible.
        growth: sizeValue ?? 1,
        rawRow: row,
      });

      return items;
    }, []);

    if (!data.length) {
      return undefined;
    }

    return {
      type: 'scatter',
      title: `${yAxis} در برابر ${xAxis}`,
      description: `مقایسه دو شاخص عددی «${xAxis}» و «${yAxis}»`,
      data,
      xAxisName: xAxis,
      yAxisName: yAxis,
      unit: '',
      height: 420,
    };
  }

  return undefined;
}
