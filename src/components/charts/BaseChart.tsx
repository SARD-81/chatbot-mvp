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
            <button type="button" className="table-action-button" onClick={onRefresh}>
              بروزرسانی
            </button>
          ) : null}

          <button type="button" className="table-download-button" onClick={downloadImage}>
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
