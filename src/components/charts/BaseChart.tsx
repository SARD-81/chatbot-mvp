import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ECharts } from 'echarts';
import type { BaseChartProps } from './types';
import { chartFontFamily } from './chartTheme';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BaseChart({
  title,
  description,
  option,
  height = 360,
  loading = false,
  empty = false,
  emptyText = 'داده‌ای برای نمایش وجود ندارد',
  className,
  onRefresh,
}: BaseChartProps) {
  const chartRef = useRef<ReactECharts>(null);

  const normalizedOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: chartFontFamily,
      },
      ...option,
    }),
    [option],
  );

  const downloadImage = () => {
    const instance = chartRef.current?.getEchartsInstance() as ECharts | undefined;
    if (!instance) return;

    const url = instance.getDataURL({
      type: 'png',
      pixelRatio: 3,
      backgroundColor: 'transparent',
    });

    const link = document.createElement('a');
    link.href = url;
    link.download = `${title ?? 'chart'}.png`;
    link.click();
  };

  return (
    <section dir="rtl" className={cx('enterprise-chart-card', className)}>
      <div className="enterprise-chart-header">
        <div className="enterprise-chart-heading">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </div>

        <div className="enterprise-chart-actions">
          {onRefresh ? (
            <button type="button" className="message-action-button" onClick={onRefresh}>
              بروزرسانی
            </button>
          ) : null}

          <button type="button" className="message-action-button" onClick={downloadImage}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            PNG
          </button>
        </div>
      </div>

      <div className="enterprise-chart-body" style={{ height }}>
        {empty ? (
          <div className="enterprise-chart-empty">
            <div className="enterprise-chart-empty-icon">—</div>
            <p>{emptyText}</p>
          </div>
        ) : (
          <ReactECharts
            ref={chartRef}
            option={normalizedOption}
            notMerge
            lazyUpdate
            showLoading={loading}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        )}
      </div>
    </section>
  );
}
