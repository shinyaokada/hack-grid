"use client";

import { useState } from "react";
import { TerminalPane } from "@/components/TerminalPane";
import type { StageDefinition } from "@/data/stageSchema";
import { useGameSession } from "@/hooks/useGameSession";

const MAX_PANES = 3;

/**
 * All terminal panes for a stage share one game session (same host, same
 * filesystem) - running a command in one pane is visible from every pane,
 * like several terminal windows open onto the same machine.
 */
export function StagePlayArea({ stage }: { stage: StageDefinition }) {
  const [session, dispatch] = useGameSession(stage);
  const [paneCount, setPaneCount] = useState(1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[60vh] gap-2 overflow-x-auto">
        {Array.from({ length: paneCount }).map((_, i) => (
          <TerminalPane
            key={i}
            label={paneCount > 1 ? `ターミナル ${i + 1}` : "ターミナル"}
            session={session}
            dispatch={dispatch}
            onClose={i > 0 ? () => setPaneCount((n) => n - 1) : undefined}
          />
        ))}
      </div>
      {paneCount < MAX_PANES && (
        <button
          onClick={() => setPaneCount((n) => Math.min(MAX_PANES, n + 1))}
          className="self-start rounded border border-green-800 px-2 py-1 text-xs text-green-500 hover:bg-green-950"
        >
          + ターミナルを分割（同じセッションを共有します）
        </button>
      )}
    </div>
  );
}
