"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { CommandName, StageDefinition } from "@/data/stageSchema";
import { CommandDocs } from "@/components/CommandDocs";
import { applyRawInput, createSession } from "@/engine/gameEngine";
import { parseInput } from "@/engine/parser";
import type { Session } from "@/engine/types";

function sessionReducer(session: Session, raw: string): Session {
  return applyRawInput(session, raw);
}

export function CliTerminal({
  stage,
  usedCommands,
  onCommandUsed,
}: {
  stage: StageDefinition;
  usedCommands: Set<CommandName>;
  onCommandUsed: (name: CommandName) => void;
}) {
  const [session, dispatch] = useReducer(sessionReducer, stage, createSession);
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
    const parsed = parseInput(trimmed);
    if ("command" in parsed) {
      onCommandUsed(parsed.command.type);
    }
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
    <div className="flex flex-col gap-4 font-mono text-sm text-green-200 md:flex-row">
      <div
        className="h-80 min-w-0 flex-1 cursor-text overflow-y-auto rounded border border-green-900 bg-black/80 p-3"
        onClick={() => inputRef.current?.focus()}
      >
        {state.log.map((entry) => (
          <div key={entry.id} className={entry.reverted ? "opacity-40" : ""}>
            <div className="text-green-400">$ {entry.commandText}</div>
            {entry.lines.map((line, i) => (
              <div
                key={i}
                className={entry.isError ? "text-red-400" : "whitespace-pre-wrap text-green-200"}
              >
                {line}
              </div>
            ))}
            {entry.reverted && <div className="text-yellow-500">（取り消し済み）</div>}
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

      <CommandDocs stage={stage} usedCommands={usedCommands} />
    </div>
  );
}
