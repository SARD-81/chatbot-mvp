import type {
  ChartPoint,
  PieChartPoint,
  ScatterChartPoint,
} from '../components/charts/types';
import type { ChatResponse, ChatTable } from '../types/api';
import type { SuggestedChart } from '../types/chat';
import { isHourLikeColumn, toFiniteNumericValue } from './jirakavResponse';

function formatColumnLabel(column: string) {
  return column.replace(/[\-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeColumnName(column: string) {
  return formatColumnLabel(column).toLowerCase();
}

function isStatusLikeColumn(column: string) {
  const normalizedColumn = normalizeColumnName(column);
  return normalizedColumn.includes('status') || normalizedColumn.includes('وضعیت');
}

function isDateLikeColumn(column: string) {
  const normalizedColumn = normalizeColumnName(column);

  if (isHourLikeColumn(column)) {
    return false;
  }

  return (
    normalizedColumn.includes('date') ||
    normalizedColumn.includes('created at') ||
    normalizedColumn.includes('updated at') ||
    normalizedColumn.includes('تاریخ') ||
    normalizedColumn.includes('تاريخ')
  );
}

function isCountLikeColumn(column: string) {
  const normalizedColumn = normalizeColumnName(column);
  return normalizedColumn.includes('count') || normalizedColumn.includes('تعداد');
}

function isPercentageLikeColumn(column: string) {
  const normalizedColumn = normalizeColumnName(column);

  return (
    normalizedColumn.includes('percentage') ||
    normalizedColumn.includes('percent') ||
    normalizedColumn.includes('درصد') ||
    normalizedColumn.includes('سهم')
  );
}

function isIdentifierLikeColumn(column: string) {
  const normalizedColumn = normalizeColumnName(column);

  return (
    normalizedColumn === 'id' ||
    normalizedColumn.endsWith(' id') ||
    normalizedColumn.includes('row number') ||
    normalizedColumn.includes('row num') ||
    normalizedColumn === 'rank' ||
    normalizedColumn === 'ردیف'
  );
}

function getNumericColumns(table: ChatTable) {
  return table.columns.filter((column) => {
    const populatedValues = table.rows
      .map((row) => row[column])
      .filter((value) => value !== null && value !== undefined && value !== '');

    if (!populatedValues.length) {
      return false;
    }

    const numericValuesCount = populatedValues.filter(
      (value) => toFiniteNumericValue(value) !== null,
    ).length;

    return numericValuesCount / populatedValues.length >= 0.75;
  });
}

function findLabelColumn(table: ChatTable, numericColumns: string[]) {
  const candidateColumns = table.columns.filter((column) => !numericColumns.includes(column));

  return (
    candidateColumns.find(isStatusLikeColumn) ??
    candidateColumns.find(isDateLikeColumn) ??
    candidateColumns.find((column) => {
      const normalizedColumn = normalizeColumnName(column);
      return (
        normalizedColumn.includes('assignee') ||
        normalizedColumn.includes('name') ||
        normalizedColumn.includes('summary') ||
        normalizedColumn.includes('نام') ||
        normalizedColumn.includes('کاربر') ||
        normalizedColumn.includes('مسئول')
      );
    }) ??
    candidateColumns[0]
  );
}

function findValueColumn(numericColumns: string[]) {
  return (
    numericColumns.find(isCountLikeColumn) ??
    numericColumns.find(isHourLikeColumn) ??
    numericColumns.find(isPercentageLikeColumn) ??
    numericColumns[0]
  );
}

function inferUnit(column: string) {
  if (isHourLikeColumn(column)) {
    return 'ساعت';
  }

  if (isPercentageLikeColumn(column)) {
    return 'درصد';
  }

  if (isCountLikeColumn(column)) {
    return 'مورد';
  }

  return '';
}

function getGaugeMax(value: number) {
  if (value <= 0) {
    return 1;
  }

  const paddedValue = value * 1.2;

  if (paddedValue <= 10) {
    return Math.max(1, Math.ceil(paddedValue));
  }

  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(paddedValue)) - 1);
  return Math.ceil(paddedValue / magnitude) * magnitude;
}

function buildSingleRowChart(
  table: ChatTable,
  numericColumns: string[],
): SuggestedChart | undefined {
  const row = table.rows[0];

  if (!row || !numericColumns.length) {
    return undefined;
  }

  if (numericColumns.length === 1) {
    const valueColumn = numericColumns[0];
    const value = toFiniteNumericValue(row[valueColumn]);

    if (value === null) {
      return undefined;
    }

    return {
      type: 'gauge',
      title: formatColumnLabel(valueColumn),
      description: '',
      value,
      min: 0,
      max: getGaugeMax(value),
      unit: inferUnit(valueColumn),
      label: formatColumnLabel(valueColumn),
      height: 360,
    };
  }

  const data = numericColumns.reduce<ChartPoint[]>((items, column) => {
    const value = toFiniteNumericValue(row[column]);

    if (value === null) {
      return items;
    }

    items.push({
      label: formatColumnLabel(column),
      value,
    });

    return items;
  }, []);

  if (data.length < 2) {
    return undefined;
  }

  const allHourColumns = numericColumns.every(isHourLikeColumn);

  return {
    type: 'bar',
    title: 'مقایسه مقادیر',
    description: '',
    data,
    seriesName: 'مقدار',
    unit: allHourColumns ? 'ساعت' : '',
    height: 380,
  };
}

function getPercentageTotal(table: ChatTable, percentageColumn: string) {
  const values = table.rows
    .map((row) => toFiniteNumericValue(row[percentageColumn]))
    .filter((value): value is number => value !== null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0);
}

function shouldRenderAsDistribution(
  table: ChatTable,
  labelColumn: string,
  numericColumns: string[],
) {
  if (isStatusLikeColumn(labelColumn)) {
    return true;
  }

  const percentageColumn = numericColumns.find(isPercentageLikeColumn);

  if (!percentageColumn || table.rows.length > 12) {
    return false;
  }

  const total = getPercentageTotal(table, percentageColumn);

  // A percentage/share column that approximately adds up to 100 represents
  // composition of a whole and should stay a pie chart, not become scatter.
  return total !== null && total >= 98 && total <= 102;
}

function buildCategoryChart(
  table: ChatTable,
  labelColumn: string,
  valueColumn: string,
  numericColumns: string[],
): SuggestedChart | undefined {
  const unit = inferUnit(valueColumn);

  if (shouldRenderAsDistribution(table, labelColumn, numericColumns)) {
    const percentageColumn = numericColumns.find(isPercentageLikeColumn);
    const data = table.rows.reduce<PieChartPoint[]>((items, row) => {
      const rawLabel = row[labelColumn];
      const value = toFiniteNumericValue(row[valueColumn]);
      const percent = percentageColumn
        ? toFiniteNumericValue(row[percentageColumn])
        : null;

      if (rawLabel === null || rawLabel === undefined || rawLabel === '' || value === null) {
        return items;
      }

      items.push({
        name: String(rawLabel).trim(),
        value,
        ...(percent !== null ? { percent } : {}),
      });

      return items;
    }, []);

    if (!data.length) {
      return undefined;
    }

    return {
      type: 'pie',
      title: `${formatColumnLabel(valueColumn)} بر اساس ${formatColumnLabel(labelColumn)}`,
      description: '',
      data,
      unit,
      height: 420,
    };
  }

  const data = table.rows.reduce<ChartPoint[]>((items, row) => {
    const rawLabel = row[labelColumn];
    const value = toFiniteNumericValue(row[valueColumn]);

    if (rawLabel === null || rawLabel === undefined || rawLabel === '' || value === null) {
      return items;
    }

    items.push({
      label: String(rawLabel).trim(),
      value,
    });

    return items;
  }, []);

  if (!data.length) {
    return undefined;
  }

  const chartType = isDateLikeColumn(labelColumn) ? 'line' : 'bar';

  return {
    type: chartType,
    title: `${formatColumnLabel(valueColumn)} بر اساس ${formatColumnLabel(labelColumn)}`,
    description: '',
    data,
    seriesName: formatColumnLabel(valueColumn),
    unit,
    height: chartType === 'line' ? 360 : 420,
  };
}

function getScatterMetricColumns(numericColumns: string[]) {
  const nonIdentifierColumns = numericColumns.filter(
    (column) => !isIdentifierLikeColumn(column),
  );

  return nonIdentifierColumns.length >= 2 ? nonIdentifierColumns : numericColumns;
}

function buildScatterChart(
  table: ChatTable,
  labelColumn: string | undefined,
  numericColumns: string[],
): SuggestedChart | undefined {
  const metricColumns = getScatterMetricColumns(numericColumns);

  if (metricColumns.length < 2) {
    return undefined;
  }

  const [xAxis, yAxis] = metricColumns;
  const data = table.rows.reduce<ScatterChartPoint[]>((items, row, index) => {
    const xValue = toFiniteNumericValue(row[xAxis]);
    const yValue = toFiniteNumericValue(row[yAxis]);

    if (xValue === null || yValue === null) {
      return items;
    }

    const rawLabel = labelColumn ? row[labelColumn] : null;
    const label =
      rawLabel !== null && rawLabel !== undefined && rawLabel !== ''
        ? String(rawLabel).trim()
        : `نقطه ${index + 1}`;

    items.push({
      rank: label,
      previousScore: xValue,
      currentScore: yValue,
      supervisionScore: 0,
      growth: 1,
      rawRow: row,
    });

    return items;
  }, []);

  if (!data.length) {
    return undefined;
  }

  return {
    type: 'scatter',
    title: `${formatColumnLabel(yAxis)} در برابر ${formatColumnLabel(xAxis)}`,
    description: `مقایسه دو شاخص عددی «${formatColumnLabel(xAxis)}» و «${formatColumnLabel(yAxis)}»`,
    data,
    xAxisName: formatColumnLabel(xAxis),
    yAxisName: formatColumnLabel(yAxis),
    unit: '',
    height: 440,
  };
}

/**
 * JiraKav fallback chart inference.
 * The API chart_config remains the first priority. When chart_config is absent,
 * infer chart type from the backend result shape using the same visualization
 * contract: distribution -> pie, time-series -> line, two numeric metrics ->
 * scatter, category/value -> bar, single aggregate -> KPI/gauge.
 */
export function buildJirakavChartFromResponse(
  response: ChatResponse,
): SuggestedChart | undefined {
  const table = response.table;

  if (!table || !table.rows.length || !table.columns.length) {
    return undefined;
  }

  const numericColumns = getNumericColumns(table);

  if (!numericColumns.length) {
    return undefined;
  }

  if (table.rows.length === 1) {
    return buildSingleRowChart(table, numericColumns);
  }

  const labelColumn = findLabelColumn(table, numericColumns);

  if (labelColumn && shouldRenderAsDistribution(table, labelColumn, numericColumns)) {
    const valueColumn = findValueColumn(numericColumns);
    return buildCategoryChart(table, labelColumn, valueColumn, numericColumns);
  }

  if (labelColumn && isDateLikeColumn(labelColumn)) {
    const valueColumn = findValueColumn(numericColumns);
    return buildCategoryChart(table, labelColumn, valueColumn, numericColumns);
  }

  if (numericColumns.length >= 2) {
    const scatterChart = buildScatterChart(table, labelColumn, numericColumns);

    if (scatterChart) {
      return scatterChart;
    }
  }

  const valueColumn = findValueColumn(numericColumns);

  if (!labelColumn || !valueColumn) {
    return undefined;
  }

  return buildCategoryChart(table, labelColumn, valueColumn, numericColumns);
}
