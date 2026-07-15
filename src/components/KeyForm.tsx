"use client";

import { useState } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];

export function KeyForm({
  digits,
  answer,
  onCorrect,
  onBack,
}: {
  digits: number;
  answer: string;
  onCorrect: () => void;
  onBack: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleKey(key: string) {
    if (key === "C") {
      setError(false);
      setValue("");
      return;
    }
    if (key === "OK") {
      if (value === answer) {
        onCorrect();
      } else {
        setError(true);
        setValue("");
      }
      return;
    }
    if (value.length >= digits) return;
    setError(false);
    setValue((v) => v + key);
  }

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-4 text-center">
      <div className="text-green-300">見つけた番号を入力してください</div>
      <div className="flex gap-2">
        {Array.from({ length: digits }).map((_, i) => (
          <div
            key={i}
            className="flex h-10 w-8 items-center justify-center rounded border border-green-700 font-mono text-lg text-green-200"
          >
            {value[i] ?? ""}
          </div>
        ))}
      </div>
      {error && <div className="text-red-400">番号が違います。もう一度確認しよう</div>}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            className="rounded border border-green-700 px-4 py-2 font-mono hover:bg-green-900"
            onClick={() => handleKey(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <button className="text-green-500 underline" onClick={onBack}>
        CLI画面に戻って確認する
      </button>
    </div>
  );
}
