export function HomeGuideOverlay({
  totalStages,
  onDismiss,
}: {
  totalStages: number;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onDismiss}
    >
      <div
        className="max-w-sm rounded border border-green-700 bg-black p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-center text-green-300">ここがホーム画面</div>
        <ul className="mb-5 list-disc space-y-2 pl-5 text-sm text-green-200">
          <li>次はここから選んで挑戦しよう</li>
          <li>クリアすると記録が残るよ</li>
          <li>全部で {totalStages} ステージあるよ</li>
        </ul>
        <div className="text-center">
          <button
            onClick={onDismiss}
            className="rounded border border-green-600 px-4 py-2 hover:bg-green-900"
          >
            わかった
          </button>
        </div>
      </div>
    </div>
  );
}
