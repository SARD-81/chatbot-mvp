import { useEffect, useState } from 'react';
import { Download, Maximize2, X } from 'lucide-react';
import type { ChatMetadata, ChatTable } from '../types/api';
import { getDownloadUrl } from '../lib/api';

interface ResultTableProps {
  table: ChatTable;
  metadata?: ChatMetadata;
}

interface TableViewProps {
  table: ChatTable;
  mode?: 'inline' | 'modal';
}

function formatColumnName(column: string) {
  const normalized = column.replaceAll('_', ' ');

  if (normalized.length <= 46) {
    return normalized;
  }

  return `${normalized.slice(0, 46)}...`;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[\u06F0-\u06F9]/g, (digit) => String('\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'.indexOf(digit)))
    .replace(/[\u0660-\u0669]/g, (digit) => String('\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'.indexOf(digit)));
}

function isDateLikeColumn(columnName: string) {
  const normalizedColumn = columnName.toLowerCase().trim();

  return (
    normalizedColumn.includes('date') ||
    normalizedColumn.includes('time') ||
    normalizedColumn.includes('created_at') ||
    normalizedColumn.includes('updated_at') ||
    normalizedColumn.includes('jalali') ||
    normalizedColumn.includes('shamsi') ||
    normalizedColumn.includes('persian_date') ||
    normalizedColumn.includes('tarikh') ||
    normalizedColumn.includes('\u062A\u0627\u0631\u06CC\u062E') ||
    normalizedColumn.includes('\u062A\u0627\u0631\u06CC\u062E') ||
    normalizedColumn.includes('\u0632\u0645\u0627\u0646')
  );
}

function formatJalaliCompactDate(value: unknown) {
  const rawValue = normalizeDigits(String(value).trim());

  const cleanedValue = rawValue.replace(/[^\d]/g, '');

  if (!/^(13|14)\d{6}$/.test(cleanedValue)) {
    return null;
  }

  const year = cleanedValue.slice(0, 4);
  const month = cleanedValue.slice(4, 6);
  const day = cleanedValue.slice(6, 8);

  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  if (dayNumber < 1 || dayNumber > 31) {
    return null;
  }

  return `${year}/${month}/${day}`;
}

function formatAlreadySeparatedDate(value: unknown) {
  const rawValue = normalizeDigits(String(value).trim());

  const match = rawValue.match(/^(13|14)(\d{2})[-/.](\d{1,2})[-/.](\d{1,2})$/);

  if (!match) {
    return null;
  }

  const year = `${match[1]}${match[2]}`;
  const month = match[3].padStart(2, '0');
  const day = match[4].padStart(2, '0');

  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  if (dayNumber < 1 || dayNumber > 31) {
    return null;
  }

  return `${year}/${month}/${day}`;
}

function formatDateValue(value: unknown) {
  return formatAlreadySeparatedDate(value) ?? formatJalaliCompactDate(value);
}

