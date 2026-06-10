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
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
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
    normalizedColumn.includes('تاریخ') ||
    normalizedColumn.includes('تاريخ') ||
    normalizedColumn.includes('زمان')
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
    return '—';
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
            <th style={{ minWidth: '68px', width: '68px', textAlign: 'center', padding: '0 12px' }}>ردیف</th>
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
              <td style={{ textAlign: 'center', color: '#8a98ad', fontWeight: 700, minWidth: '68px', width: '68px', padding: '0 12px' }}>
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
            <h3>نتیجه جدولی</h3>
            <p>
              {totalRowsCount > visibleRowsCount
                ? `نمایش ${visibleRowsCount.toLocaleString('fa-IR')} ردیف از ${totalRowsCount.toLocaleString('fa-IR')} رکورد`
                : `${totalRowsCount.toLocaleString('fa-IR')} رکورد`}
            </p>
          </div>

          {metadata?.is_truncated && (
            <span className="table-badge">نمایش خلاصه</span>
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
            بزرگنمایی جدول
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
              {metadata?.is_truncated ? 'دانلود گزارش کامل CSV' : 'دانلود CSV'}
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
  aria-label="بزرگنمایی جدول"
  onMouseDown={(event) => event.stopPropagation()}
>
            <header className="table-modal-header">
              <div>
                <h2>بزرگنمایی جدول</h2>
                <p>
                  نمایش {visibleRowsCount.toLocaleString('fa-IR')} ردیف از{' '}
                  {totalRowsCount.toLocaleString('fa-IR')} رکورد
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
                    دانلود CSV
                  </a>
                )}

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="بستن"
                >
                  <X size={22} />
                </button>
              </div>
            </header>

            <div className="table-modal-body">
              <TableView
  table={table}
  mode="modal"
/>
            </div>
          </section>
        </div>
      )}
    </>
  );
}