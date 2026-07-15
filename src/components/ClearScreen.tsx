import type { StageDefinition } from "@/data/stageSchema";

export function ClearScreen({
  stage,
  hasNext,
  isFirstStage,
  onNext,
  onHome,
  onContinue,
}: {
  stage: StageDefinition;
  hasNext: boolean;
  isFirstStage: boolean;
  onNext: () => void;
  onHome: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-12 text-center">
      <div className="text-3xl font-bold text-green-300">クリア</div>
      <div className="text-green-200">気づき: 「{stage.notice}」</div>
      <div className="flex gap-4">
        {isFirstStage ? (
          <button
            onClick={onContinue}
            className="rounded border border-green-600 bg-green-950 px-4 py-2 hover:bg-green-900"
          >
            つづける
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
