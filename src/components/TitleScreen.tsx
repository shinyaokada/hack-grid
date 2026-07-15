export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 py-24 text-center">
      <div className="font-mono text-4xl text-green-300">
        $ <span className="animate-pulse">_</span>
      </div>
      <div className="text-lg text-green-400">ハッキング風パズルゲーム</div>
      <button
        onClick={onStart}
        className="rounded border border-green-600 bg-green-950 px-6 py-2 text-green-200 hover:bg-green-900"
      >
        はじめる
      </button>
      <div className="text-xs text-green-800">ver1</div>
    </div>
  );
}
