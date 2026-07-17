"use client";

import { useState } from "react";
import { TerminalPane } from "@/components/TerminalPane";
import type { StageDefinition } from "@/data/stageSchema";

const MAX_PANES = 3;

/**
 * Each terminal pane is a fully independent session (its own copy of the
 * filesystem, current directory, and log) - like opening separate terminal
 * windows against separate machines, not multiple views of one session.
 */
export function StagePlayArea({ stage }: { stage: StageDefinition }) {
  const [paneIds, setPaneIds] = useState<number[]>([0]);
  const [nextId, setNextId] = useState(1);

  function addPane() {
    setPaneIds((prev) => (prev.length >= MAX_PANES ? prev : [...prev, nextId]));
    setNextId((n) => n + 1);
  }

  function closePane(id: number) {
    setPaneIds((prev) => (prev.length <= 1 ? prev : prev.filter((paneId) => paneId !== id)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[80vh] gap-2 overflow-x-auto">
        {paneIds.map((id, i) => (
          <TerminalPane
            key={id}
            stage={stage}
            label={paneIds.length > 1 ? `ターミナル ${i + 1}` : "ターミナル"}
            onClose={paneIds.length > 1 ? () => closePane(id) : undefined}
          />
        ))}
      </div>
      {paneIds.length < MAX_PANES && (
        <button
          onClick={addPane}
          className="self-start rounded border border-green-800 px-2 py-1 text-xs text-green-500 hover:bg-green-950"
        >
          + ターミナルを分割（独立したセッションになります）
        </button>
      )}
    </div>
  );
}
