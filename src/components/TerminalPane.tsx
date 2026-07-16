"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@/engine/types";

export function TerminalPane({
  label,
  session,
  dispatch,
  onClose,
}: {
  label: string;
  session: Session;
  dispatch: (raw: string) => void;
  onClose?: () => void;
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const state = session.state;

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [state.log.length]);

  function submit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    dispatch(trimmed);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(null);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  }

  return (
    <div className="flex h-full min-w-[280px] flex-1 flex-col gap-1 font-mono text-sm text-green-200">
      <div className="flex items-center justify-between text-xs text-green-700">
        <span>{label}</span>
        {onClose && (
          <button onClick={onClose} className="px-1 text-red-500 hover:text-red-300">
            ×閉じる
          </button>
        )}
      </div>
      <div
        className="min-h-0 flex-1 cursor-text overflow-y-auto rounded border border-green-900 bg-black/80 p-3"
        onClick={() => inputRef.current?.focus()}
      >
        {state.log.map((entry) => (
          <div key={entry.id}>
            {!entry.isSystem && <div className="text-green-400">$ {entry.commandText}</div>}
            {entry.lines.map((line, i) => (
              <div
                key={i}
                className={
                  entry.isSystem
                    ? "text-cyan-400"
                    : entry.isError
                      ? "text-red-400"
                      : "whitespace-pre-wrap text-green-200"
                }
              >
                {line}
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-green-500">$</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="コマンド入力"
            className="flex-1 bg-transparent text-green-200 outline-none"
          />
        </div>
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
