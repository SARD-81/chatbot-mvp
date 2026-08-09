import type { ChatResponse } from './api';
import type {
  ChartPoint,
  PieChartPoint,
  ScatterChartPoint,
} from '../components/charts/types';

export type ChatMessageRole = 'user' | 'assistant';

export type SuggestedChartType = 'line' | 'bar' | 'pie' | 'gauge' | 'scatter';

export type SuggestedChart =
  | {
      type: 'line';
      title?: string;
      description?: string;
      data: ChartPoint[];
      unit?: string;
      seriesName?: string;
      height?: number;
    }
  | {
      type: 'bar';
      title?: string;
      description?: string;
      data: ChartPoint[];
      unit?: string;
      seriesName?: string;
      height?: number;
    }
  | {
      type: 'pie';
      title?: string;
      description?: string;
      data: PieChartPoint[];
      unit?: string;
      valueLabel?: string;
      showPercentRow?: boolean;
      height?: number;
    }
  | {
      type: 'gauge';
      title?: string;
      description?: string;
      value: number;
      min?: number;
      max?: number;
      unit?: string;
      label?: string;
      height?: number;
    }
  | {
      type: 'scatter';
      title?: string;
      description?: string;
      data: ScatterChartPoint[];
      xAxisName?: string;
      yAxisName?: string;
      unit?: string;
      height?: number;
    };

export type SuggestedPrompt = {
  id: string;
  title: string;
  prompt: string;
  chart?: SuggestedChart;
};

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: Date;
  response?: ChatResponse;
  error?: string;
  chart?: SuggestedChart;
  suggestedPrompts?: SuggestedPrompt[];
}
