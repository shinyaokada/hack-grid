"use client";

import { useEffect, useReducer, useState } from "react";
import type { CommandName, StageDefinition } from "@/data/stageSchema";
import { getKnownExistingPaths, getVisibleDirs, getVisibleTools } from "@/engine/candidates";
import { applyCommand, createSession } from "@/engine/gameEngine";
import type { Command, Session } from "@/engine/types";

const COMMANDS: { name: CommandName; label: string }[] = [
  { name: "ls", label: "ls" },
  { name: "inspect", label: "inspect" },
  { name: "read", label: "read" },
  { name: "cd", label: "cd" },
  { name: "run", label: "run" },
  { name: "status", label: "status" },
  { name: "help", label: "help" },
  { name: "back", label: "back" },
];

type Pending = null | { type: "cd" | "read" | "inspect" } | { type: "run"; tool?: string };

function sessionReducer(session: Session, command: Command): Session {
  return applyCommand(session, command);
}

export function CliTerminal({
  stage,
  onGoalReady,
}: {
  stage: StageDefinition;
  onGoalReady: (ready: boolean) => void;
}) {
  const [session, dispatch] = useReducer(sessionReducer, stage, createSession);
  const [pending, setPending] = useState<Pending>(null);
  const [seenCommands, setSeenCommands] = useState<Set<CommandName>>(new Set());

  const state = session.state;

  useEffect(() => {
    onGoalReady(state.goalRevealed);
  }, [state.goalRevealed, onGoalReady]);

  function run(command: Command) {
    dispatch(command);
    setPending(null);
  }

  function onPickCommand(name: CommandName) {
    setSeenCommands((prev) => new Set(prev).add(name));
    switch (name) {
      case "ls":
      case "status":
      case "help":
      case "back":
        run({ type: name });
        return;
      case "cd":
      case "read":
      case "inspect":
        setPending({ type: name });
        return;
      case "run":
        setPending({ type: "run" });
        return;
    }
  }

  const visibleTools = getVisibleTools(stage, state);
  const visibleDirs = getVisibleDirs(state);
  const knownPaths = getKnownExistingPaths(state);

  let candidates: string[] = [];
  let candidateLabel = "";
  if (pending?.type === "cd") {
    candidates = visibleDirs;
    candidateLabel = "移動先を選択";
  } else if (pending?.type === "read") {
    candidates = knownPaths;
    candidateLabel = "読み取る対象を選択";
  } else if (pending?.type === "inspect") {
    candidates = visibleTools;
    candidateLabel = "調べる対象を選択";
  } else if (pending?.type === "run" && !pending.tool) {
    candidates = visibleTools;
    candidateLabel = "実行するツールを選択";
  } else if (pending?.type === "run" && pending.tool) {
    candidates = knownPaths;
    candidateLabel = "引数（対象ファイル）を選択";
  }

  function onPickCandidate(value: string) {
    if (!pending) return;
    if (pending.type === "run") {
      if (!pending.tool) {
        setPending({ type: "run", tool: value });
        return;
      }
      run({ type: "run", tool: pending.tool, arg: value });
      return;
    }
    run({ type: pending.type, target: value });
  }

  return (
    <div className="flex flex-col gap-3 font-mono text-sm text-green-200">
      <div className="h-80 overflow-y-auto rounded border border-green-900 bg-black/80 p-3">
        {state.log.length === 0 && <div className="text-green-700">$ _</div>}
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
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMANDS.map((c) => {
          const isNew = stage.newCommands.includes(c.name) && !seenCommands.has(c.name);
          return (
            <button
              key={c.name}
              onClick={() => onPickCommand(c.name)}
              className="relative rounded border border-green-700 bg-green-950 px-3 py-1 hover:bg-green-900"
            >
              {c.label}
              {isNew && (
                <span className="absolute -right-2 -top-2 rounded bg-yellow-500 px-1 text-[10px] font-bold text-black">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {pending && (
        <div className="flex flex-col gap-2 rounded border border-green-900 p-2">
          <div className="text-green-500">{candidateLabel}</div>
          <div className="flex flex-wrap gap-2">
            {candidates.length === 0 && (
              <span className="text-green-700">（候補がありません）</span>
            )}
            {candidates.map((value) => (
              <button
                key={value}
                onClick={() => onPickCandidate(value)}
                className="rounded border border-green-700 px-2 py-1 hover:bg-green-900"
              >
                {value}
              </button>
            ))}
            <button
              onClick={() => setPending(null)}
              className="rounded border border-red-800 px-2 py-1 text-red-400 hover:bg-red-950"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
