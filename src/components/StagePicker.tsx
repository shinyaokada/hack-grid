import type { StageDefinition } from "@/data/stageSchema";
import { isStageUnlocked } from "@/data/stages";

export function StagePicker({
  stages,
  clearedIds,
  onSelect,
}: {
  stages: StageDefinition[];
  clearedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 py-8">
      <div className="text-center text-green-400">
        {clearedIds.size} / {stages.length} クリア
      </div>
      {stages.map((stage) => {
        const unlocked = isStageUnlocked(stage.stage, clearedIds);
        const cleared = clearedIds.has(stage.stage);
        return (
          <button
            key={stage.stage}
            disabled={!unlocked}
            onClick={() => onSelect(stage.stage)}
            className={`flex items-center justify-between rounded border px-4 py-3 text-left ${
              unlocked
                ? "border-green-700 hover:bg-green-900"
                : "cursor-not-allowed border-green-950 text-green-800"
            }`}
          >
            <span>
              <span className="text-green-500">{stage.stage}</span> {stage.title}
            </span>
            <span className="text-xs">
              {cleared ? "クリア済み" : unlocked ? "挑戦中" : `${stage.lockCondition}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
