import type { ChatResponse, ChatTable, ChartConfig } from '../types/api';
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

function stripQuotes(str: string): string {
  return str.replace(/^["'“”`]+|["'“”`]+$/g, '').trim();
}

function formatColumnLabel(column: string) {
  return column.replace(/[\-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function isPercentageColumn(column: string) {
  const normalized = formatColumnLabel(column).toLowerCase();
  return (
    normalized.includes('percentage') ||
    normalized.includes('percent') ||
    normalized.includes('درصد') ||
    normalized === '%'
  );
}

function inferUnitFromColumn(column: string) {
  const normalized = formatColumnLabel(column).toLowerCase();

  if (isPercentageColumn(column)) return '٪';
  if (normalized.includes('hour') || normalized.includes('ساعت')) return 'ساعت';
  return '';
}

function resolveColumnName(table: ChatTable, axisName: string | null | undefined) {
  if (!axisName) {
    return null;
  }

  const requestedColumn = stripQuotes(axisName);

  if (table.columns.includes(requestedColumn)) {
    return requestedColumn;
  }

  return table.columns.find((column) => stripQuotes(column) === requestedColumn) ?? null;
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

function getGaugeMax(value: number, valueColumn: string) {
  if (isPercentageColumn(valueColumn)) return 100;
  if (value <= 0) return 1;

  const paddedValue = value * 1.2;
  if (paddedValue <= 10) return Math.max(1, Math.ceil(paddedValue));

  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(paddedValue)) - 1);
  return Math.ceil(paddedValue / magnitude) * magnitude;
}

/** Current backend contract is root-level chart_config. Metadata location is legacy only. */
export function getResponseChartConfig(response: ChatResponse): ChartConfig | undefined {
  return response.chart_config ?? response.metadata?.chart_config;
}

export function hasResponseChartConfig(response: ChatResponse) {
  return Boolean(getResponseChartConfig(response));
}

/**
 * Builds the chart selected by the backend.
 * When chart_config exists, its chart_type and axis bindings are authoritative.
 */
export function buildChartFromConfig(response: ChatResponse): SuggestedChart | undefined {
  const chartConfig = getResponseChartConfig(response);
  const { table } = response;

  if (!chartConfig) return undefined;

  const { chart_type: chartType } = chartConfig;

  // Explicit backend decision: table means no chart.
  if (chartType === 'table') return undefined;

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
      title: formatColumnLabel(valueColumn),
      description: '',
      value,
      min: 0,
      max: getGaugeMax(value, valueColumn),
      unit: inferUnitFromColumn(valueColumn),
      label: formatColumnLabel(valueColumn),
    };
  }

  if (!table) return undefined;

  const xAxis = resolveColumnName(table, chartConfig.x_axis);
  const yAxis = resolveColumnName(table, chartConfig.y_axis);

  if (!xAxis || !yAxis) return undefined;

  if (chartType === 'pie') {
    const yIsPercentage = isPercentageColumn(yAxis);
    const percentageColumn =
      table.columns.find((column) => column !== yAxis && isPercentageColumn(column)) ?? null;

    const data = table.rows.reduce<PieChartPoint[]>((items, row) => {
      const name = row[xAxis];
      const value = toFiniteNumber(row[yAxis]);

      if (name === null || name === undefined || name === '' || value === null) {
        return items;
      }

      const explicitPercent = yIsPercentage
        ? value
        : percentageColumn
          ? toFiniteNumber(row[percentageColumn])
          : null;

      items.push({
        name: String(name).trim(),
        value: Number(value.toFixed(2)),
        ...(explicitPercent !== null
          ? { percent: Number(explicitPercent.toFixed(2)) }
          : {}),
      });

      return items;
    }, []);

    if (!data.length) return undefined;

    return {
      type: 'pie',
      title: `${formatColumnLabel(yAxis)} بر اساس ${formatColumnLabel(xAxis)}`,
      description: '',
      data,
      unit: inferUnitFromColumn(yAxis),
      valueLabel: formatColumnLabel(yAxis),
      showPercentRow: !yIsPercentage,
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
      title: `${formatColumnLabel(yAxis)} بر اساس ${formatColumnLabel(xAxis)}`,
      description: '',
      data,
      seriesName: formatColumnLabel(yAxis),
      unit: inferUnitFromColumn(yAxis),
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
        growth: sizeValue ?? 1,
        rawRow: row,
      });

      return items;
    }, []);

    if (!data.length) return undefined;

    return {
      type: 'scatter',
      title: `${formatColumnLabel(yAxis)} در برابر ${formatColumnLabel(xAxis)}`,
      description: `مقایسه دو شاخص عددی «${formatColumnLabel(xAxis)}» و «${formatColumnLabel(yAxis)}»`,
      data,
      xAxisName: formatColumnLabel(xAxis),
      yAxisName: formatColumnLabel(yAxis),
      unit: '',
      height: 420,
    };
  }

  return undefined;
}
