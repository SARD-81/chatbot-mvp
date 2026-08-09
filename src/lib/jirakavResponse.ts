import type { ChatResponse, ChatTable, ChatTableRow } from '../types/api';

const NON_HOUR_UNIT_HINTS = ['second', 'seconds', 'minute', 'minutes', 'ثانیه', 'ثانيه', 'دقیقه', 'دقيقه'];

function normalizeColumnName(columnName: string) {
  return columnName
    .toLowerCase()
    .replace(/[\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isHourLikeColumn(columnName: string) {
  const normalizedColumn = normalizeColumnName(columnName);

  if (NON_HOUR_UNIT_HINTS.some((hint) => normalizedColumn.includes(hint))) {
    return false;
  }

  return (
    normalizedColumn.includes('hour') ||
    normalizedColumn.includes('ساعت') ||
    normalizedColumn.includes('time spent') ||
    normalizedColumn.includes('spent time') ||
    normalizedColumn.includes('timespent') ||
    normalizedColumn.includes('زمان صرف شده') ||
    normalizedColumn.includes('زمان صرف شده') ||
    normalizedColumn.includes('زمان صرف')
  );
}

export function roundToHalfHour(value: number) {
  const roundedValue = Math.round((value + Number.EPSILON) * 2) / 2;
  return Object.is(roundedValue, -0) ? 0 : roundedValue;
}

function normalizeLocalizedDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');
}

function parseNumericValue(value: string) {
  const normalizedValue = normalizeLocalizedDigits(value).trim();

  if (!normalizedValue) {
    return null;
  }

  let numericText = normalizedValue;

  if (numericText.includes(',') && !numericText.includes('.')) {
    numericText = numericText.replace(',', '.');
  } else {
    numericText = numericText.replace(/,/g, '');
  }

  const numericValue = Number(numericText);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatHalfHour(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function roundHourCellValue(value: unknown): unknown {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return roundToHalfHour(value);
  }

  if (typeof value !== 'string') {
    return value;
  }

  const numericValue = parseNumericValue(value);

  if (numericValue !== null) {
    return roundToHalfHour(numericValue);
  }

  return roundHourMentions(value);
}

function roundHourTable(table: ChatTable): ChatTable {
  const hourColumns = table.columns.filter(isHourLikeColumn);

  if (!hourColumns.length) {
    return table;
  }

  const rows = table.rows.map<ChatTableRow>((row) => {
    const nextRow = { ...row };

    hourColumns.forEach((column) => {
      nextRow[column] = roundHourCellValue(row[column]);
    });

    return nextRow;
  });

  return {
    ...table,
    rows,
  };
}

function roundNumericToken(value: string) {
  const numericValue = parseNumericValue(value);
  return numericValue === null ? value : formatHalfHour(roundToHalfHour(numericValue));
}

export function roundHourMentions(text: string) {
  const numericToken = '[\\d۰-۹٠-٩]+(?:[.,٫][\\d۰-۹٠-٩]+)?';
  const hourUnit = '(?:ساعت|hours?)';
  const numberBeforeUnitPattern = new RegExp(`(${numericToken})(\\s*${hourUnit})`, 'gi');
  const unitBeforeNumberPattern = new RegExp(`(${hourUnit}\\s*[:：]?\\s*)(${numericToken})`, 'gi');

  return text
    .replace(numberBeforeUnitPattern, (_match, rawNumber: string, suffix: string) => {
      return `${roundNumericToken(rawNumber)}${suffix}`;
    })
    .replace(unitBeforeNumberPattern, (_match, prefix: string, rawNumber: string) => {
      return `${prefix}${roundNumericToken(rawNumber)}`;
    });
}

export function normalizeJirakavResponse(response: ChatResponse): ChatResponse {
  const normalizedTable = response.table ? roundHourTable(response.table) : response.table;
  const normalizedAnswer = response.answer ? roundHourMentions(response.answer) : response.answer;

  if (normalizedTable === response.table && normalizedAnswer === response.answer) {
    return response;
  }

  return {
    ...response,
    answer: normalizedAnswer,
    table: normalizedTable,
  };
}
