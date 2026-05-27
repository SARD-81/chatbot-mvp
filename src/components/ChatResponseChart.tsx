import type { SuggestedChart } from "../types/chat";
import { SuggestedPromptChart } from "./chat/SuggestedPromptChart";

interface ChatResponseChartProps {
  chart: SuggestedChart;
}

export function ChatResponseChart({ chart }: ChatResponseChartProps) {
  return (
    <div className="chat-response-chart">
      <SuggestedPromptChart chart={chart} />
    </div>
  );
}