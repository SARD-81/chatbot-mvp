import type { ChatResponse } from './api';
import type { ChartPoint, PieChartPoint } from '../components/charts/types';

export type ChatMessageRole = 'user' | 'assistant';

export type SuggestedChartType = 'line' | 'bar' | 'pie' | 'gauge';

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