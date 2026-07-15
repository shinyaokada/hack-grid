import type { StageDefinition } from "@/data/stageSchema";

export function ClearScreen({
  stage,
  hasNext,
  onNext,
  onHome,
}: {
  stage: StageDefinition;
  hasNext: boolean;
  onNext: () => void;
  onHome: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-12 text-center">
      <div className="text-3xl font-bold text-green-300">クリア</div>
      <div className="text-green-200">気づき: 「{stage.notice}」</div>
      <div className="flex gap-4">
        {hasNext && (
          <button
            onClick={onNext}
            className="rounded border border-green-600 bg-green-950 px-4 py-2 hover:bg-green-900"
          >
            次のステージへ
          </button>
        )}
        <button
          onClick={onHome}
          className="rounded border border-green-700 px-4 py-2 hover:bg-green-900"
        >
          ホームへ戻る
        </button>
      </div>
    </div>
  );
}
