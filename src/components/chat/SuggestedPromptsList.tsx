import type { SuggestedPrompt } from '@/types/chat';
import { SuggestedPromptChart } from './SuggestedPromptChart';

type SuggestedPromptsListProps = {
  items: SuggestedPrompt[];
  onSelectPrompt?: (prompt: string) => void;
};

export function SuggestedPromptsList({
  items,
  onSelectPrompt,
}: SuggestedPromptsListProps) {
  if (!items.length) return null;

  return (
    <div dir="rtl" className="suggested-prompts-panel">
      {items.map((item, index) => {
        const hasChart = Boolean(item.chart);

        return (
          <div key={item.id} className="suggested-prompt-card">
            <button
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt)}
              className="suggested-prompt-button"
            >
              <span className="suggested-prompt-text">
                <strong>{item.title}</strong>
                <small>{item.prompt}</small>
              </span>

              <span className="suggested-prompt-index">{index + 1}</span>
            </button>

            {hasChart ? (
              <div className="suggested-prompt-chart">
                <SuggestedPromptChart chart={item.chart!} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
