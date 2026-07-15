import type { StageDefinition } from "@/data/stageSchema";

export function StoryScreen({ stage, onStart }: { stage: StageDefinition; onStart: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-12 text-center">
      <div className="text-green-500">
        {stage.stage} 「{stage.title}」
      </div>
      <div className="whitespace-pre-wrap text-green-200">{stage.storyText}</div>
      <button
        onClick={onStart}
        className="rounded border border-green-600 bg-green-950 px-6 py-2 text-green-200 hover:bg-green-900"
      >
        はじめる
      </button>
    </div>
  );
}