function formatCellValue(value: unknown, columnName: string) {
  if (value === null || value === undefined || value === '') {
    return '\u2014';
  }

  if (isDateLikeColumn(columnName)) {
    const formattedDate = formatDateValue(value);

    if (formattedDate) {
      return formattedDate;
    }

    return String(value);
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString('en-US')
      : value.toLocaleString('en-US', {
          maximumFractionDigits: 4,
        });
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

function TableView({ table, mode = 'inline' }: TableViewProps) {
  const isCompactTable = table.columns.length <= 4 && table.rows.length <= 6;

  return (
    <div
      className={[
        'table-scroll',
        mode === 'modal' ? 'table-scroll-modal' : '',
        isCompactTable ? 'table-scroll-compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <table className="data-table">
        <thead>
          <tr>
            {/* Row index column header */}
            <th style={{ minWidth: 52, maxWidth: 52, width: 52, textAlign: 'center' }}>
              \u0631\u062F\u06CC\u0641
            </th>
            {table.columns.map((column) => (
              <th key={column} title={column}>
                {formatColumnName(column)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {/* Row index cell */}
              <td style={{ minWidth: 52, maxWidth: 52, width: 52, textAlign: 'center', color: '#8a98ad', fontWeight: 700, fontSize: 12 }}>
                {rowIndex + 1}
              </td>
              {table.columns.map((column) => {
                const formattedValue = formatCellValue(row[column], column);

                return (
                  <td key={`${rowIndex}-${column}`} title={formattedValue}>
                    {formattedValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultTable({ table, metadata }: ResultTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleRowsCount = table.rows.length;
  const totalRowsCount = table.row_count ?? visibleRowsCount;
  const columnCount = table.columns.length;
  const rowCount = table.rows.length;

  const isCompactTable = columnCount <= 4 && rowCount <= 6;
  const isMediumTable = columnCount <= 8 && rowCount <= 12;

  const downloadUrl = metadata?.download_url
    ? getDownloadUrl(metadata.download_url)
    : null;

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="result-table-card">
        <div className="result-table-header">
          <div>
            <h3>\u0646\u062A\u06CC\u062C\u0647 \u062C\u062F\u0648\u0644\u06CC</h3>
            <p>
              {totalRowsCount > visibleRowsCount
                ? `\u0646\u0645\u0627\u06CC\u0634 ${visibleRowsCount.toLocaleString('fa-IR')} \u0631\u062F\u06CC\u0641 \u0627\u0632 ${totalRowsCount.toLocaleString('fa-IR')} \u0631\u06A9\u0648\u0631\u062F`
                : `${totalRowsCount.toLocaleString('fa-IR')} \u0631\u06A9\u0648\u0631\u062F`}
            </p>
          </div>

          {metadata?.is_truncated && (
            <span className="table-badge">\u0646\u0645\u0627\u06CC\u0634 \u062E\u0644\u0627\u0635\u0647</span>
          )}
        </div>

        <TableView table={table} />

        <div className="result-table-actions">
          <button
            type="button"
            className="table-action-button"
            onClick={() => setIsModalOpen(true)}
          >
            <Maximize2 size={17} />
            \u0628\u0632\u0631\u06AF\u0646\u0645\u0627\u06CC\u06CC \u062C\u062F\u0648\u0644
          </button>

          {downloadUrl && (
            <a
              className="table-action-button table-download-button"
              href={downloadUrl}
              download
              target="_blank"
              rel="noreferrer"
            >
              <Download size={17} />
              {metadata?.is_truncated ? '\u062F\u0627\u0646\u0644\u0648\u062F \u06AF\u0632\u0627\u0631\u0634 \u06A9\u0627\u0645\u0644 CSV' : '\u062F\u0627\u0646\u0644\u0648\u062F CSV'}
            </a>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="table-modal-backdrop"
          role="presentation"
          onMouseDown={() => setIsModalOpen(false)}
        >
          <section
            className={[
              'table-modal',
              isCompactTable ? 'table-modal-compact' : '',
              isMediumTable && !isCompactTable ? 'table-modal-medium' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="dialog"
            aria-modal="true"
            aria-label="\u0628\u0632\u0631\u06AF\u0646\u0645\u0627\u06CC\u06CC \u062C\u062F\u0648\u0644"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="table-modal-header">
              <div>
                <h2>\u0628\u0632\u0631\u06AF\u0646\u0645\u0627\u06CC\u06CC \u062C\u062F\u0648\u0644</h2>
                <p>
                  \u0646\u0645\u0627\u06CC\u0634 {visibleRowsCount.toLocaleString('fa-IR')} \u0631\u062F\u06CC\u0641 \u0627\u0632{' '}
                  {totalRowsCount.toLocaleString('fa-IR')} \u0631\u06A9\u0648\u0631\u062F
                </p>
              </div>

              <div className="table-modal-actions">
                {downloadUrl && (
                  <a
                    className="table-action-button table-download-button"
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={17} />
                    \u062F\u0627\u0646\u0644\u0648\u062F CSV
                  </a>
                )}

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="\u0628\u0633\u062A\u0646"
                >
                  <X size={22} />
                </button>
              </div>
            </header>

            <div className="table-modal-body">
              <TableView table={table} mode="modal" />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
